import { Timestamp } from "firebase-admin/firestore";
import { db } from "../firebase";
import { Rating } from "../types/rating";
import { CustomError } from "../errors";
import { validateRating } from "../validators/ratingValidator";

// Create a new rating
export const createRating = async (ratingData: Rating): Promise<Rating> => {
  try {
    validateRating(ratingData);

    const ratingRef = db?.collection("ratings")?.doc();

    const rating: Rating = {
      ...ratingData,
      timestamps: { createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
    };

    await ratingRef.set(rating);
    console.log("Rating created successfully!");

    return rating;
  } catch (error) {
    console.error("Error creating Rating:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Get all ratings as IDs or filtered by clientId, workerId, bookingId
export const getRatings = async (
  clientId?: string,
  workerId?: string,
  bookingId?: string
): Promise<string[] | Rating[]> => {
  try {
    let query: FirebaseFirestore.Query = db?.collection("ratings");

    // Filter ratings by clientId , workerId, bookingId, if provided
    if (clientId) query = query?.where("clientId", "==", clientId);
    if (workerId) query = query?.where("workerId", "==", workerId);
    if (bookingId) query = query?.where("bookingId", "==", bookingId);

    const querySnapshot = await query?.get();

    if (clientId || workerId || bookingId) {
      const ratings: Rating[] = querySnapshot?.docs?.map(
        (rating) => rating.data() as Rating
      );

      return ratings;
    } else {
      const ratingIds: string[] = querySnapshot?.docs?.map(
        (rating) => rating.id
      );

      return ratingIds;
    }
  } catch (error) {
    console.error("Error getting ratings:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Get a rating by ID
export const getRatingById = async (id: string): Promise<Rating> => {
  try {
    const ratingRef = db?.collection("ratings")?.doc(id);
    const rating = await ratingRef.get();

    return rating?.data() as Rating;
  } catch (error) {
    console.error("Error getting rating:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Update a rating by ID
export const updateRatingById = async (
  id: string,
  ratingData: Partial<Rating>
): Promise<Partial<Rating>> => {
  try {
    validateRating(ratingData);

    const ratingRef = db?.collection("ratings")?.doc(id);

    await ratingRef.update({
      ...ratingData,
      timestamps: {
        updatedAt: Timestamp.now(),
      },
    });
    console.log(`Rating with ID: ${id} updated successfully!`);

    return ratingData;
  } catch (error) {
    console.error(`Error updating Rating:`, error);
    throw new CustomError(`${error}`, 400);
  }
};

// Delete a rating
export const deleteRatingById = async (id: string): Promise<boolean> => {
  try {
    const ratingRef = db?.collection("ratings")?.doc(id);

    const ratingSnapshot = await ratingRef.get();
    if (!ratingSnapshot.exists) {
      console.log(`Rating with ID: ${id} does not exist.`);
      return false;
    }

    await ratingRef.delete();
    console.log(`Rating with ID: ${id} deleted successfully.`);

    return true;
  } catch (error) {
    console.error(`Error deleting Rating:`, error);
    return false;
  }
};
