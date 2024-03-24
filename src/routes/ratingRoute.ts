import { Router } from "express";
import {
  createRating,
  deleteRatingById,
  getRatingById,
  getRatings,
  updateRatingById,
} from "../controllers/ratingController";
import { Rating } from "../types/rating";

const ratingRouter = Router();

// Create a new rating
ratingRouter.post("/", async (req, res, next) => {
  try {
    const rating = await createRating(req?.body);

    if (rating) {
      res.status(201).json(rating);
    } else {
      res.status(400).send("Error creating rating");
    }
  } catch (error) {
    next(error);
  }
});

// Get all ratings as IDs or filtered by clientId, workerId, or bookingId
ratingRouter.get("/", async (req, res, next) => {
  try {
    const { clientId, workerId, bookingId } = req?.query as {
      clientId?: string;
      workerId?: string;
      bookingId?: string;
    };

    const ratings = await getRatings(clientId, workerId, bookingId);

    if (ratings?.length > 0) {
      res.status(200).json(ratings);
    } else {
      res.status(404).send("No ratings found!");
    }
  } catch (error) {
    next(error);
  }
});

// Get a rating by ID
ratingRouter.get("/:id", async (req, res, next) => {
  try {
    const rating = await getRatingById(req?.params?.id);

    if (rating) {
      res.status(200).json(rating);
    } else {
      res.status(404).send("Rating not found!");
    }
  } catch (error) {
    next(error);
  }
});

// Update a rating by ID
ratingRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedRating = await updateRatingById(req?.params?.id, req?.body);

    if (updatedRating) {
      res.status(200).json(updatedRating);
    } else {
      res.status(404).send("Rating not found!");
    }
  } catch (error) {
    next(error);
  }
});

// Delete a rating
ratingRouter.delete("/:id", async (req, res, next) => {
  try {
    const deletedRating = await deleteRatingById(req?.params?.id);

    if (deletedRating) {
      res.status(200).send("Rating deleted successfully!");
    } else {
      res.status(404).send("Rating not found!");
    }
  } catch (error) {
    next(error);
  }
});

export default ratingRouter;
