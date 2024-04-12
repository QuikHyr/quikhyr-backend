import {
  RequiredFieldError,
  StringFieldError,
  UnsupportedFieldError,
} from "../errors";
import { Rating } from "../types/rating";

type ValidationFunction = (field: keyof Rating, value: any) => void;

const requiredFields: (keyof Rating)[] = [
  "clientId",
  "workerId",
  "bookingId",
  "subserviceName",
];

const supportedFields: (keyof Rating)[] = requiredFields.concat([
  "ratings",
  "overallRating",
]);

const validateTypes: ValidationFunction = (field, value) => {
  // Type validity checks
  switch (field) {
    case "clientId":
    case "workerId":
    case "bookingId":
    case "subserviceName":
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
            `Field '${ratingCriteria}' must be an object with rating as a number and feedback as a string.`
          );
        }
      });
      break;

    case "overallRating":
      if (typeof value !== "object") {
        throw new Error(`Field '${field}' must be an object.`);
      }

      if (
        typeof value?.rating !== "number" ||
        typeof value?.feedback !== "string"
      ) {
        throw new Error(
          `Field '${field}' must be an object with rating as a number and feedback as a string.`
        );
      }
      break;
  }
};

export const validateRating = (ratingData: Partial<Rating>): void => {
  // Check for missing required fields
  requiredFields?.forEach((field) => {
    if (
      ratingData[field] === undefined ||
      ratingData[field] === null ||
      ratingData[field] === ""
    ) {
      throw new RequiredFieldError(field);
    }
  });

  validateRatingUpdate(ratingData);
};

export const validateRatingUpdate = (ratingData: Partial<Rating>): void => {
  Object.keys(ratingData)?.forEach((field) => {
    // Check for unsupported fields
    if (!supportedFields.includes(field as keyof Rating)) {
      throw new UnsupportedFieldError(field);
    } else {
      if (field === "timestamps") {
        throw new Error("Field 'timestamps' is auto-generated.");
      }

      validateTypes(field as keyof Rating, ratingData[field as keyof Rating]);
    }
  });
};
