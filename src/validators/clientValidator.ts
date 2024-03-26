import { Timestamp } from "firebase-admin/firestore";
import {
  BooleanFieldError,
  NumberFieldError,
  RequiredFieldError,
  StringFieldError,
  UnsupportedFieldError,
} from "../errors";
import { User as Client } from "../types/user";

type ValidationFunction = (field: keyof Client, value: any) => void;

const requiredFields: (keyof Client)[] = [
  "id",
  "fcmToken",
  "name",
  "avatar",
  "email",
  "phone",
  "gender",
  "location",
  "pincode",
  "isActive",
  "isVerified",
];

const supportedFields: (keyof Client)[] = requiredFields.concat(["age"]);

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
  }
};

export const validateClient = (clientData: Partial<Client>): void => {
  // Check for missing required fields
  requiredFields?.forEach((field) => {
    if (
      clientData[field] === undefined ||
      clientData[field] === null ||
      clientData[field] === ""
    ) {
      throw new RequiredFieldError(field);
    }
  });

  validateClientUpdate(clientData);
};

export const validateClientUpdate = (clientData: Partial<Client>): void => {
  Object.keys(clientData).forEach((field) => {
    // Check for unsupported fields
    if (!supportedFields.includes(field as keyof Client)) {
      throw new UnsupportedFieldError(field);
    } else {
      if (field === "timestamps") {
        throw new Error("Field 'timestamps' is auto-generated.");
      }

      validateTypes(field as keyof Client, clientData[field as keyof Client]);
    }
  });
};
