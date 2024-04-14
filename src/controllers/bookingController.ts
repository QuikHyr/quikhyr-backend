import { Timestamp } from "firebase-admin/firestore";
import { db } from "../services/firebase";
import { Booking, CategorizedBookings } from "../types/booking";
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

    const booking: Booking = {
      ...bookingData,
      locationName: locationName ?? "",
      timestamps: { createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
    };

    const result = await db?.runTransaction(async (transaction) => {
      const bookingRef = db?.collection("bookings")?.doc();

      // Update availability status and waiting list of worker
      const workerRef = db?.collection("workers")?.doc(booking?.workerId);
      const worker = await workerRef.get();

      if (!worker.exists) {
        throw new CustomError(
          `Worker with ID: ${booking?.workerId} does not exist.`,
          404
        );
      }

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

    const querySnapshot = await query?.get();

    if (clientId || workerId) {
      const currentBookings: Booking[] = querySnapshot?.docs?.map(
        (booking) => booking.data() as Booking
      );

      const pastBookings: Booking[] = querySnapshot?.docs.map(
        (booking) => booking.data() as Booking
      );

      const categorizedBookings: CategorizedBookings = {
        currentBookings,
        pastBookings,
      };

      return categorizedBookings;
    } else {
      const querySnapshot = await query?.get();
      const bookingIds: string[] = querySnapshot?.docs.map(
        (booking) => booking?.id
      );

      return bookingIds;
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
