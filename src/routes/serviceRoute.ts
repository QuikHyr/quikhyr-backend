import { Router } from "express";
import {
  createService,
  deleteServiceAndSubservicesById,
  getServiceById,
  getServices,
  updateServiceById,
} from "../controllers/serviceController";

const serviceRouter = Router();

// Create a new service
serviceRouter.post("/", async (req, res) => {
  try {
    const service = await createService(req.body);

    if (service) {
      res.status(201).json(service);
    } else {
      res.status(400).send("Error creating service");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Get all services
serviceRouter.get("/", async (req, res) => {
  try {
    const services = await getServices();

    if (services) {
      res.status(200).json(services);
    } else {
      res.status(404).send("No services found!");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Get a service by ID
serviceRouter.get("/:id", async (req, res) => {
  try {
    const service = await getServiceById(req.params?.id);

    if (service) {
      res.status(200).json(service);
    } else {
      res.status(404).send("Service not found!");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Update a service by ID
serviceRouter.put("/:id", async (req, res) => {
  try {
    const updatedSubservice = await updateServiceById(req.params?.id, req.body);

    if (updatedSubservice) {
      res.status(200).json(updatedSubservice);
    } else {
      res.status(404).send("Service not found!");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Delete a service and associated subservices by ID
serviceRouter.delete("/:id", async (req, res) => {
  try {
    const deletedSubservice = await deleteServiceAndSubservicesById(
      req.params?.id
    );

    if (deletedSubservice) {
      res.status(200).send("Service and associated subservices deleted successfully!");
    } else {
      res.status(404).send("Service not found!");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

export default serviceRouter;
