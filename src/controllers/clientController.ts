import { Timestamp } from "firebase-admin/firestore";
import Client from "../models/clientModel";
import { db } from "../firebase";

export const createClient = async (clientData: Client) => {
  try {
    const docRef = db?.collection("clients")?.doc();
    const client = {
      id: docRef?.id,
      name: clientData?.name,
      age: clientData?.age,
      image: clientData?.image,
      email: clientData?.email,
      phone: clientData?.phone,
      gender: clientData?.gender,
      address: clientData?.address,
      pincode: clientData?.pincode,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await docRef.set(client);
    console.log("Client created successfully!");

    return client;
  } catch (error) {
    console.error("Error creating client:", error);
    return null;
  }
};

export const getClient = async (id: string) => {
  try {
    const docRef = db?.collection("clients")?.doc(id);
    const doc = await docRef.get();

    if (doc?.exists) {
      const clientData = doc.data();
      const client = new Client(
        doc?.id,
        clientData?.name,
        clientData?.age,
        clientData?.image,
        clientData?.email,
        clientData?.phone,
        clientData?.gender,
        clientData?.address,
        clientData?.pincode,
        clientData?.createdAt,
        clientData?.updatedAt
      );

      return client;
    } else {
      console.log("No such client!");
      return null;
    }
  } catch (error) {
    console.error("Error getting client:", error);
    return null;
  }
};

export const updateClient = async (id: string, clientData: Partial<Client>) => {
  try {
    const docRef = db?.collection("clients")?.doc(id);
    const currentData = (await docRef.get()).data() || {};
    const updatedClient = {
      ...currentData,
      ...clientData,
      updatedAt: Timestamp.now(),
    };

    await docRef.set(updatedClient, { merge: true });
    console.log("Client updated successfully!");

    return updatedClient;
  } catch (error) {
    console.error("Error updating client:", error);
    return null;
  }
};

export const deleteClient = async (id: string) => {
  try {
    const docRef = db?.collection("clients")?.doc(id);

    await docRef.delete();
    console.log("Client updated successfully!");

    return true;
  } catch (error) {
    console.error("Error deleting client:", error);
    return null;
  }
};
