import React, { useState } from "react";
import { generateTrip } from "../utils/aiTrip";

function AITripPlanner() {
  const [prompt, setPrompt] = useState("");
  const [trip, setTrip] = useState("");

  const handleGenerate = async () => {
    const result = await generateTrip(prompt);

    console.log("TRIP RESULT:", result);

    setTrip(result);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>AI Trip Planner</h2>

      <input
        type="text"
        placeholder="Enter place (e.g. Goa trip for 2 days)"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ width: "300px", padding: "10px" }}
      />

      <br /><br />

      <button onClick={handleGenerate}>
        Generate Trip
      </button>

      <br /><br />

      <div>
        <h3>Result:</h3>

        {/* ✅ FIX: no split error */}
        {trip ? (
          <pre style={{ whiteSpace: "pre-wrap" }}>{trip}</pre>
        ) : (
          <p>No trip generated yet</p>
        )}
      </div>
    </div>
  );
}

export default AITripPlanner;