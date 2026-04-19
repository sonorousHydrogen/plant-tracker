const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// CONNECT TO MONGODB
mongoose.connect("mongodb://127.0.0.1:27017/plantDB")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// SCHEMA
const plantSchema = new mongoose.Schema({
  name: String,
  growth: Number
});

const Plant = mongoose.model("Plant", plantSchema);

// ROUTES
app.get("/plants", async (req, res) => {
  const plants = await Plant.find();
  res.json(plants);
});

app.post("/plants", async (req, res) => {
  const newPlant = new Plant(req.body);
  await newPlant.save();
  res.json({ message: "Plant saved" });
});

// SERVER
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.delete("/plants/:id", async (req, res) => {
  try {
    await Plant.findByIdAndDelete(req.params.id);
    res.json({ message: "Plant deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
