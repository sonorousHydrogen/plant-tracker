require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/*
  FRONTEND URLS:
  Put your deployed frontend URL(s) in env, for example:
  FRONTEND_URL=https://your-app.vercel.app
  FRONTEND_URL_2=https://plant-tracker.vercel.app

  For local dev:
  FRONTEND_URL=http://localhost:5173
  FRONTEND_URL_2=http://localhost:3000
*/

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, curl, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

// CONNECT TO MONGODB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

/* ---------------------------
   SCHEMAS
--------------------------- */

const growthEntrySchema = new mongoose.Schema(
  {
    height: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    photo: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const healthLogSchema = new mongoose.Schema(
  {
    note: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const plantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["indoor", "outdoor", "other"],
      default: "other",
    },
    datePlanted: {
      type: Date,
      default: null,
    },
    photo: {
      type: String,
      trim: true,
      default: "",
    },

    wateringSchedule: {
      type: String,
      trim: true,
      default: "",
    },
    fertilizingSchedule: {
      type: String,
      trim: true,
      default: "",
    },
    lastWatered: {
      type: Date,
      default: null,
    },
    nextWateringDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    growthHistory: {
      type: [growthEntrySchema],
      default: [],
    },

    healthLogs: {
      type: [healthLogSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Plant = mongoose.model("Plant", plantSchema);

/* ---------------------------
   HELPERS
--------------------------- */

function addDays(dateValue, days) {
  const date = dateValue ? new Date(dateValue) : new Date();
  date.setDate(date.getDate() + Number(days));
  return date;
}

/* ---------------------------
   ROUTES
--------------------------- */

// ROOT ROUTE
app.get("/", (req, res) => {
  res.send("Plant Tracker backend is running 🚀");
});

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    message: "Server is healthy",
    time: new Date().toISOString(),
  });
});

// GET ALL PLANTS
app.get("/plants", async (req, res) => {
  try {
    const plants = await Plant.find().sort({ createdAt: -1 });
    res.json(plants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SINGLE PLANT
app.get("/plants/:id", async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);

    if (!plant) {
      return res.status(404).json({ error: "Plant not found" });
    }

    res.json(plant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE PLANT
app.post("/plants", async (req, res) => {
  try {
    const {
      name,
      type,
      datePlanted,
      photo,
      wateringSchedule,
      fertilizingSchedule,
      lastWatered,
      nextWateringDate,
      notes,
    } = req.body;

    const newPlant = new Plant({
      name,
      type,
      datePlanted,
      photo,
      wateringSchedule,
      fertilizingSchedule,
      lastWatered,
      nextWateringDate,
      notes,
    });

    await newPlant.save();

    res.status(201).json({
      message: "Plant created successfully",
      plant: newPlant,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE PLANT MAIN INFO
app.put("/plants/:id", async (req, res) => {
  try {
    const updatedPlant = await Plant.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: req.body.name,
          type: req.body.type,
          datePlanted: req.body.datePlanted,
          photo: req.body.photo,
          wateringSchedule: req.body.wateringSchedule,
          fertilizingSchedule: req.body.fertilizingSchedule,
          lastWatered: req.body.lastWatered,
          nextWateringDate: req.body.nextWateringDate,
          notes: req.body.notes,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedPlant) {
      return res.status(404).json({ error: "Plant not found" });
    }

    res.json({
      message: "Plant updated successfully",
      plant: updatedPlant,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE PLANT
app.delete("/plants/:id", async (req, res) => {
  try {
    const deletedPlant = await Plant.findByIdAndDelete(req.params.id);

    if (!deletedPlant) {
      return res.status(404).json({ error: "Plant not found" });
    }

    res.json({ message: "Plant deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD GROWTH ENTRY
app.post("/plants/:id/growth", async (req, res) => {
  try {
    const { height, note, photo, date } = req.body;

    const plant = await Plant.findById(req.params.id);
    if (!plant) {
      return res.status(404).json({ error: "Plant not found" });
    }

    plant.growthHistory.push({
      height,
      note,
      photo,
      date: date || new Date(),
    });

    await plant.save();

    res.status(201).json({
      message: "Growth entry added successfully",
      plant,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ADD HEALTH LOG
app.post("/plants/:id/health-log", async (req, res) => {
  try {
    const { note, date } = req.body;

    const plant = await Plant.findById(req.params.id);
    if (!plant) {
      return res.status(404).json({ error: "Plant not found" });
    }

    plant.healthLogs.push({
      note,
      date: date || new Date(),
    });

    await plant.save();

    res.status(201).json({
      message: "Health log added successfully",
      plant,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// MARK AS WATERED
app.put("/plants/:id/water", async (req, res) => {
  try {
    const { nextWateringInDays } = req.body;

    const plant = await Plant.findById(req.params.id);
    if (!plant) {
      return res.status(404).json({ error: "Plant not found" });
    }

    const wateredAt = new Date();
    plant.lastWatered = wateredAt;

    if (nextWateringInDays !== undefined && nextWateringInDays !== null) {
      plant.nextWateringDate = addDays(wateredAt, nextWateringInDays);
    }

    await plant.save();

    res.json({
      message: "Plant marked as watered",
      plant,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// OPTIONAL: DELETE ONE GROWTH ENTRY
app.delete("/plants/:plantId/growth/:growthId", async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.plantId);
    if (!plant) {
      return res.status(404).json({ error: "Plant not found" });
    }

    plant.growthHistory = plant.growthHistory.filter(
      (entry) => entry._id.toString() !== req.params.growthId
    );

    await plant.save();

    res.json({
      message: "Growth entry deleted successfully",
      plant,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// OPTIONAL: DELETE ONE HEALTH LOG
app.delete("/plants/:plantId/health-log/:logId", async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.plantId);
    if (!plant) {
      return res.status(404).json({ error: "Plant not found" });
    }

    plant.healthLogs = plant.healthLogs.filter(
      (log) => log._id.toString() !== req.params.logId
    );

    await plant.save();

    res.json({
      message: "Health log deleted successfully",
      plant,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404 HANDLER
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({
    error: err.message || "Internal server error",
  });
});

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
