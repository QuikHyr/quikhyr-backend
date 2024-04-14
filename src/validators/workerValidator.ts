import { Timestamp } from "firebase-admin/firestore";
import {
  BooleanFieldError,
  NumberFieldError,
  RequiredFieldError,
  StringFieldError,
  UnsupportedFieldError,
} from "../errors";
import { Worker } from "../types/worker";

type ValidationFunction = (field: keyof Worker, value: any) => void;

const requiredFields: (keyof Worker)[] = [
  "id",
  "fcmToken",
  "name",
  "avatar",
  "email",
  "phone",
  "gender",
  "location",
  "pincode",
  "available",
  "isVerified",
  "isActive",
  "serviceIds",
  "subserviceIds",
];
const supportedFields: (keyof Worker)[] = [...requiredFields, "age", "locationName", "timestamps"];

const validateTypes: ValidationFunction = (field, value) => {
  // Type validity checks
  switch (field) {
    case "id":
    case "fcmToken":
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

    case "available":
    case "isVerified":
    case "isActive":
      if (typeof value !== "boolean") {
        throw new BooleanFieldError(field);
      }
      break;

    case "gender":
      if (!["Male", "Female", "Other", "Rather Not Say"].includes(value)) {
        throw new Error(
          `Field '${field}' must be either "Male", "Female", or "Rather Not Say".`
        );
      }
      break;

    case "location":
      if (
        typeof value !== "object" ||
        typeof value?.latitude !== "number" ||
        typeof value?.longitude !== "number"
      ) {
        throw new Error(
          `Field '${field}' must be an object with latitude and longitude as numbers.`
        );
      }
      break;

    case "serviceIds":
    case "subserviceIds":
      if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
        throw new Error(`Field '${field}' must be a string array.`);
      }
      break;
  }
};

export const validateWorker = (workerData: Partial<Worker>): void => {
  // Check for missing required fields
  requiredFields?.forEach((field) => {
    if (
      workerData[field] === undefined ||
      workerData[field] === null ||
      workerData[field] === ""
    ) {
      throw new RequiredFieldError(field);
    }
  });

  validateWorkerUpdate(workerData);
};

export const validateWorkerUpdate = (workerData: Partial<Worker>): void => {
  Object.keys(workerData).forEach((field) => {
    // Check for unsupported fields
    if (!supportedFields.includes(field as keyof Worker)) {
      throw new UnsupportedFieldError(field);
    } else {
      if (field === "timestamps") {
        throw new Error("Field 'timestamps' is auto-generated.");
      } else if (field === "locationName") {
        throw new Error("Field 'locationName' is auto-generated.");
      }

      validateTypes(field as keyof Worker, workerData[field as keyof Worker]);
    }
  });
};
