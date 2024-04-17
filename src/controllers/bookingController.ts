import { Timestamp } from "firebase-admin/firestore";
import { db } from "../services/firebase";
import { Booking, BookingInfo, CategorizedBookings } from "../types/booking";
import {
  validateBooking,
  validateBookingUpdate,
} from "../validators/bookingValidator";
import { CustomError } from "../errors";
import { getLocationNameFromCoordinates } from "../services/googleMapsService";

// Create a new booking
export const createBooking = async (bookingData: Booking): Promise<Booking> => {
  validateBooking(bookingData);

  try {
    const locationName = await getLocationNameFromCoordinates(
      bookingData?.location?.latitude,
      bookingData?.location?.longitude
    );

    // Fetch associated worker, subservice, and service
    const workerRef = db?.collection("workers")?.doc(bookingData?.workerId);
    const worker = await workerRef.get();

    if (!worker.exists) {
      throw new CustomError(
        `Worker with ID: ${bookingData?.workerId} does not exist.`,
        404
      );
    }

    const subserviceRef = db
      ?.collection("subservices")
      ?.doc(bookingData?.subserviceId);
    const subservice = await subserviceRef.get();

    if (!subservice.exists) {
      throw new CustomError(
        `Subservice with ID: ${bookingData?.subserviceId} does not exist.`,
        404
      );
    }

    const serviceRef = db
      ?.collection("services")
      ?.doc(subservice?.data()?.serviceId);
    const service = await serviceRef.get();

    if (!service.exists) {
      throw new CustomError(
        `Service with ID: ${subservice?.data()?.serviceId} does not exist.`,
        404
      );
    }

    const booking: Booking = {
      ...bookingData,
      locationName: locationName ?? "",
      workerName: worker?.data()?.name,
      serviceName: service?.data()?.name,
      subserviceName: subservice?.data()?.name,
      serviceAvatar: service?.data()?.avatar,
      timestamps: { createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
    };

    const result = await db?.runTransaction(async (transaction) => {
      const bookingRef = db?.collection("bookings")?.doc();

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
    let query: FirebaseFirestore.Query = db?.collection("bookings");

    // Filter bookings by clientId, workerId, if provided
    if (clientId) query = query?.where("clientId", "==", clientId);
    if (workerId) query = query?.where("workerId", "==", workerId);

    // Map booking documents to BookingInfo objects
    const mapBookingToInfo = (
      booking: FirebaseFirestore.QueryDocumentSnapshot
    ): BookingInfo | undefined => {
      const bookingData = booking.data() as Booking;
      return {
        workerName: bookingData?.workerName,
        serviceName: bookingData?.serviceName,
        subserviceName: bookingData?.subserviceName,
        serviceAvatar: bookingData?.serviceAvatar,
        locationName: bookingData?.locationName,
        dateTime: bookingData?.dateTime,
        ratePerUnit: bookingData?.ratePerUnit,
        unit: bookingData?.unit,
        status: bookingData?.status,
      };
    };

    const querySnapshot = await query.get();
    const bookings = querySnapshot.docs.map(mapBookingToInfo).filter(Boolean);

    // Type guard for BookingInfo
    const isBookingInfo = (
      item: BookingInfo | undefined
    ): item is BookingInfo => {
      return !!item;
    };

    if (clientId || workerId) {
      const currentBookings: BookingInfo[] = bookings
        .filter(
          (booking) =>
            booking?.status === "Pending" || booking?.status === "Not Completed"
        )
        .filter(isBookingInfo)
        .sort((a, b) => a.dateTime.toMillis() - b.dateTime.toMillis());

      const pastBookings: BookingInfo[] = bookings
        .filter((booking) => booking?.status === "Completed")
        .filter(isBookingInfo)
        .sort((a, b) => a.dateTime.toMillis() - b.dateTime.toMillis());

      return { currentBookings, pastBookings };
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
    const bookingRef = db?.collection("bookings")?.doc(id);
    const booking = await bookingRef.get();

    return booking?.data() as Booking;
  } catch (error) {
    console.error("Error getting booking:", error);
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
      const bookingRef = db?.collection("bookings")?.doc(id);

      const booking = await bookingRef.get();
      if (!booking.exists) {
        console.log(`Booking with ID: ${id} does not exist.`);
        return false;
      }

      // Update availability status and waiting list of worker
      const workerRef = db
        ?.collection("workers")
        ?.doc(booking?.data()?.workerId);
      const worker = await workerRef.get();

      if (!worker.exists) {
        throw new CustomError(
          `Worker with ID: ${booking?.data()?.workerId} does not exist.`,
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
