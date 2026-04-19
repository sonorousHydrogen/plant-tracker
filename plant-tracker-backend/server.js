const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// CONNECT TO MONGODB
mongoose.connect(process.env.MONGO_URI)
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

app.delete("/plants/:id", async (req, res) => {
  try {
    await Plant.findByIdAndDelete(req.params.id);
    res.json({ message: "Plant deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROOT ROUTE
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
