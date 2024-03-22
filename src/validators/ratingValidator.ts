import {
  NumberFieldError,
  RequiredFieldError,
  StringFieldError,
} from "../errors";
import { Rating } from "../types/rating";

type ValidationFunction = (field: keyof Rating, value: any) => void;

const validateField: ValidationFunction = (field, value) => {
  // Required field checks
  if (value === null || value === undefined || value === "") {
    throw new RequiredFieldError(field);
  }

  // Type validity checks
  switch (field) {
    case "clientId":
    case "workerId":
    case "bookingId":
      if (typeof value !== "string") {
        throw new StringFieldError(field);
      }
      break;

    case "ratings":
      const ratings = [
        "quality",
        "efficiency",
        "reliability",
        "knowledge",
        "value",
        "overall",
      ];

      if (typeof value !== "object") {
        throw new Error(`Field '${field}' must be an object.`);
      }

      ratings?.every((ratingCriteria) => {
        const criteria = value[ratingCriteria];
        if (
          typeof criteria?.rating !== "number" ||
          typeof criteria?.feedback !== "string"
        ) {
          throw new Error(
            `Field '${field}' must be an object with rating as a number and feedback as a string.`
          );
        }
      });
      break;
  }
};

export const validateRating = (ratingData: Partial<Rating>): void => {
  const requiredFields: (keyof Rating)[] = [
    "clientId",
    "workerId",
    "bookingId",
    "ratings",
  ];

  // Check for missing required fields
  requiredFields?.forEach((field) => {
    if (ratingData[field] === undefined) {
      throw new RequiredFieldError(field);
    }
  });

  Object.keys(ratingData)?.forEach((field) => {
    validateField(field as keyof Rating, ratingData[field as keyof Rating]);
  });
};
