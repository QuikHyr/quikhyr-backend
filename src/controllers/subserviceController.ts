import { Timestamp } from "firebase-admin/firestore";
import { db } from "../firebase";
import { Subservice } from "../types/subservice";

// Create a new subservice
export const createSubservice = async (
  subserviceData: Subservice
): Promise<Subservice | null> => {
  try {
    const subserviceRef = db?.collection("subservices")?.doc();

    const subservice: Subservice = {
      ...subserviceData,
      timestamps: { createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
    };

    await subserviceRef.set(subservice);
    console.log("Subservice created successfully!");

    return subservice;
  } catch (error) {
    console.error("Error creating Subservice:", error);
    return null;
  }
};

// Get all subservices
export const getSubservices = async (): Promise<Subservice[] | null> => {
  try {
    const querySnapshot = await db?.collection("subservices")?.get();
    const subservices: Subservice[] = querySnapshot?.docs.map(
      (doc) => doc.data() as Subservice
    );

    return subservices;
  } catch (error) {
    console.error("Error getting subservices:", error);
    return null;
  }
};

// Get a subservice by ID
export const getSubserviceById = async (
  id: string
): Promise<Subservice | null> => {
  try {
    const subserviceRef = db?.collection("subservices")?.doc(id);
    const subservice = await subserviceRef.get();

    if (subservice?.exists) {
      return subservice?.data() as Subservice;
    } else {
      console.log("No such subservice!");
      return null;
    }
  } catch (error) {
    console.error("Error getting subservice:", error);
    return null;
  }
};

// Update a subservice by ID
export const updateSubserviceById = async (
  id: string,
  subserviceData: Partial<Subservice>
): Promise<Partial<Subservice> | null> => {
  try {
    const subserviceRef = db?.collection("subservices")?.doc(id);

    await subserviceRef.update({
      ...subserviceData,
      timestamps: {
        updatedAt: Timestamp.now(),
      },
    });
    console.log("Subservice updated successfully!");

    return subserviceData;
  } catch (error) {
    console.error("Error updating Subservice:", error);
    return null;
  }
};

// Delete a subservice by ID
export const deleteSubserviceById = async (id: string): Promise<boolean> => {
  try {
    const subserviceRef = db?.collection("subservices")?.doc(id);

    await subserviceRef.delete();
    console.log("Subservice deleted successfully!");

    return true;
  } catch (error) {
    console.error("Error deleting Subservice:", error);
    return false;
  }
};
