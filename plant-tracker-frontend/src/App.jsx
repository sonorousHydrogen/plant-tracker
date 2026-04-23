import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);

  const [plantForm, setPlantForm] = useState({
    name: "",
    type: "indoor",
    datePlanted: "",
    photo: "",
    wateringSchedule: "",
    fertilizingSchedule: "",
    notes: "",
  });

  const [growthForms, setGrowthForms] = useState({});
  const [healthForms, setHealthForms] = useState({});
  const [wateringForms, setWateringForms] = useState({});
  const [editingPlantId, setEditingPlantId] = useState(null);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/plants`);
      setPlants(res.data);
    } catch (err) {
      console.error("Error fetching plants:", err);
      alert("Failed to load plants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  const handlePlantChange = (e) => {
    const { name, value } = e.target;
    setPlantForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetPlantForm = () => {
    setPlantForm({
      name: "",
      type: "indoor",
      datePlanted: "",
      photo: "",
      wateringSchedule: "",
      fertilizingSchedule: "",
      notes: "",
    });
    setEditingPlantId(null);
  };

  const handlePlantSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingPlantId) {
        await axios.put(`${API}/plants/${editingPlantId}`, plantForm);
      } else {
        await axios.post(`${API}/plants`, plantForm);
      }

      resetPlantForm();
      fetchPlants();
    } catch (err) {
      console.error("Error saving plant:", err);
      alert("Failed to save plant");
    }
  };

  const handleEditPlant = (plant) => {
    setEditingPlantId(plant._id);
    setPlantForm({
      name: plant.name || "",
      type: plant.type || "other",
      datePlanted: plant.datePlanted
        ? new Date(plant.datePlanted).toISOString().split("T")[0]
        : "",
      photo: plant.photo || "",
      wateringSchedule: plant.wateringSchedule || "",
      fertilizingSchedule: plant.fertilizingSchedule || "",
      notes: plant.notes || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeletePlant = async (id) => {
    const confirmDelete = window.confirm("Delete this plant?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API}/plants/${id}`);
      fetchPlants();
    } catch (err) {
      console.error("Error deleting plant:", err);
      alert("Failed to delete plant");
    }
  };

  const handleGrowthInput = (plantId, field, value) => {
    setGrowthForms((prev) => ({
      ...prev,
      [plantId]: {
        ...prev[plantId],
        [field]: value,
      },
    }));
  };

  const addGrowthEntry = async (plantId) => {
    const form = growthForms[plantId] || {};

    if (!form.height) {
      alert("Please enter height");
      return;
    }

    try {
      await axios.post(`${API}/plants/${plantId}/growth`, {
        height: Number(form.height),
        note: form.note || "",
        photo: form.photo || "",
      });

      setGrowthForms((prev) => ({
        ...prev,
        [plantId]: { height: "", note: "", photo: "" },
      }));

      fetchPlants();
    } catch (err) {
      console.error("Error adding growth entry:", err);
      alert("Failed to add growth entry");
    }
  };

  const handleHealthInput = (plantId, value) => {
    setHealthForms((prev) => ({
      ...prev,
      [plantId]: value,
    }));
  };

  const addHealthLog = async (plantId) => {
    const note = healthForms[plantId];

    if (!note || !note.trim()) {
      alert("Please enter a health note");
      return;
    }

    try {
      await axios.post(`${API}/plants/${plantId}/health-log`, {
        note,
      });

      setHealthForms((prev) => ({
        ...prev,
        [plantId]: "",
      }));

      fetchPlants();
    } catch (err) {
      console.error("Error adding health log:", err);
      alert("Failed to add health log");
    }
  };

  const handleWaterInput = (plantId, value) => {
    setWateringForms((prev) => ({
      ...prev,
      [plantId]: value,
    }));
  };

  const markAsWatered = async (plantId) => {
    const days = wateringForms[plantId];

    try {
      await axios.put(`${API}/plants/${plantId}/water`, {
        nextWateringInDays: days ? Number(days) : undefined,
      });

      setWateringForms((prev) => ({
        ...prev,
        [plantId]: "",
      }));

      fetchPlants();
    } catch (err) {
      console.error("Error marking as watered:", err);
      alert("Failed to update watering");
    }
  };

  return (
    <div className="app-shell">
      <div className="overlay"></div>

      <main className="container">
        <section className="hero-panel">
          <div className="hero-copy">
            <span className="badge">Plant Tracker</span>
            <h1>Grow, care, and track every plant in one place</h1>
            <p>
              Add plants, record growth, manage watering, log health notes, and
              keep your little garden organized.
            </p>
          </div>
        </section>

        <section className="form-panel">
          <div className="section-head">
            <h2>{editingPlantId ? "Edit Plant" : "Add New Plant"}</h2>
            {editingPlantId && (
              <button className="ghost-btn" onClick={resetPlantForm}>
                Cancel Edit
              </button>
            )}
          </div>

          <form className="plant-form" onSubmit={handlePlantSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Plant name"
              value={plantForm.name}
              onChange={handlePlantChange}
              required
            />

            <select
              name="type"
              value={plantForm.type}
              onChange={handlePlantChange}
            >
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
              <option value="other">Other</option>
            </select>

            <input
              type="date"
              name="datePlanted"
              value={plantForm.datePlanted}
              onChange={handlePlantChange}
            />

            <input
              type="text"
              name="photo"
              placeholder="Photo URL"
              value={plantForm.photo}
              onChange={handlePlantChange}
            />

            <input
              type="text"
              name="wateringSchedule"
              placeholder="Watering schedule (e.g. every 3 days)"
              value={plantForm.wateringSchedule}
              onChange={handlePlantChange}
            />

            <input
              type="text"
              name="fertilizingSchedule"
              placeholder="Fertilizing schedule"
              value={plantForm.fertilizingSchedule}
              onChange={handlePlantChange}
            />

            <textarea
              name="notes"
              placeholder="General notes"
              value={plantForm.notes}
              onChange={handlePlantChange}
              rows="4"
            />

            <button type="submit" className="primary-btn">
              {editingPlantId ? "Update Plant" : "Add Plant"}
            </button>
          </form>
        </section>

        <section className="plants-section">
          <div className="section-head">
            <h2>Your Plants</h2>
            <span className="counter">
              {loading ? "Loading..." : `${plants.length} plants`}
            </span>
          </div>

          {plants.length === 0 && !loading ? (
            <div className="empty-state">
              <h3>No plants yet</h3>
              <p>Add your first plant above to get started.</p>
            </div>
          ) : (
            <div className="plant-grid">
              {plants.map((plant) => (
                <article className="plant-card" key={plant._id}>
                  <div className="plant-top">
                    <div>
                      <h3>{plant.name}</h3>
                      <p className="plant-type">{plant.type}</p>
                    </div>
                    <div className="card-actions">
                      <button
                        className="small-btn"
                        onClick={() => handleEditPlant(plant)}
                      >
                        Edit
                      </button>
                      <button
                        className="small-btn danger-btn"
                        onClick={() => handleDeletePlant(plant._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {plant.photo ? (
                    <img
                      src={plant.photo}
                      alt={plant.name}
                      className="plant-image"
                    />
                  ) : (
                    <div className="plant-image placeholder">No photo</div>
                  )}

                  <div className="info-grid">
                    <div>
                      <span>Date planted</span>
                      <strong>
                        {plant.datePlanted
                          ? new Date(plant.datePlanted).toLocaleDateString()
                          : "Not set"}
                      </strong>
                    </div>
                    <div>
                      <span>Watering</span>
                      <strong>{plant.wateringSchedule || "Not set"}</strong>
                    </div>
                    <div>
                      <span>Fertilizing</span>
                      <strong>{plant.fertilizingSchedule || "Not set"}</strong>
                    </div>
                    <div>
                      <span>Next watering</span>
                      <strong>
                        {plant.nextWateringDate
                          ? new Date(plant.nextWateringDate).toLocaleDateString()
                          : "Not set"}
                      </strong>
                    </div>
                  </div>

                  <div className="notes-box">
                    <h4>General Notes</h4>
                    <p>{plant.notes || "No notes yet"}</p>
                  </div>

                  <div className="feature-block">
                    <h4>Mark as Watered</h4>
                    <div className="inline-form">
                      <input
                        type="number"
                        min="1"
                        placeholder="Next watering in days"
                        value={wateringForms[plant._id] || ""}
                        onChange={(e) =>
                          handleWaterInput(plant._id, e.target.value)
                        }
                      />
                      <button
                        className="primary-btn"
                        onClick={() => markAsWatered(plant._id)}
                      >
                        Watered
                      </button>
                    </div>
                    <p className="meta-text">
                      Last watered:{" "}
                      {plant.lastWatered
                        ? new Date(plant.lastWatered).toLocaleDateString()
                        : "Never"}
                    </p>
                  </div>

                  <div className="feature-block">
                    <h4>Add Growth Update</h4>
                    <div className="stack-form">
                      <input
                        type="number"
                        placeholder="Height"
                        value={growthForms[plant._id]?.height || ""}
                        onChange={(e) =>
                          handleGrowthInput(plant._id, "height", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        placeholder="Growth photo URL"
                        value={growthForms[plant._id]?.photo || ""}
                        onChange={(e) =>
                          handleGrowthInput(plant._id, "photo", e.target.value)
                        }
                      />
                      <textarea
                        rows="3"
                        placeholder="Growth note"
                        value={growthForms[plant._id]?.note || ""}
                        onChange={(e) =>
                          handleGrowthInput(plant._id, "note", e.target.value)
                        }
                      />
                      <button
                        className="primary-btn"
                        onClick={() => addGrowthEntry(plant._id)}
                      >
                        Add Growth
                      </button>
                    </div>

                    <div className="history-list">
                      {plant.growthHistory?.length ? (
                        plant.growthHistory
                          .slice()
                          .reverse()
                          .map((entry) => (
                            <div className="history-item" key={entry._id}>
                              <strong>{entry.height} cm</strong>
                              <span>
                                {new Date(entry.date).toLocaleDateString()}
                              </span>
                              <p>{entry.note || "No note"}</p>
                            </div>
                          ))
                      ) : (
                        <p className="muted">No growth history yet</p>
                      )}
                    </div>
                  </div>

                  <div className="feature-block">
                    <h4>Add Health Log</h4>
                    <div className="stack-form">
                      <textarea
                        rows="3"
                        placeholder='Example: "Leaves turning yellow"'
                        value={healthForms[plant._id] || ""}
                        onChange={(e) =>
                          handleHealthInput(plant._id, e.target.value)
                        }
                      />
                      <button
                        className="primary-btn"
                        onClick={() => addHealthLog(plant._id)}
                      >
                        Add Log
                      </button>
                    </div>

                    <div className="history-list">
                      {plant.healthLogs?.length ? (
                        plant.healthLogs
                          .slice()
                          .reverse()
                          .map((log) => (
                            <div className="history-item" key={log._id}>
                              <span>
                                {new Date(log.date).toLocaleDateString()}
                              </span>
                              <p>{log.note}</p>
                            </div>
                          ))
                      ) : (
                        <p className="muted">No health logs yet</p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;