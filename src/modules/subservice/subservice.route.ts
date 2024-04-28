import { Router } from "express";
import {
  createSubservice,
  deleteSubserviceById,
  getSubserviceById,
  getSubservices,
  updateSubserviceById,
} from "./subservice.controller";

const subserviceRouter = Router();

// Create a new subservice
subserviceRouter.post("/", async (req, res, next) => {
  try {
    const subservice = await createSubservice(req?.body);

    if (subservice) {
      res.status(201).json(subservice);
    } else {
      res.status(400).send("Error creating subservice");
    }
  } catch (error) {
    next(error);
  }
});

// Get all subservices as data or filtered by serviceId, workerId
subserviceRouter.get("/", async (req, res, next) => {
  try {
    const { serviceId, workerId } = req?.query as {
      serviceId?: string;
      workerId?: string;
    };

    const subservices = await getSubservices(serviceId, workerId);

    if (subservices) {
      res.status(200).json(subservices);
    } else {
      res.status(404).send("No subservices found!");
    }
  } catch (error) {
    next(error);
  }
});

// Get a subservice by ID
subserviceRouter.get("/:id", async (req, res, next) => {
  try {
    const subservice = await getSubserviceById(req?.params?.id);

    if (subservice) {
      res.status(200).json(subservice);
    } else {
      res.status(404).send("Subservice not found!");
    }
  } catch (error) {
    next(error);
  }
});

// Update a subservice by ID
subserviceRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedSubservice = await updateSubserviceById(
      req?.params?.id,
      req?.body
    );

    if (updatedSubservice) {
      res.status(200).json(updatedSubservice);
    } else {
      res.status(404).send("Subservice not found!");
    }
  } catch (error) {
    next(error);
  }
});

// Delete a subservice by ID
subserviceRouter.delete("/:id", async (req, res, next) => {
  try {
    const deletedSubservice = await deleteSubserviceById(req?.params?.id);

    if (deletedSubservice) {
      res.status(200).send("Subservice deleted successfully!");
    } else {
      res.status(404).send("Subservice not found!");
    }
  } catch (error) {
    next(error);
  }
});

export default subserviceRouter;
