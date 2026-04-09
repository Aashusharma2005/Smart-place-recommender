export async function getAIResults(query) {
  query = query.toLowerCase();

  if (query.includes("romantic")) {
    return "💕 Romantic Places: Udaipur, Manali, Goa, Shimla";
  } else if (query.includes("nature")) {
    return "🌿 Nature Places: Rishikesh, Coorg, Munnar, Kasol";
  } else if (query.includes("beach")) {
    return "🏖️ Beaches: Goa, Gokarna, Andaman";
  } else if (query.includes("history")) {
    return "🏰 Historical: Delhi, Jaipur, Hampi, Agra";
  } else if (query.includes("budget")) {
    return "💸 Budget Trips: Rishikesh, Pushkar, Varanasi";
  } else {
    return "✨ Popular Places: Delhi, Goa, Jaipur, Manali";
  }
}