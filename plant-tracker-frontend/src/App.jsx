import { useState } from "react";
import axios from "axios";

function App() {
  const [plants, setPlants] = useState([]);
  const [name, setName] = useState("");

  const addPlant = () => {
    if (!name.trim()) return;

    const newPlant = {
      id: Date.now(),
      name: name,
    };

    setPlants([...plants, newPlant]);
    setName("");
  };

  const deletePlant = (id) => {
    setPlants(plants.filter((plant) => plant.id !== id));
  };

  return (
    <div>
      <h1>🌱 Plant Tracker</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter plant name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "16px",
            marginRight: "10px",
          }}
        />
        <button onClick={addPlant}>Add Plant</button>
      </div>

      {plants.length === 0 ? (
        <p>No plants added yet 🌿</p>
      ) : (
        <div>
          {plants.map((plant) => (
            <div
              key={plant.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
                border: "1px solid #ccc",
                marginBottom: "10px",
                borderRadius: "8px",
              }}
            >
              <span>{plant.name}</span>
              <button onClick={() => deletePlant(plant.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;