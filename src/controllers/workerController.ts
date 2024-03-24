import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "../firebase";
import { Worker, WorkerBasicInfo } from "../types/worker";
import { CustomError } from "../errors";
import { validateWorker } from "../validators/workerValidator";

// Create a new worker
export const createWorker = async (workerData: Worker): Promise<Worker> => {
  try {
    validateWorker(workerData);

    const workerRef = db?.collection("workers")?.doc(workerData?.id);

    const worker: Worker = {
      ...workerData,
      timestamps: { createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
    };

    await workerRef.set(worker);
    console.log("Worker created successfully!");

    // // Add worker's ID to associated subservices' workers array
    // const batch = db.batch();
    // for (const subserviceId of workerData?.subservices) {
    //   const subserviceRef = db?.collection("subservices")?.doc(subserviceId);
    //   batch.update(subserviceRef, {
    //     workers: FieldValue.arrayUnion(workerRef?.id),
    //   });
    // }
    // await batch.commit();

    return worker;
  } catch (error) {
    console.error("Error creating worker:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Get all workers as IDs or filtered by serviceId, subserviceId
export const getWorkers = async (
  serviceId?: string,
  subserviceId?: string
): Promise<string[] | Worker[]> => {
  try {
    let query: FirebaseFirestore.Query = db?.collection("workers");

    // Filter workers by serviceId, subserviceId, if provided
    if (serviceId)
      query = query?.where("serviceIds", "array-contains", serviceId);
    if (subserviceId)
      query = query?.where("subserviceIds", "array-contains", subserviceId);

    const querySnapshot = await query?.get();

    if (serviceId || subserviceId) {
      const workers: Worker[] = querySnapshot?.docs?.map(
        (worker) => worker.data() as Worker
      );

      return workers;
    } else {
      const workerIds = querySnapshot?.docs?.map((worker) => worker.id);

      return workerIds as string[];
    }
  } catch (error) {
    console.error("Error getting workers:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Get a worker by ID
export const getWorkerById = async (id: string): Promise<Worker | null> => {
  try {
    const workerRef = db?.collection("workers")?.doc(id);
    const worker = await workerRef.get();

    return worker?.data() as Worker;
  } catch (error) {
    console.error("Error getting worker:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Get worker's basic info by ID
export const getWorkerBasicInfoById = async (
  id: string
): Promise<WorkerBasicInfo> => {
  try {
    const querySnapshot = await db
      ?.collection("workers")
      ?.select("name", "avatar", "pincode")
      ?.limit(1)
      ?.where("id", "==", id)
      .get();

    const workerData = querySnapshot?.docs[0]?.data();
    const basicInfo = {
      name: workerData?.name,
      avatar: workerData?.avatar,
      pincode: workerData?.pincode,
      available: workerData?.available,
    };

    return basicInfo;
  } catch (error) {
    console.error("Error getting worker's basic info:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Update a worker by ID
export const updateWorkerById = async (
  id: string,
  workerData: Partial<Worker>
): Promise<Partial<Worker>> => {
  try {
    validateWorker(workerData);

    const workerRef = db?.collection("workers")?.doc(id);

    // // Fetch currently associated subservices
    // const workerSnapshot = await workerRef.get();
    // const currentSubservices = workerSnapshot.get("subservices");

    // if (
    //   workerData?.subservices &&
    //   workerData?.subservices !== currentSubservices
    // ) {
    //   const batch = db.batch();

    //   // Calculate added and removed subservices
    //   const addedSubservices = workerData.subservices?.filter(
    //     (subserviceId: string) => !currentSubservices?.includes(subserviceId)
    //   );
    //   const removedSubservices = currentSubservices?.filter(
    //     (subserviceId: string) =>
    //       !workerData?.subservices?.includes(subserviceId)
    //   );

    //   // Update subservices' workers array
    //   addedSubservices?.forEach((subserviceId: string) => {
    //     const subserviceRef = db?.collection("subservices")?.doc(subserviceId);
    //     batch.update(subserviceRef, {
    //       workers: FieldValue.arrayUnion(workerRef.id),
    //     });
    //   });

    //   removedSubservices?.forEach((subserviceId: string) => {
    //     const subserviceRef = db?.collection("subservices")?.doc(subserviceId);
    //     batch.update(subserviceRef, {
    //       workers: FieldValue.arrayRemove(workerRef.id),
    //     });
    //   });

    //   await batch.commit();
    // }

    // Update the worker
    await workerRef.update({
      ...workerData,
      timestamps: { updatedAt: Timestamp.now() },
    });
    console.log(`Worker with ID: ${id} updated successfully!`);

    return workerData;
  } catch (error) {
    console.error("Error updating worker:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Delete a worker by ID
export const deleteWorkerById = async (id: string): Promise<boolean> => {
  try {
    const workerRef = db?.collection("workers")?.doc(id);

    // // Fetch currently associated subservices
    // const workerSnapshot = await workerRef.get();
    // const currentSubservices = workerSnapshot.get("subservices");

    // // Remove worker's ID from associated subservices' workers array
    // const batch = db.batch();
    // currentSubservices?.forEach((subserviceId: string) => {
    //   const subserviceRef = db?.collection("subservices")?.doc(subserviceId);
    //   batch.update(subserviceRef, {
    //     workers: FieldValue.arrayRemove(workerRef.id),
    //   });
    // });
    // await batch.commit();

    const workerSnapshot = await workerRef.get();
    if (!workerSnapshot.exists) {
      console.log(`Worker with ID: ${id} does not exist.`);
      return false;
    }

    await workerRef.delete();
    console.log(`Worker with ID: ${id} updated successfully!`);

    return true;
  } catch (error) {
    console.error("Error deleting worker:", error);
    throw new CustomError(`${error}`, 400);
  }
};
