import { Router } from "express";
import {
  createBooking,
  deleteBookingById,
  getBookingById,
  getBookings,
  updateBookingById,
} from "../controllers/bookingController";
import { Booking } from "../types/booking";

const bookingRouter = Router();

// Create a new booking
bookingRouter.post("/", async (req, res, next) => {
  try {
    const booking = await createBooking(req?.body);

    if (booking) {
      res.status(201).json(booking);
    } else {
      res.status(400).send("Error creating booking");
    }
  } catch (error) {
    next(error);
  }
});

// Get all bookings as IDs or filtered by clientId or workerId and categorized into current and past bookings
bookingRouter.get("/", async (req, res, next) => {
  try {
    const { clientId, workerId } = req?.query as {
      clientId?: string;
      workerId?: string;
    };

    const bookings = await getBookings(clientId, workerId);

    if (
      bookings &&
      ((bookings instanceof Array && bookings?.length > 0) ||
        (bookings instanceof Object &&
          (("currentBookings" in bookings &&
            bookings?.currentBookings?.length > 0) ||
            ("pastBookings" in bookings &&
              bookings?.pastBookings?.length > 0))))
    ) {
      res.status(200).json(bookings);
    } else {
      res.status(404).send("No bookings found!");
    }
  } catch (error) {
    next(error);
  }
});

// Get a booking by ID
bookingRouter.get("/:id", async (req, res, next) => {
  try {
    const booking = await getBookingById(req?.params?.id);

    if (booking) {
      res.status(200).json(booking);
    } else {
      res.status(404).send("Booking not found!");
    }
  } catch (error) {
    next(error);
  }
});

// Update a booking by ID
bookingRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedBooking = await updateBookingById(req?.params?.id, req?.body);

    if (updatedBooking) {
      res.status(200).json(updatedBooking);
    } else {
      res.status(404).send("Booking not found!");
    }
  } catch (error) {
    next(error);
  }
});

// Delete a booking
bookingRouter.delete("/:id", async (req, res, next) => {
  try {
    const deletedBooking = await deleteBookingById(req?.params?.id);

    if (deletedBooking) {
      res.status(200).send("Booking deleted successfully!");
    } else {
      res.status(404).send("Booking not found!");
    }
  } catch (error) {
    next(error);
  }
});

export default bookingRouter;
