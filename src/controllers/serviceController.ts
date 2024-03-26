import { db } from "../firebase";
import { Service } from "../types/service";
import { CustomError } from "../errors";
import {
  validateService,
  validateServiceUpdate,
} from "../validators/serviceValidator";

// Create a new service
export const createService = async (serviceData: Service): Promise<Service> => {
  try {
    validateService(serviceData);

    const serviceRef = await db?.collection("services")?.doc();

    const service: Service = {
      ...serviceData,
      id: serviceRef?.id,
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
export const getServices = async (): Promise<Service[]> => {
  try {
    const querySnapshot = await db?.collection("services")?.get();
    const services: Service[] = querySnapshot?.docs.map(
      (service) => service.data() as Service
    );

    return services;
  } catch (error) {
    console.error("Error getting services:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Get a service by ID
export const getServiceById = async (id: string): Promise<Service> => {
  try {
    const serviceRef = db?.collection("services")?.doc(id);
    const service = await serviceRef.get();

    return service?.data() as Service;
  } catch (error) {
    console.error("Error getting service:", error);
    throw new CustomError(`${error}`, 400);
  }
};

// Update a service by ID
export const updateServiceById = async (
  id: string,
  serviceData: Partial<Service>
): Promise<Partial<Service>> => {
  try {
    validateServiceUpdate(serviceData);

    const serviceRef = db?.collection("services")?.doc(id);

    await serviceRef.update({
      ...serviceData,
    });
    console.log(`Service with ID: ${id} updated successfully!`);

    return serviceData;
  } catch (error) {
    console.error(`Error updating Service:`, error);
    throw new CustomError(`${error}`, 400);
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

    const batch = db?.batch();

    // Delete the service
    const serviceSnapshot = await serviceRef.get();
    if (!serviceSnapshot.exists) {
      console.log(`Service with ID: ${id} does not exist.`);
      return false;
    }
    await serviceRef.delete();

    // Delete associated subservices
    const subservicesSnapshot = await subservicesQuery?.get();
    subservicesSnapshot?.forEach((subserviceDoc: any) => {
      if (subserviceDoc.exists) batch?.delete(subserviceDoc?.ref);
    });

    await batch.commit();

    console.log(
      `Service with ID: ${id} and associated subservices deleted successfully.`
    );

    return true;
  } catch (error) {
    console.error(`Error deleting Service:`, error);
    throw new CustomError(`${error}`, 400);
  }
};
