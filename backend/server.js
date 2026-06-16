const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const compression = require("compression"); // ✅ Compress responses
const helmet = require("helmet"); // ✅ Security headers
const rateLimit = require("express-rate-limit"); // ✅ Rate limiting
const errorMiddleware = require("./middleware/errorMiddleware");

// Load environment variables
dotenv.config({ path: ".env" });

const app = express();

// --- Security Middleware ---
app.use(helmet()); // ✅ Sets secure HTTP headers
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --- Rate Limiting ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // ✅ Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// --- Performance Middleware ---
app.use(compression()); // ✅ Compress all responses
app.use(express.json({ limit: "10kb" })); // ✅ Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// --- Logging Middleware ---
app.use(morgan("dev")); // ✅ Logs all requests with response times

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

    // Ensure indexes are built before starting the server
    await Promise.all(
      Object.values(mongoose.models).map((model) => model.ensureIndexes())
    );
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

// --- Routes ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));

// --- Root Route (Optional) ---
app.get("/", (_req, res) => {
  res.json({ success: true, message: "API running" });
});

// --- Error Handling ---
app.use(errorMiddleware); // ✅ Must be last

// --- Start Server ---
const PORT = process.env.PORT || 5000;
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

// Connect to DB and start server
connectDB().then(() => {
  console.log("Server ready to accept connections.");
});