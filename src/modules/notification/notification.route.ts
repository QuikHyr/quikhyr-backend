import { Router } from "express";
import {
  createImmediateWorkAlert,
  createImmediateWorkAlertRejection,
  createImmediateWorkApprovalRequest,
  createImmediateWorkConfirmation,
  createImmediateWorkRejection,
  deleteNotificationById,
  getNotifications,
  getWorkAlertById,
  getWorkApprovalRequestById,
  updateWorkAlertById,
  updateWorkApprovalRequestById,
} from "./notification.controller";

const notificationRouter = Router();

// Create an Immediate Work Alert
notificationRouter.post("/work-alert", async (req, res, next) => {
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

// Create an Immediate Work Alert Rejection
notificationRouter.post("/work-alert-rejection", async (req, res, next) => {
  try {
    const workAlertRejection = await createImmediateWorkAlertRejection(
      req?.body
    );

    if (workAlertRejection) {
      res.status(201).json(workAlertRejection);
    } else {
      res.status(400).send("Error executing Immediate Work Alert Rejection");
    }
  } catch (error) {
    next(error);
  }
});

// Create an Immediate Work Approval Request
notificationRouter.post("/work-approval-request", async (req, res, next) => {
  try {
    const workApprovalRequest = await createImmediateWorkApprovalRequest(
      req?.body
    );

    if (workApprovalRequest) {
      res.status(201).json(workApprovalRequest);
    } else {
      res.status(400).send("Error creating Immediate Work Approval Request");
    }
  } catch (error) {
    next(error);
  }
});

// Create an Immediate Work Confirmation
notificationRouter.post("/work-confirmation", async (req, res, next) => {
  try {
    const workConfirmation = await createImmediateWorkConfirmation(req?.body);

    if (workConfirmation) {
      res.status(201).json(workConfirmation);
    } else {
      res.status(400).send("Error creating Immediate Work Confirmation");
    }
  } catch (error) {
    next(error);
  }
});

// Create an Immediate Work Rejection
notificationRouter.post("/work-rejection", async (req, res, next) => {
  try {
    const workRejection = await createImmediateWorkRejection(req?.body);

    if (workRejection) {
      res.status(201).json(workRejection);
    } else {
      res.status(400).send("Error creating Immediate Work Rejection");
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

// Get an Immediate Work Alert by ID
notificationRouter.get("/work-alert/:id", async (req, res, next) => {
  try {
    const workAlert = await getWorkAlertById(req?.params?.id);

    if (workAlert) {
      res.status(200).json(workAlert);
    } else {
      res.status(404).send("Work alert not found!");
    }
  } catch (error) {
    next(error);
  }
});

// Get an Immediate Work Approval Request by ID
notificationRouter.get("/work-approval-request/:id", async (req, res, next) => {
  try {
    const workApprovalRequest = await getWorkApprovalRequestById(
      req?.params?.id
    );

    if (workApprovalRequest) {
      res.status(200).json(workApprovalRequest);
    } else {
      res.status(404).send("Work Approval Request not found!");
    }
  } catch (error) {
    next(error);
  }
});

// Update a Worker Alert by ID
notificationRouter.put("/work-alert/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedWorkAlert = await updateWorkAlertById(id, req?.body);

    if (updatedWorkAlert) {
      res.status(200).json(updatedWorkAlert);
    } else {
      res.status(404).send("Worker Alert not found!");
    }
  } catch (error) {
    next(error);
  }
});

// Update a Worker Approval Request by ID
notificationRouter.put("/work-approval-request/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedWorkApprovalRequest = await updateWorkApprovalRequestById(
      id,
      req?.body
    );

    if (updatedWorkApprovalRequest) {
      res.status(200).json(updatedWorkApprovalRequest);
    } else {
      res.status(404).send("Worker Approval Request not found!");
    }
  } catch (error) {
    next(error);
  }
});

// Delete a notification
notificationRouter.delete("/:id", async (req, res, next) => {
  try {
    const deletedBooking = await deleteNotificationById(req?.params?.id);

    if (deletedBooking) {
      res.status(200).send("Notification deleted successfully!");
    } else {
      res.status(404).send("Notification not found!");
    }
  } catch (error) {
    next(error);
  }
});

export default notificationRouter;
