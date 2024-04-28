import {
  RequiredFieldError,
  StringFieldError,
  UnsupportedFieldError,
} from "../../errors";
import { Subservice } from "./subservice.type";

type ValidationFunction = (field: keyof Subservice, value: any) => void;

const requiredFields: (keyof Subservice)[] = [
  "serviceId",
  "serviceName",
  "name",
  "tags",
];

const supportedFields: (keyof Subservice)[] = [...requiredFields];

const validateTypes: ValidationFunction = (field, value) => {
  // Type validity checks
  switch (field) {
    case "serviceId":
    case "serviceName":
    case "name":
      if (typeof value !== "string") {
        throw new StringFieldError(field);
      }
      break;

    case "tags":
      if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
        throw new Error(`Field '${field}' must be a string array.`);
      }
      break;
  }
};

export const validateSubservice = (
  subserviceData: Partial<Subservice>
): void => {
  // Check for missing required fields
  requiredFields?.forEach((field) => {
    if (
      subserviceData[field] === undefined ||
      subserviceData[field] === null ||
      subserviceData[field] === "" ||
      subserviceData[field]?.length === 0
    ) {
      throw new RequiredFieldError(field);
    }
  });

  validateSubserviceUpdate(subserviceData);
};

export const validateSubserviceUpdate = (
  subserviceData: Partial<Subservice>
): void => {
  Object.keys(subserviceData)?.forEach((field) => {
    // Check for unsupported fields
    if (!supportedFields.includes(field as keyof Subservice)) {
      throw new UnsupportedFieldError(field);
    }

    validateTypes(
      field as keyof Subservice,
      subserviceData[field as keyof Subservice]
    );
  });
};
