import { ImmediateWorkRejection } from "./../types/notification.d";
import {
  NumberFieldError,
  RequiredFieldError,
  StringFieldError,
  UnsupportedFieldError,
} from "../errors";
import {
  ImmediateWorkAlert,
  ImmediateWorkApprovalRequest,
  ImmediateWorkApprovalRequest as ImmediateWorkConfirmation,
  Notification,
} from "../types/notification";

type ValidationFunction = (
  field:
    | keyof ImmediateWorkAlert
    | keyof ImmediateWorkApprovalRequest
    | keyof ImmediateWorkConfirmation
    | keyof ImmediateWorkRejection,
  value: any
) => void;

// Notification Fields
const NotificationRequiredFields: (keyof Notification)[] = [
  "senderId",
  "receiverIds",
];

const NotificationSupportedFields: (keyof Notification)[] = [
  ...NotificationRequiredFields,
];

// Immediate Work Alert Fields
const ImmediateWorkAlertRequiredFields: (keyof ImmediateWorkAlert)[] = [
  "senderId",
  "subserviceId",
  "description",
  "location",
];

const ImmediateWorkAlertSupportedFields: (keyof ImmediateWorkAlert)[] = [
  ...ImmediateWorkAlertRequiredFields,
  "workAlertId",
  "images",
  "receiverIds",
  "locationName",
  "timestamps",
];

// Immediate Work Approval Request Fields
const ImmediateWorkApprovalRequestRequiredFields: (keyof ImmediateWorkApprovalRequest)[] =
  [
    ...ImmediateWorkAlertRequiredFields,
    "workAlertId",
    "receiverIds",
    "locationName",
    "dateTime",
    "ratePerUnit",
    "unit",
  ];

const ImmediateWorkApprovalRequestSupportedFields: (keyof ImmediateWorkApprovalRequest)[] =
  [
    ...ImmediateWorkApprovalRequestRequiredFields,
    "workApprovalRequestId",
    "timestamps",
  ];

// Immediate Work Confirmation Fields
const ImmediateWorkConfirmationRequiredFields: (keyof ImmediateWorkConfirmation)[] =
  [...ImmediateWorkApprovalRequestRequiredFields, "workApprovalRequestId"];

const ImmediateWorkConfirmationSupportedFields: (keyof ImmediateWorkConfirmation)[] =
  [...ImmediateWorkConfirmationRequiredFields, "timestamps"];

// Immediate Work Rejection Fields
const ImmediateWorkRejectionRequiredFields: (keyof ImmediateWorkRejection)[] = [
  ...NotificationRequiredFields,
  "workAlertId",
  "workApprovalRequestId",
];

const ImmediateWorkRejectionSupportedFields: (keyof ImmediateWorkRejection)[] =
  [...ImmediateWorkRejectionRequiredFields, "timestamps"];

const validateTypes: ValidationFunction = (field, value) => {
  // Type validity checks
  switch (field) {
    case "senderId":
    case "subserviceId":
    case "description":
    case "unit":
    case "locationName":
    case "workAlertId":
    case "workApprovalRequestId":
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

// Notification Validator
export const validateNotification = (
  NotificationData: Partial<Notification>
): void => {
  // Check for missing required fields
  NotificationRequiredFields?.forEach((field) => {
    if (
      NotificationData[field] === undefined ||
      NotificationData[field] === null ||
      NotificationData[field] === ""
    ) {
      throw new RequiredFieldError(field);
    }
  });

  validateNotificationUpdate(NotificationData);
};

export const validateNotificationUpdate = (
  NotificationData: Partial<Notification>
): void => {
  Object.keys(NotificationData)?.forEach((field) => {
    // Check for unsupported fields
    if (!NotificationSupportedFields.includes(field as keyof Notification)) {
      throw new UnsupportedFieldError(field);
    } else {
      if (field === "timestamps") {
        throw new Error("Field 'timestamps' is auto-generated.");
      }

      validateTypes(
        field as keyof Notification,
        NotificationData[field as keyof Notification]
      );
    }
  });
};

// Immediate Work Alert Validator
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
      } else if (field === "workAlertId") {
        throw new Error("Field 'workAlertId' is auto-generated.");
      }

      validateTypes(
        field as keyof ImmediateWorkAlert,
        immediateWorkAlertData[field as keyof ImmediateWorkAlert]
      );
    }
  });
};

// Immediate Work Approval Request Validator
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
    } else if (field === "timestamps") {
      throw new Error("Field 'timestamps' is auto-generated.");
    } else if (field === "workApprovalRequestId") {
      throw new Error("Field 'workApprovalRequestId' is auto-generated.");
    }

    validateTypes(
      field as keyof ImmediateWorkApprovalRequest,
      immediateWorkApprovalRequestData[
        field as keyof ImmediateWorkApprovalRequest
      ]
    );
  });
};

// Immediate Work Confirmation Validator
export const validateImmediateWorkConfirmation = (
  immediateWorkConfirmationData: Partial<ImmediateWorkConfirmation>
): void => {
  // Check for missing required fields
  ImmediateWorkConfirmationRequiredFields?.forEach((field) => {
    if (
      immediateWorkConfirmationData[field] === undefined ||
      immediateWorkConfirmationData[field] === null ||
      immediateWorkConfirmationData[field] === ""
    ) {
      throw new RequiredFieldError(field);
    }
  });

  validateImmediateWorkConfirmationUpdate(immediateWorkConfirmationData);
};

export const validateImmediateWorkConfirmationUpdate = (
  immediateWorkConfirmationData: Partial<ImmediateWorkConfirmation>
): void => {
  Object.keys(immediateWorkConfirmationData)?.forEach((field) => {
    // Check for unsupported fields
    if (
      !ImmediateWorkConfirmationSupportedFields.includes(
        field as keyof ImmediateWorkConfirmation
      )
    ) {
      throw new UnsupportedFieldError(field);
    } else if (field === "timestamps") {
      throw new Error("Field 'timestamps' is auto-generated.");
    }

    validateTypes(
      field as keyof ImmediateWorkConfirmation,
      immediateWorkConfirmationData[field as keyof ImmediateWorkConfirmation]
    );
  });
};

// Immediate Work Rejection Validator
export const validateImmediateWorkRejection = (
  immediateWorkRejectionData: Partial<ImmediateWorkRejection>
): void => {
  // Check for missing required fields
  ImmediateWorkRejectionRequiredFields?.forEach((field) => {
    if (
      immediateWorkRejectionData[field] === undefined ||
      immediateWorkRejectionData[field] === null ||
      immediateWorkRejectionData[field] === ""
    ) {
      throw new RequiredFieldError(field);
    }
  });

  validateImmediateWorkRejectionUpdate(immediateWorkRejectionData);
};

export const validateImmediateWorkRejectionUpdate = (
  immediateWorkRejectionData: Partial<ImmediateWorkRejection>
): void => {
  Object.keys(immediateWorkRejectionData)?.forEach((field) => {
    // Check for unsupported fields
    if (
      !ImmediateWorkRejectionSupportedFields.includes(
        field as keyof ImmediateWorkRejection
      )
    ) {
      throw new UnsupportedFieldError(field);
    } else {
      if (field === "timestamps") {
        throw new Error("Field 'timestamps' is auto-generated.");
      }

      validateTypes(
        field as keyof ImmediateWorkRejection,
        immediateWorkRejectionData[field as keyof ImmediateWorkRejection]
      );
    }
  });
};
