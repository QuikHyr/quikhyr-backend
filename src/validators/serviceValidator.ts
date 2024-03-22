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
        throw new Error(`Field "subservices" must be a string array.`);
      }
      break;
  }
};

export const validateService = (serviceData: Partial<Service>): void => {
  Object.keys(serviceData)?.forEach((field) => {
    validateField(field as keyof Service, serviceData[field as keyof Service]);
  });
};
