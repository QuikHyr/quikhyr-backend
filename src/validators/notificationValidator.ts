import {
  NumberFieldError,
  RequiredFieldError,
  StringFieldError,
  UnsupportedFieldError,
} from "../errors";
import {
  ImmediateWorkAlert,
  ImmediateWorkApprovalRequest,
} from "../types/notification";

type ValidationFunction = (
  field: keyof ImmediateWorkAlert | keyof ImmediateWorkApprovalRequest,
  value: any
) => void;

const ImmediateWorkAlertRequiredFields: (keyof ImmediateWorkAlert)[] = [
  "senderId",
  "subserviceId",
  "description",
  "location",
];

const ImmediateWorkApprovalRequestRequiredFields: (keyof ImmediateWorkApprovalRequest)[] =
  ["dateTime", "ratePerUnit", "unit"];

const ImmediateWorkAlertSupportedFields: (keyof ImmediateWorkAlert)[] =
  ImmediateWorkAlertRequiredFields.concat(["images", "receiverIds"]);

const ImmediateWorkApprovalRequestSupportedFields: (keyof ImmediateWorkApprovalRequest)[] =
  ImmediateWorkApprovalRequestRequiredFields.concat([]);

const validateTypes: ValidationFunction = (field, value) => {
  // Type validity checks
  switch (field) {
    case "senderId":
    case "subserviceId":
    case "description":
    case "unit":
      if (typeof value !== "string") {
        throw new StringFieldError(field);
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

    case "images":
      if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
        throw new Error(`Field '${field}' must be a string array.`);
      }
      break;

    case "ratePerUnit":
      if (typeof value !== "number") {
        throw new NumberFieldError(field);
      }
      break;
  }
};

export const validateImmediateWorkAlert = (
  immediateWorkAlertData: Partial<ImmediateWorkAlert>
): void => {
  // Check for missing required fields
  ImmediateWorkAlertRequiredFields?.forEach((field) => {
    if (
      immediateWorkAlertData[field] === undefined ||
      immediateWorkAlertData[field] === null ||
      immediateWorkAlertData[field] === ""
    ) {
      throw new RequiredFieldError(field);
    }
  });

  validateImmediateWorkAlertUpdate(immediateWorkAlertData);
};

export const validateImmediateWorkApprovalRequest = (
  immediateWorkApprovalRequestData: Partial<ImmediateWorkApprovalRequest>
): void => {
  // Check for missing required fields
  ImmediateWorkApprovalRequestRequiredFields?.forEach((field) => {
    if (
      immediateWorkApprovalRequestData[field] === undefined ||
      immediateWorkApprovalRequestData[field] === null ||
      immediateWorkApprovalRequestData[field] === ""
    ) {
      throw new RequiredFieldError(field);
    }
  });

  validateImmediateWorkApprovalRequestUpdate(immediateWorkApprovalRequestData);
};

export const validateImmediateWorkAlertUpdate = (
  immediateWorkAlertData: Partial<ImmediateWorkAlert>
): void => {
  Object.keys(immediateWorkAlertData)?.forEach((field) => {
    // Check for unsupported fields
    if (
      !ImmediateWorkAlertSupportedFields.includes(
        field as keyof ImmediateWorkAlert
      )
    ) {
      throw new UnsupportedFieldError(field);
    } else {
      if (field === "timestamps") {
        throw new Error("Field 'timestamps' is auto-generated.");
      } else if (field === "receiverIds") {
        throw new Error("Field 'receiverIds' is auto-fetched.");
      } else if (field === "locationName") {
        throw new Error("Field 'locationName' is auto-generated.");
      }

      validateTypes(
        field as keyof ImmediateWorkAlert,
        immediateWorkAlertData[field as keyof ImmediateWorkAlert]
      );
    }
  });
};

export const validateImmediateWorkApprovalRequestUpdate = (
  immediateWorkApprovalRequestData: Partial<ImmediateWorkApprovalRequest>
): void => {
  Object.keys(immediateWorkApprovalRequestData)?.forEach((field) => {
    // Check for unsupported fields
    if (
      !ImmediateWorkApprovalRequestSupportedFields.includes(
        field as keyof ImmediateWorkApprovalRequest
      )
    ) {
      throw new UnsupportedFieldError(field);
    } else {
      if (field === "timestamps") {
        throw new Error("Field 'timestamps' is auto-generated.");
      } else if (field === "receiverIds") {
        throw new Error("Field 'receiverIds' is auto-fetched.");
      } else if (field === "locationName") {
        throw new Error("Field 'locationName' is auto-generated.");
      }

      validateTypes(
        field as keyof ImmediateWorkApprovalRequest,
        immediateWorkApprovalRequestData[
          field as keyof ImmediateWorkApprovalRequest
        ]
      );
    }
  });
};
