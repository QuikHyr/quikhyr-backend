import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "../firebase";
import { Worker, WorkerBasicInfo } from "../types/worker";

// Create a new worker
export const createWorker = async (
  workerData: Worker
): Promise<Worker | null> => {
  try {
    // Make sure the associated subservices are provided
    if (!workerData?.subservices || workerData?.subservices?.length === 0) {
      throw new Error("Subservices associated are required!");
    }

    const workerRef = db?.collection("workers")?.doc(workerData?.id);

    const worker: Worker = {
      ...workerData,
      timestamps: { createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
    };

    await workerRef.set(worker);
    console.log("Worker created successfully!");

    // Add worker's ID to associated subservices' workers array
    const batch = db.batch();
    for (const subserviceId of workerData?.subservices) {
      const subserviceRef = db?.collection("subservices")?.doc(subserviceId);
      batch.update(subserviceRef, {
        workers: FieldValue.arrayUnion(workerRef?.id),
      });
    }
    await batch.commit();

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
    const workers = querySnapshot?.docs.map((doc) => doc?.id);

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

    // Fetch currently associated subservices
    const workerSnapshot = await workerRef.get();
    const currentSubservices = workerSnapshot.get("subservices");

    if (
      workerData?.subservices &&
      workerData?.subservices !== currentSubservices
    ) {
      const batch = db.batch();

      // Calculate added and removed subservices
      const addedSubservices = workerData.subservices?.filter(
        (subserviceId: string) => !currentSubservices?.includes(subserviceId)
      );
      const removedSubservices = currentSubservices?.filter(
        (subserviceId: string) =>
          !workerData?.subservices?.includes(subserviceId)
      );

      // Update subservices' workers array
      addedSubservices?.forEach((subserviceId: string) => {
        const subserviceRef = db?.collection("subservices")?.doc(subserviceId);
        batch.update(subserviceRef, {
          workers: FieldValue.arrayUnion(workerRef.id),
        });
      });

      removedSubservices?.forEach((subserviceId: string) => {
        const subserviceRef = db?.collection("subservices")?.doc(subserviceId);
        batch.update(subserviceRef, {
          workers: FieldValue.arrayRemove(workerRef.id),
        });
      });

      await batch.commit();
    }

    // Update the worker
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

    // Fetch currently associated subservices
    const workerSnapshot = await workerRef.get();
    const currentSubservices = workerSnapshot.get("subservices");

    // Remove worker's ID from associated subservices' workers array
    const batch = db.batch();
    currentSubservices?.forEach((subserviceId: string) => {
      const subserviceRef = db?.collection("subservices")?.doc(subserviceId);
      batch.update(subserviceRef, {
        workers: FieldValue.arrayRemove(workerRef.id),
      });
    });
    await batch.commit();

    await workerRef.delete();
    console.log(`Worker with ID: ${id} updated successfully!`);

    return true;
  } catch (error) {
    console.error("Error deleting worker:", error);
    return null;
  }
};
