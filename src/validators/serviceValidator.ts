import {
  RequiredFieldError,
  StringFieldError,
  UnsupportedFieldError,
} from "../errors";
import { Service } from "../types/service";

type ValidationFunction = (field: keyof Service, value: any) => void;

const requiredFields: (keyof Service)[] = [
  "name",
  "avatar",
  "image",
  "description",
  "subservices",
];

const supportedFields: (keyof Service)[] = requiredFields.concat([]);

const validateTypes: ValidationFunction = (field, value) => {
  // Type validity checks
  switch (field) {
    case "name":
    case "avatar":
    case "image":
    case "description":
      if (typeof value !== "string") {
        throw new StringFieldError(field);
      }
      break;

    case "subservices":
      if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
        throw new Error(`Field '${field}' must be a string array.`);
      }
      break;
  }
};

export const validateService = (serviceData: Partial<Service>): void => {
  // Check for missing required fields
  requiredFields?.forEach((field) => {
    if (
      serviceData[field] === undefined ||
      serviceData[field] === null ||
      serviceData[field] === "" ||
      serviceData[field]?.length === 0
    ) {
      throw new RequiredFieldError(field);
    }
  });

  validateServiceUpdate(serviceData);
};

export const validateServiceUpdate = (serviceData: Partial<Service>): void => {
  Object.keys(serviceData)?.forEach((field) => {
    // Check for unsupported fields
    if (!supportedFields.includes(field as keyof Service)) {
      throw new UnsupportedFieldError(field);
    }

    validateTypes(field as keyof Service, serviceData[field as keyof Service]);
  });
};
