import { createClient } from "@google/maps";
import dotenv from "dotenv";

dotenv.config();

const googleMapsAPIKey = process.env.GOOGLE_MAPS_API_KEY;
if (!googleMapsAPIKey) {
  throw new Error("Missing environment variable: GOOGLE_MAPS_API_KEY");
}

const googleMapsClient = createClient({
  key: googleMapsAPIKey,
  Promise: Promise,
});

const extractLocationName = (addressComponents: any[]): string => {
  const city = addressComponents?.find((component) =>
    component?.types?.includes("locality")
  );
  const town = addressComponents?.find((component) =>
    component?.types?.includes("administrative_area_level_3")
  );
  const cityName = city ? city.long_name : "";
  const townName = town ? town.long_name : "";
  return cityName || townName;
};

export const getLocationNameFromCoordinates = async (
  lat: number,
  lng: number
): Promise<string | null> => {
  try {
    const response = await googleMapsClient
      ?.reverseGeocode({ latlng: [lat, lng] })
      ?.asPromise();

    if (response?.json?.results && response?.json?.results.length > 0) {
      const addressComponents = response?.json?.results[0]?.address_components;
      return extractLocationName(addressComponents);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return null;
  }
};

export const getLocationNameFromPincode = async (
  pincode: string
): Promise<string | null> => {
  try {
    const response = await googleMapsClient
      ?.geocode({ components: { postal_code: pincode } })
      ?.asPromise();

    if (response?.json?.results && response?.json?.results.length > 0) {
      const addressComponents = response?.json?.results[0]?.address_components;
      return extractLocationName(addressComponents);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Geocoding failed:", error);
    return null;
  }
};
