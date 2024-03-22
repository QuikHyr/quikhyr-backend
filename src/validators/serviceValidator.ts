import { RequiredFieldError, StringFieldError } from "../errors";
import { Service } from "../types/service";

type ValidationFunction = (field: keyof Service, value: any) => void;

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
  const requiredFields: (keyof Service)[] = [
    "name",
    "avatar",
    "image",
    "description",
    "subservices",
  ];

  // Check for missing required fields
  requiredFields?.forEach((field) => {
    if (serviceData[field] === undefined) {
      throw new RequiredFieldError(field);
    }
  });

  Object.keys(serviceData)?.forEach((field) => {
    validateField(field as keyof Service, serviceData[field as keyof Service]);
  });
};
