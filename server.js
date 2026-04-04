require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const analyticsRoutes = require("./routes/analytics");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Analytics backend is running");
});

app.use("/api/analytics", analyticsRoutes);

console.log("MONGODB_URI:", process.env.MONGODB_URI ? "loaded" : "missing");
console.log("PORT:", process.env.PORT || 5000);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on http://localhost:${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });