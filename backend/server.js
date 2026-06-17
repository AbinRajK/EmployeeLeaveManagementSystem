const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const errorMiddleware = require("./middleware/errorMiddleware");

dotenv.config({ path: ".env" });

const app = express();

// --- Security Middleware ---
app.use(helmet());

const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));        // ADD THIS — applies CORS headers to all responses
app.options("/{*path}", cors(corsOptions)); // keeps preflight handling

// --- Rate Limiting ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// --- Performance Middleware ---
app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// --- Logging Middleware ---
app.use(morgan("dev"));

// --- Routes ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));

// --- Root Route ---
app.get("/", (_req, res) => {
  res.json({ success: true, message: "API running" });
});

// --- Error Handling ---
app.use(errorMiddleware);

// --- Database Connection ---
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: "majority",
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await Promise.all(
      Object.values(mongoose.models).map((model) => model.ensureIndexes())
    );
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

// --- Start Server only after DB is ready ---
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });

  // --- Graceful Shutdown ---
  process.on("unhandledRejection", (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    server.close(() => {
      console.log("Server closed.");
      mongoose.connection.close();
      process.exit(0);
    });
  });
});