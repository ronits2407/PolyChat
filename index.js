const dotenv = require("dotenv");
const path = require("path")
const open = require("open")
dotenv.config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const chatRoutes = require("./api/route");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectToDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }); 
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.warn("Continuing without MongoDB, using in-memory storage");
  }
};

if (process.env.MONGODB_URI) {
  connectToDatabase();
}

app.use("/api", chatRoutes);
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`\n\nPolyChat API server is running on port ${PORT}
access it from here \x1b[32mhttp://localhost:${PORT}/\x1b[0m\n\n`);
open(`http://localhost:${PORT}/`)
});
