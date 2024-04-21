import { Timestamp } from "firebase-admin/firestore";
import { db } from "../services/firebase";
import {
  ImmediateWorkAlert,
  ImmediateWorkApprovalRequest,
  ImmediateWorkApprovalRequest as ImmediateWorkConfirmation,
  ImmediateWorkAlertRejection,
  ImmediateWorkRejection,
} from "../types/notification";
import {
  validateImmediateWorkAlert,
  validateImmediateWorkAlertUpdate,
  validateImmediateWorkApprovalRequest,
  validateImmediateWorkConfirmation,
  validateImmediateWorkRejection,
} from "../validators/notificationValidator";
import { CustomError } from "../errors";
import * as admin from "firebase-admin";
import { getLocationNameFromCoordinates } from "../services/googleMapsService";
import { Booking } from "../types/booking";
import { createBooking } from "./bookingController";

// Create an Immediate Work Alert
export const createImmediateWorkAlert = async (
  immediateWorkAlertData: ImmediateWorkAlert
): Promise<ImmediateWorkAlert> => {
  try {
    validateImmediateWorkAlert(immediateWorkAlertData);

    const locationName = await getLocationNameFromCoordinates(
      immediateWorkAlertData?.location?.latitude,
      immediateWorkAlertData?.location?.longitude
    );

    const transaction = db.runTransaction(async (t) => {
      const notificationRef = db.collection("notifications").doc();

      const query = db
        .collection("workers")
        .where(
          "subserviceIds",
          "array-contains",
          immediateWorkAlertData?.subserviceId
        );

      const querySnapshot = await t.get(query);

      let workAlert: ImmediateWorkAlert = {
        ...immediateWorkAlertData,
        id: notificationRef?.id,
        type: "work-alert",
        workAlertId: notificationRef?.id,
        locationName: locationName ?? "",
        timestamps: { createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
      };
      const workerIds: string[] = [];

      // Send FCM notifications to each worker within the transaction
      querySnapshot.docs.forEach(async (worker) => {
        const message = {
          notification: {
            title: "Immediate Work Alert",
            body: "You have a new work alert.",
          },
          data: {
            workAlert: JSON.stringify(workAlert),
          },
          token: worker.data().fcmToken,
        };

        workerIds.push(worker.id);

        try {
          const response = await admin.messaging().send(message);
          console.log("Successfully sent message:", response);
        } catch (error) {
          console.error("Error sending message:", error);
        }
      });

      // Update the workAlert with the workerIds
      workAlert = {
        ...workAlert,
        receiverIds: workerIds,
      };

      // Set the work alert in the transaction
      await t.set(notificationRef, workAlert);

      return workAlert;
    });

    const result = await transaction;

    console.log("Immediate Work Alert created successfully!");

    return result;
  } catch (error) {
    console.error("Error creating Immediate Work Alert:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Create an Immediate Work Alert Rejection
export const createImmediateWorkAlertRejection = async (
  ImmediateWorkAlertRejectionData: ImmediateWorkAlertRejection
): Promise<ImmediateWorkAlertRejection> => {
  try {
    const transaction = db?.runTransaction(async (t) => {
      // Delete the worker's ID from the associated Worker Alert's ReceiverIds
      const workAlertRef = db
        ?.collection("notifications")
        ?.doc(ImmediateWorkAlertRejectionData?.workAlertId);

      const workAlert = await workAlertRef.get();

      const receiverIds = workAlert
        ?.data()
        ?.receiverIds.filter(
          (id: string) => id !== ImmediateWorkAlertRejectionData?.senderId
        );

      await workAlertRef.update({
        receiverIds: receiverIds,
      });

      console.log(
        "Deleted the worker's ID from the associated Worker Alert's ReceiverIds."
      );

      return ImmediateWorkAlertRejectionData;
    });

    const result = await transaction;

    return result;
  } catch (error) {
    console.error("Error executing Immediate Work Alert Rejection:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Create an Immediate Work Approval Request
export const createImmediateWorkApprovalRequest = async (
  immediateWorkApprovalRequestData: ImmediateWorkApprovalRequest
): Promise<ImmediateWorkApprovalRequest> => {
  try {
    validateImmediateWorkApprovalRequest(immediateWorkApprovalRequestData);

    const transaction = db.runTransaction(async (t) => {
      const notificationRef = db.collection("notifications").doc();

      const workApprovalRequest: ImmediateWorkApprovalRequest = {
        ...immediateWorkApprovalRequestData,
        id: notificationRef?.id,
        type: "work-approval-request",
        workApprovalRequestId: notificationRef?.id,
        timestamps: { createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
      };

      // Send FCM notifications to the client within the transaction
      const client = await db
        .collection("clients")
        .doc(workApprovalRequest?.receiverIds[0])
        .get();

      console.log(client?.data()?.fcmToken);

      const message = {
        notification: {
          title: "Immediate Work Approval Request Received",
          body: "You have a new work approval request.",
        },
        data: {
          workApprovalRequest: JSON.stringify(workApprovalRequest),
        },
        token: client?.data()?.fcmToken,
      };

      try {
        const response = await admin.messaging().send(message);
        console.log("Successfully sent message:", response);
      } catch (error) {
        throw new CustomError(`${error}`, 500);
      }

      // Set the work approval request in the transaction
      await t.set(notificationRef, workApprovalRequest);

      return workApprovalRequest;
    });

    const result = await transaction;

    console.log("Immediate Work Approval Request created successfully!");

    return result;
  } catch (error) {
    console.error("Error creating Immediate Work Approval Request:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Create an Immediate Work Confirmation
export const createImmediateWorkConfirmation = async (
  immediateWorkConfirmationData: ImmediateWorkConfirmation
): Promise<ImmediateWorkConfirmation> => {
  try {
    validateImmediateWorkConfirmation(immediateWorkConfirmationData);

    // Create a new booking
    const bookingData: Partial<Booking> = {
      clientId: immediateWorkConfirmationData?.senderId,
      workerId: immediateWorkConfirmationData?.receiverIds[0],
      subserviceId: immediateWorkConfirmationData?.subserviceId,
      dateTime: Timestamp.fromMillis(
        new Date(immediateWorkConfirmationData?.dateTime as string).getTime()
      ),
      ratePerUnit: immediateWorkConfirmationData?.ratePerUnit,
      unit: immediateWorkConfirmationData?.unit,
      status: "Pending",
      location: immediateWorkConfirmationData?.location,
      locationName: immediateWorkConfirmationData?.locationName,
    };

    await createBooking(bookingData as Booking);

    const transaction = db.runTransaction(async (t) => {
      // Send FCM notifications to the worker within the transaction
      const worker = await db
        .collection("workers")
        .doc(immediateWorkConfirmationData?.receiverIds[0])
        .get();

      const message = {
        notification: {
          title: "Immediate Work Confirmation Received",
          body: "You have a new work confirmation.",
        },
        data: {
          workConfirmation: JSON.stringify(immediateWorkConfirmationData),
        },
        token: worker?.data()?.fcmToken,
      };

      try {
        const response = await admin.messaging().send(message);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.error("Error sending message:", error);
        throw new CustomError(`${error}`, 400);
      }

      // Delete associated Immediate Work Approval Request and Immediate Work Alert
      const workApprovalRequestRef = db
        ?.collection("notifications")
        ?.doc(immediateWorkConfirmationData?.workApprovalRequestId);

      const workAlertRef = db
        ?.collection("notifications")
        ?.doc(immediateWorkConfirmationData?.workAlertId);

      await workApprovalRequestRef.delete();
      await workAlertRef.delete();

      console.log(
        "Associated Immediate Work Approval Request and Work Alert deleted."
      );

      return immediateWorkConfirmationData;
    });

    const result = await transaction;

    console.log("Immediate Work Confirmation sent.");

    return result;
  } catch (error) {
    console.error(
      "Error sending Immediate Work Confirmation and Booking creation:",
      error
    );
    throw new CustomError(`${error}`, 400);
  }
};

// Create an Immediate Work Rejection
export const createImmediateWorkRejection = async (
  immediateWorkRejectionData: ImmediateWorkRejection
): Promise<ImmediateWorkRejection> => {
  try {
    validateImmediateWorkRejection(immediateWorkRejectionData);

    const transaction = db.runTransaction(async (t) => {
      // Send FCM notifications to the worker within the transaction
      const worker = await db
        .collection("workers")
        .doc(immediateWorkRejectionData?.receiverIds[0])
        .get();

      const message = {
        notification: {
          title: "Immediate Work Rejection Received",
          body: "You have a new work rejection.",
        },
        data: {
          workRejection: JSON.stringify(immediateWorkRejectionData),
        },
        token: worker?.data()?.fcmToken,
      };

      try {
        const response = await admin.messaging().send(message);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.error("Error sending message:", error);
        throw new CustomError(`${error}`, 400);
      }

      // Delete associated Immediate Work Approval Request
      const workApprovalRequestRef = db
        ?.collection("notifications")
        ?.doc(immediateWorkRejectionData?.workApprovalRequestId);

      await workApprovalRequestRef.delete();

      console.log("Associated Immediate Work Approval Request deleted.");

      // Delete the worker's ID from the associated Worker Alert's ReceiverIds
      const workAlertRef = db
        ?.collection("notifications")
        ?.doc(immediateWorkRejectionData?.workAlertId);

      const workAlert = await workAlertRef.get();

      const receiverIds = workAlert
        ?.data()
        ?.receiverIds.filter((id: string) => id !== worker?.data()?.id);

      await workAlertRef.update({
        receiverIds: receiverIds,
      });

      console.log(
        "Deleted the worker's ID from the associated Worker Alert's ReceiverIds."
      );

      return immediateWorkRejectionData;
    });

    const result = await transaction;

    console.log("Immediate Work Rejection sent successfully!");

    return result;
  } catch (error) {
    console.error("Error sending Immediate Work Rejection:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Get all notifications as IDs or filtered by clientId, workerId
export const getNotifications = async (
  clientId?: string,
  workerId?: string
): Promise<string[] | ImmediateWorkAlert[]> => {
  try {
    let query: FirebaseFirestore.Query = db?.collection("notifications");

    // Filter notifications by clientId, workerId, if provided
    if (clientId)
      query = query?.where("receiverIds", "array-contains", clientId);
    if (workerId)
      query = query?.where("receiverIds", "array-contains", workerId);

    const querySnapshot = await query?.get();

    if (clientId || workerId) {
      const notifications: ImmediateWorkAlert[] = querySnapshot?.docs?.map(
        (notification) => notification.data() as ImmediateWorkAlert
      );

      return notifications;
    } else {
      const querySnapshot = await query?.get();
      const notificationIds: string[] = querySnapshot?.docs.map(
        (notification) => notification?.id
      );

      return notificationIds;
    }
  } catch (error) {
    console.error("Error getting notifications:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Get an Immediate Work Alert by ID
export const getWorkAlertById = async (
  id: string
): Promise<ImmediateWorkAlert> => {
  try {
    const workAlertRef = db?.collection("notifications")?.doc(id);
    const workAlert = await workAlertRef.get();

    return workAlert?.data() as ImmediateWorkAlert;
  } catch (error) {
    console.error("Error getting Immediate Work Alert:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Get an Immediate Work Approval Request by ID
export const getWorkApprovalRequestById = async (
  id: string
): Promise<ImmediateWorkApprovalRequest> => {
  try {
    const workApprovalRequestRef = db?.collection("notifications")?.doc(id);
    const workApprovalRequest = await workApprovalRequestRef.get();

    return workApprovalRequest?.data() as ImmediateWorkApprovalRequest;
  } catch (error) {
    console.error("Error getting Immediate Work Approval Request:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Update a Worker Alert by ID
export const updateWorkAlertById = async (
  id: string,
  immediateWorkAlertData: Partial<ImmediateWorkAlert>
): Promise<Partial<ImmediateWorkAlert>> => {
  try {
    validateImmediateWorkAlertUpdate(immediateWorkAlertData);

    const workAlertRef = db?.collection("notifications")?.doc(id);

    await workAlertRef.update({
      ...immediateWorkAlertData,
      timestamps: {
        updatedAt: Timestamp.now(),
      },
    });
    console.log(`Work Alert with ID: ${id} updated successfully!`);

    return immediateWorkAlertData;
  } catch (error) {
    console.error(`Error updating work alert:`, error);
    throw new CustomError(`${error}`, 400);
  }
};

// Update a Worker Approval Request by ID
export const updateWorkApprovalRequestById = async (
  id: string,
  immediateWorkApprovalRequestData: Partial<ImmediateWorkApprovalRequest>
): Promise<Partial<ImmediateWorkApprovalRequest>> => {
  try {
    validateImmediateWorkAlertUpdate(immediateWorkApprovalRequestData);

    const workApprovalRequestRef = db?.collection("notifications")?.doc(id);

    await workApprovalRequestRef.update({
      ...immediateWorkApprovalRequestData,
      timestamps: {
        updatedAt: Timestamp.now(),
      },
    });
    console.log(`Work Approval Request with ID: ${id} updated successfully!`);

    return immediateWorkApprovalRequestData;
  } catch (error) {
    console.error(`Error updating work approval request:`, error);
    throw new CustomError(`${error}`, 400);
  }
};

// Delete a notification
export const deleteNotificationById = async (id: string): Promise<boolean> => {
  try {
    const notificationRef = db?.collection("notifications")?.doc(id);

    const notificationSnapshot = await notificationRef.get();
    if (!notificationSnapshot.exists) {
      console.log(`Notification with ID: ${id} does not exist.`);
      return false;
    }

    await notificationRef.delete();
    console.log(`Notification with ID: ${id} deleted successfully.`);

    return true;
  } catch (error) {
    console.error(`Error deleting Notification:`, error);
    return false;
  }
};
