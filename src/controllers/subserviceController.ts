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

    return subservice;
  } catch (error) {
    console.error("Error creating Subservice:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Get all subservices as data or filtered by serviceId
export const getSubservices = async (
  serviceId?: string
): Promise<Subservice[] | null> => {
  try {
    let query: FirebaseFirestore.Query = await db?.collection("subservices");

    // Filter subservices by serviceId, if provided
    if (serviceId) query = query?.where("serviceId", "==", serviceId);

    const querySnapshot = await query?.get();
    const subservices: Subservice[] = querySnapshot?.docs.map(
      (subservice) => subservice.data() as Subservice
    );

    if (subservices?.length === 0) {
      console.log("No subservices found!");
      return null;
    } else return subservices;
  } catch (error) {
    console.error("Error getting subservices:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Get a subservice by ID
export const getSubserviceById = async (id: string): Promise<Subservice> => {
  try {
    const subserviceRef = db?.collection("subservices")?.doc(id);
    const subservice = await subserviceRef.get();

    return subservice?.data() as Subservice;
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

    const subserviceSnapshot = await subserviceRef.get();
    if (!subserviceSnapshot.exists) {
      console.log(`Subservice with ID: ${id} does not exist.`);
      return false;
    }

    await subserviceRef.delete();
    console.log(`Subservice with ID: ${id} deleted successfully!`);

    return true;
  } catch (error) {
    console.error("Error deleting Subservice:", error);
    throw new CustomError(`${error}`, 400);
  }
};
