import { Router } from "express";
import {
  createClient,
  deleteClientById,
  getClientBasicInfoById,
  getClientById,
  getClients,
  updateClientById,
} from "../controllers/clientController";

const clientRouter = Router();

// Create a new client
clientRouter.post("/", async (req, res, next) => {
  try {
    const client = await createClient(req?.body);

    if (client) {
      res.status(201).json(client);
    } else {
      res.status(400).send("Error creating client!");
    }
  } catch (error) {
    next(error);
  }
});

// Get all clients
clientRouter.get("/", async (req, res, next) => {
  try {
    const client = await getClients();

    if (client) {
      res.status(200).json(client);
    } else {
      res.status(404).send("No clients found!");
    }
  } catch (error) {
    next(error);
  }
});

// Get a client by ID
clientRouter.get("/:id", async (req, res, next) => {
  try {
    const client = await getClientById(req?.params?.id);

    if (client) {
      res.status(200).json(client);
    } else {
      res.status(404).send("Client not found!");
    }
  } catch (error) {
    next(error);
  }
});

// Get client's basic info by ID
clientRouter.get("/:id/basic-info", async (req, res, next) => {
  try {
    const client = await getClientBasicInfoById(req?.params?.id);

    if (client) {
      res.status(200).json(client);
    } else {
      res.status(404).send("Client not found!");
    }
  } catch (error) {
    next(error);
  }
});

// Update a client by ID
clientRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedClient = await updateClientById(req?.params?.id, req?.body);

    if (updatedClient) {
      res.status(200).json(updatedClient);
    } else {
      res.status(404).send("Client not found!");
    }
  } catch (error) {
    next(error);
  }
});

// Delete a client by ID
clientRouter.delete("/:id", async (req, res, next) => {
  try {
    const deletedClient = await deleteClientById(req?.params?.id);

    if (deletedClient) {
      res.status(200).send("Client deleted successfully!");
    } else {
      res.status(404).send("Client not found!");
    }
  } catch (error) {
    next(error);
  }
});

export default clientRouter;
