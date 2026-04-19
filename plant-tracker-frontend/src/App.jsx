import { useState } from "react";
import "./index.css";

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

      <div className="input-box">
        <input
          type="text"
          placeholder="Enter plant name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button onClick={addPlant}>Add Plant</button>
      </div>

      {plants.length === 0 ? (
        <p>No plants added yet 🌿</p>
      ) : (
        plants.map((plant) => (
          <div key={plant.id} className="plant-card">
            <span>{plant.name}</span>
            <button onClick={() => deletePlant(plant.id)}>
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default App;