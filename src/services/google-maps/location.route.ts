import express, { Request, Response, NextFunction } from "express";
import { getLocationNameFromCoordinates, getLocationNameFromPincode } from "./location.service";

const locationRouter = express.Router();

// Get location name from coordinates
locationRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lat, lng } = req?.query as {
        lat?: number;
        lng?: number;
      };

      const locationName = await getLocationNameFromCoordinates(
        lat as number,
        lng as number
      );

      if (locationName) {
        res.status(200).json({ locationName });
      } else {
        res.status(404).json({ error: "City/Town not identified!" });
      }
    } catch (error) {
      next(error);
    }
  }
);

// Get location name from pincode
locationRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pincode } = req?.query as {
        pincode?: string;
      };

      const locationName = await getLocationNameFromPincode(pincode as string);

      if (locationName) {
        res.status(200).json({ locationName });
      } else {
        res.status(404).json({ error: "City/Town not identified!" });
      }
    } catch (error) {
      next(error);
    }
  }
);

export default locationRouter;
