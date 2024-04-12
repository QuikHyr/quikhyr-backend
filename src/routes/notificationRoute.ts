import { Router } from "express";
import {
  createImmediateWorkAlert,
  getNotificationById,
  getNotifications,
} from "../controllers/notificationController";

const notificationRouter = Router();

// Create a new notification
notificationRouter.post("/", async (req, res, next) => {
  try {
    const workAlert = await createImmediateWorkAlert(req?.body);

    if (workAlert) {
      res.status(201).json(workAlert);
    } else {
      res.status(400).send("Error creating Immediate Work Alert");
    }
  } catch (error) {
    next(error);
  }
});

// Get all notifications as IDs or filtered by clientId or workerId
notificationRouter.get("/", async (req, res, next) => {
  try {
    const { clientId, workerId } = req?.query as {
      clientId?: string;
      workerId?: string;
    };

    const notifications = await getNotifications(clientId, workerId);

    if (
      notifications &&
      notifications instanceof Array &&
      notifications?.length > 0
    ) {
      res.status(200).json(notifications);
    } else {
      res.status(404).send("No notifications found!");
    }
  } catch (error) {
    next(error);
  }
});

// Get a notification by ID
notificationRouter.get("/:id", async (req, res, next) => {
  try {
    const notification = await getNotificationById(req?.params?.id);

    if (notification) {
      res.status(200).json(notification);
    } else {
      res.status(404).send("Notification not found!");
    }
  } catch (error) {
    next(error);
  }
});

export default notificationRouter;
