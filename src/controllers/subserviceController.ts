import { FieldValue } from "firebase-admin/firestore";
import { db } from "../firebase";
import { Subservice } from "../types/subservice";
import { validateSubservice } from "../validators/subserviceValidator";
import { CustomError } from "../errors";

// Create a new subservice
export const createSubservice = async (
  subserviceData: Subservice
): Promise<Subservice> => {
  try {
    validateSubservice(subserviceData);

    const subserviceRef = db?.collection("subservices")?.doc();

    const subservice: Subservice = {
      ...subserviceData,
    };

    await subserviceRef.set(subservice);
    console.log("Subservice created successfully!");

    // // Add subservice's ID to its associated service's subservices array
    // const serviceRef = db
    //   ?.collection("serviceIds")
    //   ?.doc(subserviceData?.serviceId);
    // await serviceRef.update({
    //   subservices: FieldValue.arrayUnion(subserviceRef?.id),
    // });

    return subservice;
  } catch (error) {
    console.error("Error creating Subservice:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Get all subservices
export const getSubservices = async (): Promise<Subservice[]> => {
  try {
    const querySnapshot = await db?.collection("subservices")?.get();
    const subservices: Subservice[] = querySnapshot?.docs.map(
      (subservice) => subservice.data() as Subservice
    );

    return subservices;
  } catch (error) {
    console.error("Error getting subservices:", error);
    throw new CustomError(`${error}`, 400);
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
    throw new CustomError(`${error}`, 400);
  }
};

// Update a subservice by ID
export const updateSubserviceById = async (
  id: string,
  subserviceData: Partial<Subservice>
): Promise<Partial<Subservice>> => {
  try {
    const subserviceRef = db?.collection("subservices")?.doc(id);

    // // Fetch currently associated serviceId
    // const subserviceSnapshot = await subserviceRef.get();
    // const currentServiceId = subserviceSnapshot.get("serviceId");

    // if (
    //   subserviceData?.serviceId &&
    //   subserviceData?.serviceId !== currentServiceId
    // ) {
    //   // Remove the subservice ID from the previously associated service's subservices array
    //   const oldServiceRef = db?.collection("services").doc(currentServiceId);
    //   await oldServiceRef.update({
    //     subservices: FieldValue.arrayRemove(id),
    //   });

    //   // Add the subservice ID to the newly updated serviceId service's subservices array
    //   const newServiceRef = db
    //     ?.collection("serviceIds")
    //     ?.doc(subserviceData?.serviceId);
    //   await newServiceRef.update({
    //     subservices: FieldValue.arrayUnion(id),
    //   });
    // }

    // Update the subservice
    await subserviceRef.update({
      ...subserviceData,
    });
    console.log(`Subservice with ID: ${id} updated successfully!`);

    return subserviceData;
  } catch (error) {
    console.error("Error updating Subservice:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Delete a subservice by ID
export const deleteSubserviceById = async (id: string): Promise<boolean> => {
  try {
    const subserviceRef = db?.collection("subservices")?.doc(id);

    // // Fetch currently associated serviceId
    // const subserviceSnapshot = await subserviceRef.get();
    // const serviceId = subserviceSnapshot.get("serviceId");

    // // Remove the subservice ID from the associated service's subservices array
    // const serviceRef = db?.collection("services").doc(serviceId);
    // await serviceRef.update({
    //   subservices: FieldValue.arrayRemove(id),
    // });

    await subserviceRef.delete();
    console.log(`Subservice with ID: ${id} deleted successfully!`);

    return true;
  } catch (error) {
    console.error("Error deleting Subservice:", error);
    throw new CustomError(`${error}`, 400);
  }
};
