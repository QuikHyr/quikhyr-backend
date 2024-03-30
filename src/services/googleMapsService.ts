import { createClient } from "@google/maps";

require("dotenv").config();

const googleMapsClient = createClient({
  key: process.env.GOOGLE_MAPS_API_KEY ?? "",
  Promise: Promise,
});

// Get location name from coordinates
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
      const city = addressComponents?.find((component) =>
        component?.types?.includes("locality")
      );
      const town = addressComponents?.find((component) =>
        component?.types?.includes("administrative_area_level_3")
      );
      const cityName = city ? city.long_name : "";
      const townName = town ? town.long_name : "";
      const locationName = cityName || townName;

      console.log(`City/Town: ${locationName}`);
      return locationName;
    } else {
      console.log("City/Town not identified!");
      return null;
    }
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return null;
  }
};

// Get location name from pincode
export const getLocationNameFromPincode = async (
  pincode: string
): Promise<string | null> => {
  try {
    const response = await googleMapsClient
      ?.geocode({ components: { postal_code: pincode } })
      ?.asPromise();

    if (response?.json?.results && response?.json?.results.length > 0) {
      const addressComponents = response?.json?.results[0]?.address_components;
      const city = addressComponents?.find((component) =>
        component?.types?.includes("locality")
      );
      const town = addressComponents?.find((component) =>
        component?.types?.includes("administrative_area_level_3")
      );
      const cityName = city ? city.long_name : "";
      const townName = town ? town.long_name : "";
      const locationName = cityName || townName;

      console.log(`City/Town: ${locationName}`);
      return locationName;
    } else {
      console.log("City/Town not identified!");
      return null;
    }
  } catch (error) {
    console.error("Geocoding failed:", error);
    return null;
  }
};
