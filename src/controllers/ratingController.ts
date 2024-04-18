import { Timestamp } from "firebase-admin/firestore";
import { db } from "../services/firebase";
import { Rating } from "../types/rating";
import { CustomError } from "../errors";
import {
  validateRating,
  validateRatingUpdate,
} from "../validators/ratingValidator";

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

// Create a new rating
export const createRating = async (ratingData: Rating): Promise<Rating> => {
  try {
    validateRating(ratingData);

    const { docRef: ratingRef } = await getDocument("ratings", "");

    let weightedAvgRating = 0;
    let rating = {};

    if (ratingData?.ratings) {
      weightedAvgRating =
        (ratingData?.ratings?.quality?.rating || 0) * 0.2 +
        (ratingData?.ratings?.efficiency?.rating || 0) * 0.15 +
        (ratingData?.ratings?.reliability?.rating || 0) * 0.25 +
        (ratingData?.ratings?.knowledge?.rating || 0) * 0.2 +
        (ratingData?.ratings?.value?.rating || 0) * 0.2;

      rating = {
        ...ratingData,
        overallRating: {
          rating: weightedAvgRating,
          feedback: ratingData?.overallRating?.feedback || "",
        },
        timestamps: { createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
      };
    } else {
      rating = {
        ...ratingData,
        timestamps: { createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
      };
    }

    await ratingRef.set(rating);
    console.log("Rating created successfully!");

    return rating as Rating;
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
    const { doc: rating } = await getDocument("ratings", id);

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
    validateRatingUpdate(ratingData);

    const { docRef: ratingRef } = await getDocument("ratings", id);

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
    const { docRef: ratingRef } = await getDocument("ratings", id);

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
