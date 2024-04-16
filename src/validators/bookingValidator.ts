import {
  NumberFieldError,
  RequiredFieldError,
  StringFieldError,
  UnsupportedFieldError,
} from "../errors";
import { Booking } from "../types/booking";

type ValidationFunction = (field: keyof Booking, value: any) => void;

const requiredFields: (keyof Booking)[] = [
  "clientId",
  "workerId",
  "subserviceId",
  "dateTime",
  "ratePerUnit",
  "unit",
  "status",
  "location",
];

const supportedFields: (keyof Booking)[] = [
  ...requiredFields,
  "locationName",
  "subserviceName",
  "workerName",
  "serviceAvatar",
  "timestamps",
];

const validateTypes: ValidationFunction = (field, value) => {
  // Type validity checks
  switch (field) {
    case "clientId":
    case "workerId":
    case "subserviceId":
    case "unit":
      if (typeof value !== "string") {
        throw new StringFieldError(field);
      }
      break;

    case "ratePerUnit":
      if (typeof value !== "number") {
        throw new NumberFieldError(field);
      }
      break;

    case "status":
      if (!["Pending", "Completed", "Not Completed"].includes(value)) {
        throw new Error(
          `Field '${field}' must be either "Pending", "Completed", or "Not Completed".`
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

export const validateBooking = (bookingData: Partial<Booking>): void => {
  // Check for missing required fields
  requiredFields?.forEach((field) => {
    if (
      bookingData[field] === undefined ||
      bookingData[field] === null ||
      bookingData[field] === ""
    ) {
      throw new RequiredFieldError(field);
    }
  });

  validateBookingUpdate(bookingData);
};

export const validateBookingUpdate = (bookingData: Partial<Booking>): void => {
  Object.keys(bookingData)?.forEach((field) => {
    // Check for unsupported fields
    if (!supportedFields.includes(field as keyof Booking)) {
      throw new UnsupportedFieldError(field);
    } else if (field === "locationName") {
      throw new Error("Field 'locationName' is auto-generated.");
    }
    else if (field === "subserviceName") {
      throw new Error("Field 'subserviceName' is auto-generated.");
    }
    else if (field === "workerName") {
      throw new Error("Field 'workerName' is auto-generated.");
    }
    else if (field === "serviceAvatar") {
      throw new Error("Field 'serviceAvatar' is auto-generated.");
    }
    else if (field === "timestamps") {
      throw new Error("Field 'timestamps' is auto-generated.");
    }

    validateTypes(field as keyof Booking, bookingData[field as keyof Booking]);
  });
};
