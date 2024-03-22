import {
  NumberFieldError,
  RequiredFieldError,
  StringFieldError,
} from "../../errors";
import { Worker } from "../types/worker";

type ValidationFunction = (field: keyof Worker, value: any) => void;

const validateField: ValidationFunction = (field, value) => {
  // Required field checks
  if (field !== "age") {
    if (value === null || value === undefined || value === "") {
      throw new RequiredFieldError(field);
    }
  }

  // Type validity checks
  switch (field) {
    case "id":
    case "name":
    case "avatar":
    case "email":
    case "phone":
    case "pincode":
      if (typeof value !== "string") {
        throw new StringFieldError(field);
      }
      break;
    case "age":
      if (typeof value !== "number") {
        throw new NumberFieldError(field);
      }
      break;
    case "gender":
      if (!["Male", "Female", "Rather Not Say"].includes(value)) {
        throw new Error(
          `Field "gender" must be either "Male", "Female", or "Rather Not Say".`
        );
      }
      break;
    case "location":
      if (
        typeof value?.latitude !== "number" ||
        typeof value?.longitude !== "number"
      ) {
        throw new Error(
          `Field "location" must be an object with latitude and longitude as numbers.`
        );
      }
      break;
    case "available":
      if (typeof value !== "boolean") {
        throw new Error(`Field "available" must be a boolean.`);
      }
      break;
    case "subservices":
      if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
        throw new Error(`Field "subservices" must be a string array.`);
      }
      break;
  }
};

export const validateWorker = (workerData: Partial<Worker>): void => {
  Object.keys(workerData)?.forEach((field) => {
    validateField(field as keyof Worker, workerData[field as keyof Worker]);
  });
};
