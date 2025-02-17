require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const errorController = require("./controllers/error");

const app = express();
const PORT = process.env.PORT || 3000;

//CORS Headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

//Image Filter
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//Express Middlewares
app.use(express.json());
app.use(
  multer({
    storage: fileStorage,
    limits: { fileSize: 1024 * 1024 * 2 },
    fileFilter: fileFilter
  }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

//Middlewares to funnel requests
app.use("/users", userRoutes);
app.use("/auth", authRoutes);

//Error Controller
app.use(errorController);

//Connecting to DB and Starting the Server
mongoose.connect(process.env.MONGO_STRING, (err) => {
  if (err) {
    console.log("MongoDB Error", err);
    return;
  }
  console.log("Connected to mongodb (Hopefully), starting server..");
  app.listen(PORT, () => {
    console.log("listening on port: " + PORT);
  });
});
