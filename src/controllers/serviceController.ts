import { Timestamp } from "firebase-admin/firestore";
import { db } from "../firebase";
import { Service } from "../types/service";
import { CustomError } from "../../errors";

// Create a new service
export const createService = async (
  serviceData: Service
): Promise<Service> => {
  try {
    const serviceRef = db?.collection("services")?.doc();

    const service: Service = {
      ...serviceData,
    };

    await serviceRef.set(service);
    console.log("Service created successfully!");

    return service;
  } catch (error) {
    console.error("Error creating Service:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Get all services
export const getServices = async (): Promise<Service[] | null> => {
  try {
    const querySnapshot = await db?.collection("services")?.get();
    const services: Service[] = querySnapshot?.docs.map(
      (doc) => doc.data() as Service
    );

    return services;
  } catch (error) {
    console.error("Error getting services:", error);
    return null;
  }
};

// Get a service by ID
export const getServiceById = async (id: string): Promise<Service | null> => {
  try {
    const serviceRef = db?.collection("services")?.doc(id);
    const service = await serviceRef.get();

    if (service?.exists) {
      return service?.data() as Service;
    } else {
      console.log("No such service!");
      return null;
    }
  } catch (error) {
    console.error("Error getting service:", error);
    return null;
  }
};

// Update a service by ID
export const updateServiceById = async (
  id: string,
  serviceData: Partial<Service>
): Promise<Partial<Service> | null> => {
  try {
    const serviceRef = db?.collection("services")?.doc(id);

    await serviceRef.update({
      ...serviceData,
      timestamps: {
        updatedAt: Timestamp.now(),
      },
    });
    console.log(`Service with ID: ${id} updated successfully!`);

    return serviceData;
  } catch (error) {
    console.error(`Error updating Service:`, error);
    return null;
  }
};

// Delete a service and associated subservices by ID
export const deleteServiceAndSubservicesById = async (
  id: string
): Promise<boolean> => {
  try {
    const serviceRef = db?.collection("services")?.doc(id);
    const subservicesQuery = db
      ?.collection("subservices")
      .where("serviceId", "==", id);

    // Delete the service
    await serviceRef.delete();

    // Delete associated subservices
    const subservicesSnapshot = await subservicesQuery?.get();
    const batch = db?.batch();
    subservicesSnapshot.forEach((subserviceDoc) => {
      batch.delete(subserviceDoc.ref);
    });
    await batch.commit();

    console.log(
      `Service with ID: ${id} and associated subservices deleted successfully.`
    );

    return true;
  } catch (error) {
    console.error(`Error deleting Service:`, error);
    return false;
  }
};
