import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../services/firebase";
import { Booking, CategorizedBookings } from "./booking.type";
import { validateBooking, validateBookingUpdate } from "./booking.validator";
import { CustomError } from "../../errors";
import { getLocationNameFromCoordinates } from "../../services/google-maps/location.service";

// Helper function to get a document and its reference
async function getDocument(collection: string, id: string) {
  const docRef = db?.collection(collection)?.doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new CustomError(
      `Document with ID: ${id} does not exist in ${collection}.`,
      404
    );
  }

  return { doc, docRef };
}

// Create a new booking
export const createBooking = async (bookingData: Booking): Promise<Booking> => {
  try {
    await validateBooking(bookingData);

    const locationName = await getLocationNameFromCoordinates(
      bookingData?.location?.latitude,
      bookingData?.location?.longitude
    );

    // Fetch associated worker, subservice, and service
    const { doc: worker, docRef: workerRef } = await getDocument(
      "workers",
      bookingData?.workerId
    );
    const { doc: subservice } = await getDocument(
      "subservices",
      bookingData?.subserviceId
    );
    const { doc: service } = await getDocument(
      "services",
      subservice?.data()?.serviceId
    );

    let booking: Booking = {
      ...bookingData,
      dateTime: Timestamp?.fromDate(new Date(bookingData?.dateTime as string)),
      locationName: locationName ?? "",
      clientName: worker?.data()?.name,
      workerName: worker?.data()?.name,
      serviceName: service?.data()?.name,
      subserviceName: subservice?.data()?.name,
      serviceAvatar: service?.data()?.avatar,
      timestamps: { createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
    };

    const result = await db?.runTransaction(async (transaction) => {
      const bookingRef = db?.collection("bookings")?.doc();

      booking = { ...booking, id: bookingRef?.id };

      // Update availability status and waiting list of worker
      const waitingList = worker?.data()?.waitingList;

      transaction.update(workerRef, {
        waitingList: waitingList === 0 ? 1 : waitingList + 1,
        available: false,
      });

      transaction.set(bookingRef, booking);

      return booking;
    });

    console.log("Booking created successfully!");

    return result;
  } catch (error) {
    console.error("Error creating Booking:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Get all bookings as IDs or filtered by clientId, workerId, and categorized into current and past bookings
export const getBookings = async (
  clientId?: string,
  workerId?: string
): Promise<string[] | CategorizedBookings> => {
  try {
    // Filter bookings by status
    const filterBookingsByStatus = (bookings: Booking[], status: string) => {
      return bookings.filter((booking) => booking.status === status);
    };

    // Categorize bookings into current and past
    const categorizeBookings = (bookings: Booking[]) => {
      const currentBookings = filterBookingsByStatus(
        bookings,
        "Pending"
      ).concat(filterBookingsByStatus(bookings, "Not Completed"));
      const pastBookings = filterBookingsByStatus(bookings, "Completed");

      return { currentBookings, pastBookings };
    };

    let query: FirebaseFirestore.Query = db.collection("bookings");

    // Filter bookings by clientId, workerId, if provided
    if (clientId) query = query.where("clientId", "==", clientId);
    if (workerId) query = query.where("workerId", "==", workerId);

    query = query.orderBy("dateTime", "asc");

    const querySnapshot = await query.get();

    // Map booking documents to BookingInfo objects
    const bookings = querySnapshot.docs
      .map((booking) => {
        let bookingData = booking.data();
        bookingData = {
          ...bookingData,
          dateTime: bookingData.dateTime.toDate().toISOString(),
        };

        return bookingData as Booking;
      })
      .filter(Boolean);

    if (clientId || workerId) {
      return categorizeBookings(bookings);
    } else {
      return querySnapshot.docs.map((booking) => booking.id);
    }
  } catch (error) {
    console.error("Error getting bookings:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Get a booking by ID
export const getBookingById = async (id: string): Promise<Booking> => {
  try {
    const { doc: booking } = await getDocument("bookings", id);

    let bookingData = booking?.data() as Booking;

    // Convert dateTime from timestamp to ISO8601 string
    const dateTime = bookingData?.dateTime as Timestamp;

    bookingData = {
      ...bookingData,
      dateTime: dateTime.toDate().toISOString(),
    };

    return bookingData;
  } catch (error) {
    console.error("Error getting booking:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Check whether the client has an unrated completed work
export const unratedCompletedWork = async (
  clientId: string
): Promise<Booking> => {
  try {
    const bookings = await db
      ?.collection("bookings")
      ?.where("clientId", "==", clientId)
      ?.where("status", "==", "Completed")
      ?.where("hasRated", "==", false)
      ?.get();

    if (bookings?.empty) {
      console.log("No unrated completed work found!");
      return {} as Booking;
    } else {
      return bookings.docs.map((booking) => booking.data() as Booking)[0];
    }
  } catch (error) {
    console.error(
      "Error checking unrated completed work:",
      error
    );
    throw new CustomError(`${error}`, 400);
  }
};

// Update a booking by ID
export const updateBookingById = async (
  id: string,
  bookingData: Partial<Booking>
): Promise<Partial<Booking>> => {
  try {
    validateBookingUpdate(bookingData);

    const bookingRef = db?.collection("bookings")?.doc(id);

    await bookingRef.update({
      ...bookingData,
      timestamps: {
        updatedAt: Timestamp.now(),
      },
    });
    console.log(`Booking with ID: ${id} updated successfully!`);

    return bookingData;
  } catch (error) {
    console.error(`Error updating Booking:`, error);
    throw new CustomError(`${error}`, 400);
  }
};

// Delete a booking
export const deleteBookingById = async (id: string): Promise<boolean> => {
  try {
    const result = await db?.runTransaction(async (transaction) => {
      const { doc: booking, docRef: bookingRef } = await getDocument(
        "bookings",
        id
      );
      if (!booking) {
        console.log(`Booking with ID: ${id} does not exist.`);
        return false;
      }

      // Update availability status and waiting list of worker
      const workerId = booking?.data()?.workerId;
      const { doc: worker, docRef: workerRef } = await getDocument(
        "workers",
        workerId
      );

      if (!worker) {
        throw new CustomError(
          `Worker with ID: ${workerId} does not exist.`,
          404
        );
      }

      const waitingList = worker?.data()?.waitingList;

      transaction.update(workerRef, {
        waitingList: waitingList - 1,
        available: waitingList === 1 ? true : false,
      });

      transaction.delete(bookingRef);
      console.log(`Booking with ID: ${id} deleted successfully.`);

      return true;
    });

    return result;
  } catch (error) {
    console.error(`Error deleting Booking:`, error);
    return false;
  }
};
