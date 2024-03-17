import { Timestamp } from "firebase-admin/firestore";
import { db } from "../firebase";
import { Client, ClientBasicInfo } from "../types/client";

// Create a new client
export const createClient = async (
  clientData: Client
): Promise<Client | null> => {
  try {
    const docRef = db?.collection("clients")?.doc();

    const client: Client = {
      ...clientData,
      timestamps: { createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
    };

    await docRef.set(client);
    console.log("Client created successfully!");

    return client;
  } catch (error) {
    console.error("Error creating client:", error);
    return null;
  }
};

// Get all clients
export const getClients = async (): Promise<string[] | null> => {
  try {
    const querySnapshot = await db?.collection("clients")?.get();
    const clients = querySnapshot?.docs.map((doc) => doc.id);

    return clients;
  } catch (error) {
    console.error("Error getting clients:", error);
    return null;
  }
};

// Get a client by ID
export const getClientById = async (id: string): Promise<Client | null> => {
  try {
    const docRef = db?.collection("clients")?.doc(id);
    const client = await docRef.get();

    if (client?.exists) {
      return client?.data() as Client;
    } else {
      console.log("No such client!");
      return null;
    }
  } catch (error) {
    console.error("Error getting client:", error);
    return null;
  }
};

// Get client's basic info by ID
export const getClientBasicInfoById = async (
  id: string
): Promise<ClientBasicInfo | null> => {
  try {
    const querySnapshot = await db
      ?.collection("clients")
      ?.select("name", "avatar", "pincode")
      ?.limit(1)
      ?.where("id", "==", id)
      .get();

    if (!querySnapshot?.empty) {
      const clientData = querySnapshot?.docs[0]?.data();
      const basicInfo = {
        name: clientData?.name,
        avatar: clientData?.avatar,
        pincode: clientData?.pincode,
      };

      return basicInfo;
    } else {
      console.log("Client not found!");
      return null;
    }
  } catch (error) {
    console.error("Error getting client's basic info:", error);
    return null;
  }
};

// Update a client by ID
export const updateClientById = async (
  id: string,
  clientData: Partial<Client>
): Promise<Client | null> => {
  try {
    const docRef = db?.collection("clients")?.doc(id);
    const currentData = (await docRef.get()).data() as Client | undefined;

    if (!currentData) {
      console.log("No such client!");
      return null;
    }

    const updatedClient: Client = {
      ...currentData,
      ...clientData,
      timestamps: {
        ...currentData.timestamps,
        updatedAt: Timestamp.now(),
      },
    };

    await docRef.set(updatedClient, { merge: true });
    console.log("Client updated successfully!");

    return updatedClient;
  } catch (error) {
    console.error("Error updating client:", error);
    return null;
  }
};

// Delete a client by ID
export const deleteClientById = async (id: string): Promise<boolean | null> => {
  try {
    const docRef = db?.collection("clients")?.doc(id);

    await docRef.delete();
    console.log("Client deleted successfully!");

    return true;
  } catch (error) {
    console.error("Error deleting client:", error);
    return null;
  }
};
