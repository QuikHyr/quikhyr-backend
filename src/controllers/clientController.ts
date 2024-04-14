import { Timestamp } from "firebase-admin/firestore";
import { db } from "../services/firebase";
import {
  User as Client,
  UserBasicInfo as ClientBasicInfo,
} from "../types/user";
import {
  validateClient,
  validateClientUpdate,
} from "../validators/clientValidator";
import { CustomError } from "../errors";
import {
  getLocationNameFromCoordinates,
  getLocationNameFromPincode,
} from "../services/googleMapsService";

// Create a new client
export const createClient = async (clientData: Client): Promise<Client> => {
  try {
    validateClient(clientData);

    const locationName =
      (await getLocationNameFromCoordinates(
        clientData?.location?.latitude,
        clientData?.location?.longitude
      )) ?? (await getLocationNameFromPincode(clientData?.pincode));

    const clientRef = db?.collection("clients")?.doc(clientData?.id);

    const client: Client = {
      ...clientData,
      locationName: locationName ?? "",
      timestamps: { createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
    };

    await clientRef.set(client);
    console.log("Client created successfully!");

    return client;
  } catch (error) {
    console.error("Error creating client:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Get all clients
export const getClients = async (): Promise<string[]> => {
  try {
    const querySnapshot = await db?.collection("clients")?.get();
    const clients = querySnapshot?.docs.map((client) => client.id);

    return clients;
  } catch (error) {
    console.error("Error getting clients:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Get a client by ID
export const getClientById = async (id: string): Promise<Client> => {
  try {
    const clientRef = db?.collection("clients")?.doc(id);
    const client = await clientRef.get();

    return client?.data() as Client;
  } catch (error) {
    console.error("Error getting client:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Get client's basic info by ID
export const getClientBasicInfoById = async (
  id: string
): Promise<ClientBasicInfo> => {
  try {
    const querySnapshot = await db
      ?.collection("clients")
      ?.select("name", "avatar", "pincode")
      ?.limit(1)
      ?.where("id", "==", id)
      .get();

    const clientData = querySnapshot?.docs[0]?.data();
    const basicInfo = {
      name: clientData?.name,
      avatar: clientData?.avatar,
      pincode: clientData?.pincode,
      isVerified: clientData?.isVerified,
    };

    return basicInfo;
  } catch (error) {
    console.error("Error getting client's basic info:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Update a client by ID
export const updateClientById = async (
  id: string,
  clientData: Partial<Client>
): Promise<Partial<Client>> => {
  try {
    validateClientUpdate(clientData);

    if (clientData?.id && clientData?.id !== id) {
      throw new CustomError(`Field "id" cannot be updated!`, 400);
    }

    let locationName;

    if (clientData?.location) {
      locationName = await getLocationNameFromCoordinates(
        clientData?.location?.latitude,
        clientData?.location?.longitude
      );
    }

    const clientRef = db?.collection("clients")?.doc(id);
    await clientRef.update({
      ...clientData,
      locationName: locationName ?? clientData?.locationName,
      timestamps: { updatedAt: Timestamp.now() },
    });
    console.log(`Client with ID: ${id} updated successfully!`);

    return clientData;
  } catch (error) {
    console.error("Error updating client:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Delete a client by ID
export const deleteClientById = async (id: string): Promise<boolean> => {
  try {
    const clientRef = db?.collection("clients")?.doc(id);

    const clientSnapshot = await clientRef.get();
    if (!clientSnapshot.exists) {
      console.log(`Client with ID: ${id} does not exist.`);
      return false;
    }

    await clientRef.delete();
    console.log(`Client with ID: ${id} deleted successfully!`);

    return true;
  } catch (error) {
    console.error("Error deleting client:", error);
    throw new CustomError(`${error}`, 400);
  }
};
