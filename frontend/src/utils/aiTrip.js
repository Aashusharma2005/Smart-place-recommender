export async function generateTrip(prompt) {
  try {
    const res = await fetch("http://127.0.0.1:5000/generate-trip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();

    console.log("AI DATA:", data);

    return data.trip || "No response";

  } catch (error) {
    console.error("Frontend Error:", error);
    return "Error generating trip";
  }
}