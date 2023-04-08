import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

import connectDB from "./config/db.js";
import { clientDir, uploadsDir } from "./config/dir.js";

import express from "express";

import cors from "cors";
import xss from "xss-clean";
import hpp from "hpp";
import rateLimit from "express-rate-limit";

import morgan from "morgan";
import colors from "colors";

import errorHandler from "./middleware/errorHandler.js";

// import ingredientsRoutes from "./routes/ingredientsRoutes.js";
// import sandwichesRoutes from "./routes/sandwichesRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";

connectDB();

const app = express();

// ==== Logging ==== //
app.use(morgan("dev"));

// CORS cross-domain access
app.use(cors());

// Body parser middleware
app.use(express.json());

// ==== Security ==== //
// parse URL-encoded data received from the client
app.use(express.urlencoded({ extended: true }));
// xss-clean: A middleware for sanitizing user input (req.body, req.query, and req.params) to prevent XSS attacks
app.use(xss());
// hpp: A middleware for preventing HTTP Parameter Pollution attacks.
app.use(hpp());
// Rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later",
});
app.use("/api/", limiter);

// === Main routes === //
// app.use("/api/v1/ingredients", ingredientsRoutes);
// app.use("/api/v1/sandwiches", sandwichesRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);

// === Middleware === //
app.use(errorHandler);

// === Forward static content === //
// Front-End
app.use("/", express.static(clientDir));
// Uploads folder
app.use("/uploads", express.static(uploadsDir));

// Logging
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(
        `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.brightYellow
            .underline
    )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    server.close(() => process.exit(1));
});
