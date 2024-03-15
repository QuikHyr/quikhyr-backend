import { Router } from "express";
import {
  createClient,
  deleteClient,
  getClient,
  updateClient,
} from "../controllers/clientController";

const clientRouter = Router();

clientRouter.post("/", async (req, res) => {
  try {
    const client = await createClient(req.body);

    if (client) {
      res.status(201).json(client);
    } else {
      res.status(400).send("Error creating client");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

clientRouter.get("/:id", async (req, res) => {
  try {
    const client = await getClient(req.params?.id);

    if (client) {
      res.status(200).json(client);
    } else {
      res.status(404).send("Client not found!");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

clientRouter.put("/:id", async (req, res) => {
  try {
    const updatedClient = await updateClient(req.params?.id, req.body);

    if (updatedClient) {
      res.status(200).json(updatedClient);
    } else {
      res.status(404).send("Client not found!");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

clientRouter.delete("/:id", async (req, res) => {
  try {
    const client = await deleteClient(req.params?.id);

    if (client) {
      res.status(200).send("Client deleted!");
    } else {
      res.status(404).send("Client not found!");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

export default clientRouter;
