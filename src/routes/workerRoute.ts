import { Router } from "express";
import {
  createWorker,
  deleteWorkerById,
  getWorkerBasicInfoById,
  getWorkerById,
  getWorkers,
  updateWorkerById,
} from "../controllers/workerController";

const workerRouter = Router();

// Create a new worker
workerRouter.post("/", async (req, res) => {
  try {
    const worker = await createWorker(req.body);

    if (worker) {
      res.status(201).json(worker);
    } else {
      res.status(400).send("Error creating worker");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Get all workers
workerRouter.get("/", async (req, res) => {
  try {
    const worker = await getWorkers();

    if (worker) {
      res.status(200).json(worker);
    } else {
      res.status(404).send("Worker not found!");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Get a worker by ID
workerRouter.get("/:id", async (req, res) => {
  try {
    const worker = await getWorkerById(req.params?.id);

    if (worker) {
      res.status(200).json(worker);
    } else {
      res.status(404).send("Worker not found!");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Get worker's basic info by ID
workerRouter.get("/:id/basic-info", async (req, res) => {
  try {
    const worker = await getWorkerBasicInfoById(req.params?.id);

    if (worker) {
      res.status(200).json(worker);
    } else {
      res.status(404).send("Worker not found!");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Update a worker by ID
workerRouter.put("/:id", async (req, res) => {
  try {
    const updatedWorker = await updateWorkerById(req.params?.id, req.body);

    if (updatedWorker) {
      res.status(200).json(updatedWorker);
    } else {
      res.status(404).send("Worker not found!");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Delete a worker by ID
workerRouter.delete("/:id", async (req, res) => {
  try {
    const deletedWorker = await deleteWorkerById(req.params?.id);

    if (deletedWorker) {
      res.status(200).send("Worker deleted successfully!");
    } else {
      res.status(404).send("Worker not found!");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

export default workerRouter;
