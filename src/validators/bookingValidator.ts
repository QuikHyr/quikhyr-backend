import {
  NumberFieldError,
  RequiredFieldError,
  StringFieldError,
} from "../errors";
import { Booking } from "../types/booking";

type ValidationFunction = (field: keyof Booking, value: any) => void;

const validateField: ValidationFunction = (field, value) => {
  // Required field checks
  if (value === null || value === undefined || value === "") {
    throw new RequiredFieldError(field);
  }

  // Type validity checks
  switch (field) {
    case "clientId":
    case "workerId":
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
          `Field "status" must be either "Pending", "Completed", or "Not Completed".`
        );
      }
      break;
  }
};

export const validateBooking = (bookingData: Partial<Booking>): void => {
  Object.keys(bookingData)?.forEach((field) => {
    validateField(field as keyof Booking, bookingData[field as keyof Booking]);
  });
};
