import { Timestamp } from "firebase-admin/firestore";
import { db } from "../firebase";
import { Booking, CategorizedBookings } from "../types/booking";
import { validateBooking } from "../validators/bookingValidator";
import { CustomError } from "../errors";

// Create a new booking
export const createBooking = async (bookingData: Booking): Promise<Booking> => {
  try {
    validateBooking(bookingData);

    const bookingRef = db?.collection("bookings")?.doc();

    const booking: Booking = {
      ...bookingData,
      timestamps: { createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
    };

    await bookingRef.set(booking);
    console.log("Booking created successfully!");

    return booking;
  } catch (error) {
    console.error("Error creating Booking:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Get all bookings as IDs or filtered by clientId, workerId, and categorized into current and past bookings
export const getBookings = async (
  clientId?: string,
  workerId?: string
): Promise<
  | string[]
  | {
      currentBookings: Booking[];
      pastBookings: Booking[];
    }
> => {
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

      const categorizedBookings = {
        currentBookings,
        pastBookings,
      };

      return categorizedBookings as CategorizedBookings;
    } else {
      const querySnapshot = await query?.get();
      const bookingIds = querySnapshot?.docs.map((booking) => booking?.id);

      return bookingIds as string[];
    }
  } catch (error) {
    console.error("Error getting bookings:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Get a booking by ID
export const getBookingById = async (id: string): Promise<Booking | null> => {
  try {
    const bookingRef = db?.collection("bookings")?.doc(id);
    const booking = await bookingRef.get();

    if (booking?.exists) {
      return booking?.data() as Booking;
    } else {
      console.log("No such booking!");
      return null;
    }
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
    validateBooking(bookingData);

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
    const bookingRef = db?.collection("bookings")?.doc(id);

    const bookingSnapshot = await bookingRef.get();
    if (!bookingSnapshot.exists) {
      console.log(`Booking with ID: ${id} does not exist.`);
      return false;
    }

    await bookingRef.delete();
    console.log(`Booking with ID: ${id} deleted successfully.`);

    return true;
  } catch (error) {
    console.error(`Error deleting Booking:`, error);
    return false;
  }
};
