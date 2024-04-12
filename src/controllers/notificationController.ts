import { Timestamp } from "firebase-admin/firestore";
import { db } from "../services/firebase";
import { ImmediateWorkAlert } from "../types/notification";
import { validateImmediateWorkAlert } from "../validators/notificationValidator";
import { CustomError } from "../errors";
import * as admin from "firebase-admin";

// Create a new Immediate Work Alert
export const createImmediateWorkAlert = async (
  immediateWorkAlertData: ImmediateWorkAlert
): Promise<ImmediateWorkAlert> => {
  try {
    validateImmediateWorkAlert(immediateWorkAlertData);

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

// Get a notification by ID
export const getNotificationById = async (id: string): Promise<ImmediateWorkAlert> => {
  try {
    const notificationRef = db?.collection("notifications")?.doc(id);
    const notification = await notificationRef.get();

    return notification?.data() as ImmediateWorkAlert;
  } catch (error) {
    console.error("Error getting notification:", error);
    throw new CustomError(`${error}`, 400);
  }
};
