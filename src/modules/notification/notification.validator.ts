import { ImmediateWorkRejection } from "./notification.type";
import {
  AutoGeneratedFieldError,
  NumberFieldError,
  RequiredFieldError,
  StringFieldError,
  UnsupportedFieldError,
} from "../../errors";
import {
  ImmediateWorkAlert,
  ImmediateWorkApprovalRequest,
  ImmediateWorkApprovalRequest as ImmediateWorkConfirmation,
  Notification,
} from "./notification.type";

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

const NotificationAutoGeneratedFields: (keyof Notification)[] = [
  "id",
  "type",
  "timestamps",
];

const NotificationSupportedFields: (keyof Notification)[] = [
  ...NotificationRequiredFields,
  ...NotificationAutoGeneratedFields,
];

// Immediate Work Alert Fields
const ImmediateWorkAlertRequiredFields: (keyof ImmediateWorkAlert)[] = [
  "senderId",
  "subserviceId",
  "description",
  "location",
];

const ImmediateWorkAlertOptionalFields: (keyof ImmediateWorkAlert)[] = [
  "images",
];

const ImmediateWorkAlertAutoGeneratedFields: (keyof ImmediateWorkAlert)[] = [
  "id",
  "type",
  "workAlertId",
  "receiverIds",
  "locationName",
  "timestamps",
];

const ImmediateWorkAlertSupportedFields: (keyof ImmediateWorkAlert)[] = [
  ...ImmediateWorkAlertRequiredFields,
  ...ImmediateWorkAlertOptionalFields,
  ...ImmediateWorkAlertAutoGeneratedFields,
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

const ImmediateWorkApprovalRequestAutogeneratedFields: (keyof ImmediateWorkApprovalRequest)[] =
  ["id", "type", "workApprovalRequestId", "timestamps"];

const ImmediateWorkApprovalRequestSupportedFields: (keyof ImmediateWorkApprovalRequest)[] =
  [
    ...ImmediateWorkApprovalRequestRequiredFields,
    ...ImmediateWorkApprovalRequestAutogeneratedFields,
  ];

// Immediate Work Confirmation Fields
const ImmediateWorkConfirmationRequiredFields: (keyof ImmediateWorkConfirmation)[] =
  [...ImmediateWorkApprovalRequestRequiredFields, "workApprovalRequestId"];

const ImmediateWorkConfirmationAutoGeneratedFields: (keyof ImmediateWorkConfirmation)[] =
  ["id", "type", "timestamps"];

const ImmediateWorkConfirmationSupportedFields: (keyof ImmediateWorkConfirmation)[] =
  [
    ...ImmediateWorkConfirmationRequiredFields,
    ...ImmediateWorkConfirmationAutoGeneratedFields,
  ];

// Immediate Work Rejection Fields
const ImmediateWorkRejectionRequiredFields: (keyof ImmediateWorkRejection)[] = [
  ...NotificationRequiredFields,
  "workAlertId",
  "workApprovalRequestId",
];

const immediateWorkRejectionAutoGeneratedFields: (keyof ImmediateWorkRejection)[] =
  ["id", "type", "timestamps"];

const ImmediateWorkRejectionSupportedFields: (keyof ImmediateWorkRejection)[] =
  [
    ...ImmediateWorkRejectionRequiredFields,
    ...immediateWorkRejectionAutoGeneratedFields,
  ];

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
    case "dateTime":
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
    } else if (
      NotificationAutoGeneratedFields.includes(field as keyof Notification)
    ) {
      throw new AutoGeneratedFieldError(field);
    }

    validateTypes(
      field as keyof Notification,
      NotificationData[field as keyof Notification]
    );
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
    } else if (
      ImmediateWorkAlertAutoGeneratedFields.includes(
        field as keyof ImmediateWorkAlert
      )
    ) {
      if (field === "receiverIds") {
        throw new Error("Field 'receiverIds' is auto-fetched.");
      } else throw new AutoGeneratedFieldError(field);
    }

    validateTypes(
      field as keyof ImmediateWorkAlert,
      immediateWorkAlertData[field as keyof ImmediateWorkAlert]
    );
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
    } else if (
      ImmediateWorkApprovalRequestAutogeneratedFields.includes(
        field as keyof ImmediateWorkApprovalRequest
      )
    ) {
      throw new AutoGeneratedFieldError(field);
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
    } else if (
      ImmediateWorkConfirmationAutoGeneratedFields.includes(
        field as keyof ImmediateWorkConfirmation
      )
    ) {
      throw new AutoGeneratedFieldError(field);
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
    } else if (
      immediateWorkRejectionAutoGeneratedFields.includes(
        field as keyof ImmediateWorkRejection
      )
    ) {
      throw new AutoGeneratedFieldError(field);
    }

    validateTypes(
      field as keyof ImmediateWorkRejection,
      immediateWorkRejectionData[field as keyof ImmediateWorkRejection]
    );
  });
};
