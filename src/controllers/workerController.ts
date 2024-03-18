import { Timestamp } from "firebase-admin/firestore";
import { db } from "../firebase";
import { Worker, WorkerBasicInfo } from "../types/worker";

// Create a new worker
export const createWorker = async (
  workerData: Worker
): Promise<Worker | null> => {
  try {
    const workerRef = db?.collection("workers")?.doc();

    const worker: Worker = {
      ...workerData,
      timestamps: { createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
    };

    await workerRef.set(worker);
    console.log("Worker created successfully!");

    return worker;
  } catch (error) {
    console.error("Error creating worker:", error);
    return null;
  }
};

// Get all workers
export const getWorkers = async (): Promise<string[] | null> => {
  try {
    const querySnapshot = await db?.collection("workers")?.get();
    const workers = querySnapshot?.docs.map((doc) => doc.id);

    return workers;
  } catch (error) {
    console.error("Error getting workers:", error);
    return null;
  }
};

// Get a worker by ID
export const getWorkerById = async (id: string): Promise<Worker | null> => {
  try {
    const workerRef = db?.collection("workers")?.doc(id);
    const worker = await workerRef.get();

    if (worker?.exists) {
      return worker?.data() as Worker;
    } else {
      console.log("No such worker!");
      return null;
    }
  } catch (error) {
    console.error("Error getting worker:", error);
    return null;
  }
};

// Get worker's basic info by ID
export const getWorkerBasicInfoById = async (
  id: string
): Promise<WorkerBasicInfo | null> => {
  try {
    const querySnapshot = await db
      ?.collection("workers")
      ?.select("name", "avatar", "pincode")
      ?.limit(1)
      ?.where("id", "==", id)
      .get();

    if (!querySnapshot?.empty) {
      const workerData = querySnapshot?.docs[0]?.data();
      const basicInfo = {
        name: workerData?.name,
        avatar: workerData?.avatar,
        pincode: workerData?.pincode,
        available: workerData?.available,
      };

      return basicInfo;
    } else {
      console.log("No such worker!");
      return null;
    }
  } catch (error) {
    console.error("Error getting worker's basic info:", error);
    return null;
  }
};

// Update a worker by ID
export const updateWorkerById = async (
  id: string,
  workerData: Partial<Worker>
): Promise<Partial<Worker> | null> => {
  try {
    const workerRef = db?.collection("workers")?.doc(id);
    await workerRef.update({
      ...workerData,
      timestamps: { updatedAt: Timestamp.now() },
    });
    console.log(`Worker with ID: ${id} updated successfully!`);

    return workerData;
  } catch (error) {
    console.error("Error updating worker:", error);
    return null;
  }
};

// Delete a worker by ID
export const deleteWorkerById = async (id: string): Promise<boolean | null> => {
  try {
    const workerRef = db?.collection("workers")?.doc(id);

    await workerRef.delete();
    console.log(`Worker with ID: ${id} updated successfully!`);

    return true;
  } catch (error) {
    console.error("Error deleting worker:", error);
    return null;
  }
};
