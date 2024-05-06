import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../services/firebase";
import { Rating, Ratings } from "./rating.type";
import { CustomError } from "../../errors";
import { validateRating, validateRatingUpdate } from "./rating.validator";

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

// Helper function to calculate weighted average rating
function calculateOverallRating(ratings: Ratings): number {
  const weights: { [key: string]: number } = {
    quality: 0.2,
    efficiency: 0.15,
    reliability: 0.25,
    knowledge: 0.2,
    value: 0.2,
  };

  let totalWeight = 0;
  let weightedRatingSum = 0;
  let missingCriteria: string[] = [];

  for (let criteria in weights) {
    if (ratings[criteria as keyof Ratings]) {
      totalWeight += weights[criteria];
      weightedRatingSum +=
        weights[criteria] * (ratings[criteria as keyof Ratings]?.rating ?? 0);
    } else {
      missingCriteria.push(criteria);
    }
  }

  if (missingCriteria.length > 0) {
    const redistributedWeight =
      missingCriteria.reduce((sum, criteria) => sum + weights[criteria], 0) /
      (Object.keys(weights).length - missingCriteria.length);
    for (let criteria in weights) {
      if (!missingCriteria.includes(criteria)) {
        totalWeight += redistributedWeight;
        weightedRatingSum +=
          redistributedWeight *
          (ratings[criteria as keyof Ratings]?.rating ?? 0);
      }
    }
  }

  return parseFloat((weightedRatingSum / totalWeight).toFixed(2));
}

// Create a new rating
export const createRating = async (ratingData: Rating): Promise<Rating> => {
  try {
    validateRating(ratingData);

    const ratingRef = await db?.collection("ratings")?.doc();

    let rating = {};

    let calculatedRating: number = 0;

    if (ratingData?.ratings) {
      calculatedRating = await calculateOverallRating(ratingData?.ratings);

      rating = {
        ...ratingData,
        overallRating: {
          rating: calculatedRating,
          feedback:
            ratingData?.overallRating?.feedback ||
            Object.values(ratingData?.ratings || {})
              .map((criteria) => criteria.feedback)
              .join("\n"),
        },
        timestamps: { createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
      };
    } else {
      rating = {
        ...ratingData,
        timestamps: { createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
      };
    }

    // Create the new rating
    await ratingRef.set(rating);
    console.log("Rating created successfully!");

    // Update associated worker's rating
    const { docRef: workerRef } = await getDocument(
      "workers",
      ratingData?.workerId
    );
    await workerRef.update({
      rating: ratingData?.overallRating?.rating ?? calculatedRating,
    });
    console.log("Worker's rating updated successfully!");

    // Set hasRated to true in associated booking
    const { docRef: bookingRef } = await getDocument(
      "bookings",
      ratingData?.bookingId
    );

    await bookingRef.update({
      hasRated: true,
      timestamps: {
        updatedAt: Timestamp.now(),
      },
    });

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
