import express, { Express } from "express";
import cors from "cors";
import clientRouter from "./routes/clientRoute";
import workerRouter from "./routes/workerRoute";
import subserviceRouter from "./routes/subserviceRoute";
import serviceRouter from "./routes/serviceRoute";
import { errorHandler } from "./middlewares/errorHandler";
import bookingRouter from "./routes/bookingRoute";
import ratingRouter from "./routes/ratingRoute";
import notificationRouter from "./routes/notificationRoute";
import locationRouter from "./routes/locationRoute";

const app: Express = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
      <div style="background-color: #3399CC; color: black; padding: 48px; border-radius: 32px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); font-family: 'Poppins', sans-serif;">
        <span style="text-align: center; margin-bottom: 20px; font-weight: 600; font-size: 24px;">Welcome to QuikHyr Backend API</span>
        <ul style="list-style-type: none; padding: 0;">
          <li style="margin-bottom: 10px;">GET /api/clients</li>
          <li style="margin-bottom: 10px;">GET /api/workers</li>
          <li style="margin-bottom: 10px;">GET /api/services</li>
          <li style="margin-bottom: 10px;">GET /api/subservices</li>
          <li style="margin-bottom: 10px;">GET /api/bookings</li>
          <li style="margin-bottom: 10px;">GET /api/ratings</li>
          <li style="margin-bottom: 10px;">GET /api/notifications</li>
          <li style="margin-bottom: 10px;">GET /api/location</li>
        </ul>
      </div>
    </div>
  `);
});

// API Routes
app.use("/api/clients", clientRouter);
app.use("/api/workers", workerRouter);
app.use("/api/services", serviceRouter);
app.use("/api/subservices", subserviceRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/ratings", ratingRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/location", locationRouter);

app.use(errorHandler);

// Server Listening
app.listen(port, () =>
  console.log(`[server]: running at http://localhost:${port}`)
);
