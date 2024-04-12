import { Router } from "express";
import {
  createWorker,
  deleteWorkerById,
  getMostRatedWorkersBasicInfo,
  getWorkerById,
  getWorkers,
  updateWorkerById,
} from "../controllers/workerController";

const workerRouter = Router();

// Create a new worker
workerRouter.post("/", async (req, res, next) => {
  try {
    const worker = await createWorker(req?.body);

    if (worker) {
      res.status(201).json(worker);
    } else {
      res.status(400).send("Error creating worker!");
    }
  } catch (error) {
    next(error);
  }
});

// Get all workers as IDs or filtered by serviceId, subserviceId
workerRouter.get("/", async (req, res, next) => {
  try {
    const { serviceId, subserviceId } = req?.query as {
      serviceId?: string;
      subserviceId?: string;
    };

    const workers = await getWorkers(serviceId, subserviceId);

    if (workers?.length > 0) {
      res.status(200).json(workers);
    } else {
      res.status(404).send("No workers found!");
    }
  } catch (error) {
    next(error);
  }
});

// Get a worker by ID
workerRouter.get("/:id", async (req, res, next) => {
  try {
    const worker = await getWorkerById(req?.params?.id);

    if (worker) {
      res.status(200).json(worker);
    } else {
      res.status(404).send("Worker not found!");
    }
  } catch (error) {
    next(error);
  }
});

// Get most rated worker's basic info
workerRouter.get("/most-rated", async (req, res, next) => {
  try {
    const workers = await getMostRatedWorkersBasicInfo();

    if (workers?.length > 0) {
      res.status(200).json(workers);
    } else {
      res.status(404).send("No workers found!");
    }
  } catch (error) {
    next(error);
  }
});

// Update a worker by ID
workerRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedWorker = await updateWorkerById(req?.params?.id, req?.body);

    if (updatedWorker) {
      res.status(200).json(updatedWorker);
    } else {
      res.status(404).send("Worker not found!");
    }
  } catch (error) {
    next(error);
  }
});

// Delete a worker by ID
workerRouter.delete("/:id", async (req, res, next) => {
  try {
    const deletedWorker = await deleteWorkerById(req?.params?.id);

    if (deletedWorker) {
      res.status(200).send("Worker deleted successfully!");
    } else {
      res.status(404).send("Worker not found!");
    }
  } catch (error) {
    next(error);
  }
});

export default workerRouter;
