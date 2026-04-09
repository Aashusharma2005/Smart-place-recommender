const API_KEY = "AIzaSyCgLwys3mnS7cerAUNmkF97k-2P9D5z-yg";

export async function getPlaceImage(placeName) {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${placeName}&key=${API_KEY}`
    );

    const data = await res.json();

    const photoRef =
      data.results?.[0]?.photos?.[0]?.photo_reference;

    if (!photoRef) return null;

    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${API_KEY}`;
  } catch (err) {
    console.log(err);
    return null;
  }
}