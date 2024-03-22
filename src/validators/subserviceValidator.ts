import { RequiredFieldError, StringFieldError } from "../errors";
import { Subservice } from "../types/subservice";

type ValidationFunction = (field: keyof Subservice, value: any) => void;

const validateField: ValidationFunction = (field, value) => {
  // Required field checks
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value?.length === 0
  ) {
    throw new RequiredFieldError(field);
  }

  // Type validity checks
  switch (field) {
    case "name":
    case "serviceId":
    case "description":
      if (typeof value !== "string") {
        throw new StringFieldError(field);
      }
      break;

    case "tags":
    case "workers":
      if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
        throw new Error(`Field '${field}' must be a string array.`);
      }
      break;
  }
};

export const validateSubservice = (
  subserviceData: Partial<Subservice>
): void => {
  const requiredFields: (keyof Subservice)[] = [
    "serviceId",
    "name",
    "description",
    "tags",
    "workers",
  ];

  // Check for missing required fields
  requiredFields?.forEach((field) => {
    if (subserviceData[field] === undefined) {
      throw new RequiredFieldError(field);
    }
  });

  Object.keys(subserviceData)?.forEach((field) => {
    validateField(
      field as keyof Subservice,
      subserviceData[field as keyof Subservice]
    );
  });
};
