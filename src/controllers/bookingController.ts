import { Timestamp } from "firebase-admin/firestore";
import { db } from "../firebase";
import { Booking } from "../types/booking";
import { validateBooking } from "../validators/bookingValidator";
import { CustomError } from "../../errors";

// Create a new booking
export const createBooking = async (
  bookingData: Booking
): Promise<Booking | null> => {
  try {
    validateBooking(bookingData);

    const bookingRef = db?.collection("bookings")?.doc();

    const booking: Booking = {
      ...bookingData,
      // id: bookingRef?.id,
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

// Get all bookings as IDs or filtered by clientId or workerId and categorized into current and past bookings
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
    const query = await db?.collection("bookings");

    if (clientId || workerId) {
      const filteredQuery = (await (clientId && workerId))
        ? query
            ?.where("clientId", "==", clientId)
            ?.where("workerId", "==", workerId)
        : clientId
        ? query?.where("clientId", "==", clientId)
        : query?.where("workerId", "==", workerId);

      const currentBookingsQuery = filteredQuery
        ?.where("status", "in", ["Pending", "Not Completed"])
        ?.get();

      const pastBookingsQuery = filteredQuery
        ?.where("status", "==", "Completed")
        ?.get();

      const currentBookings: Booking[] = (await currentBookingsQuery)?.docs.map(
        (booking) => booking.data() as Booking
      );

      const pastBookings: Booking[] = (await pastBookingsQuery)?.docs.map(
        (booking) => booking.data() as Booking
      );

      const response = {
        currentBookings,
        pastBookings,
      };

      return response as {
        currentBookings: Booking[];
        pastBookings: Booking[];
      };
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
): Promise<Partial<Booking> | null> => {
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

    await bookingRef.delete();

    console.log(`Booking with ID: ${id} deleted successfully.`);

    return true;
  } catch (error) {
    console.error(`Error deleting Booking:`, error);
    return false;
  }
};
