require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const analyticsRoutes = require("./routes/analytics");
const authRoutes = require("./routes/auth");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Analytics backend is running");
});

app.use("/api/analytics", analyticsRoutes);

function logMethods(route) {
  return Object.keys(route.methods)
    .filter((m) => route.methods[m])
    .join(", ")
    .toUpperCase();
}

function logStack(router, basePath) {
  if (!router?.stack) return;
  router.stack.forEach((layer) => {
    if (layer.route) {
      console.log(
        `  ${logMethods(layer.route).padEnd(18)} ${basePath}${layer.route.path}`,
      );
    }
  });
}

console.log("MONGODB_URI:", process.env.MONGODB_URI ? "loaded" : "missing");
console.log("PORT:", process.env.PORT || 5000);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(process.env.PORT || 5000, () => {
      const port = process.env.PORT || 5000;
      console.log(`Server running on http://localhost:${port}`);
      console.log("Registered HTTP routes:");
      console.log("  GET                /");
      logStack(authRoutes, "/api/auth");
      logStack(analyticsRoutes, "/api/analytics");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });
