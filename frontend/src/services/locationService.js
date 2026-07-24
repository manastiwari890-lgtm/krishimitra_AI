// =====================================================
// KRISHIMITRA AI - LOCATION SERVICE
// GPS coordinates → Human-readable location
// =====================================================

const REVERSE_URL =
  "https://nominatim.openstreetmap.org/reverse";

const LOCATION_CACHE_KEY =
  "krishimitra_location_cache";

// =====================================================
// REVERSE GEOCODING
// =====================================================

export async function getLocationName(
  latitude,
  longitude,
  language = "hi"
) {
  if (
    latitude === undefined ||
    longitude === undefined
  ) {
    throw new Error("Coordinates are required.");
  }

  const languageCode =
    language === "hi" ? "hi" : "en";

  const url =
    `${REVERSE_URL}` +
    `?format=jsonv2` +
    `&lat=${encodeURIComponent(latitude)}` +
    `&lon=${encodeURIComponent(longitude)}` +
    `&zoom=10` +
    `&addressdetails=1` +
    `&accept-language=${languageCode}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      "Location name could not be loaded."
    );
  }

  const data = await response.json();

  const address = data.address || {};

  // Different areas can use different OSM address keys.
  const village =
    address.village ||
    address.hamlet ||
    address.suburb ||
    "";

  const city =
    address.city ||
    address.town ||
    address.municipality ||
    "";

  const district =
    address.state_district ||
    address.county ||
    address.district ||
    "";

  const state =
    address.state || "";

  const country =
    address.country || "";

  const postcode =
    address.postcode || "";

  // Farmer-friendly primary place
  const primaryPlace =
    village ||
    city ||
    district ||
    state ||
    country ||
    "Unknown Location";

  const secondaryParts = [
    district,
    state,
  ].filter(
    (value, index, array) =>
      value &&
      value !== primaryPlace &&
      array.indexOf(value) === index
  );

  const location = {
    village,
    city,
    district,
    state,
    country,
    postcode,

    primaryPlace,

    secondaryPlace:
      secondaryParts.join(", "),

    displayName:
      data.display_name || "",

    latitude: Number(latitude),
    longitude: Number(longitude),

    fetchedAt:
      new Date().toISOString(),
  };

  saveLocationCache(location);

  return location;
}

// =====================================================
// CACHE LOCATION
// =====================================================

export function saveLocationCache(location) {
  try {
    localStorage.setItem(
      LOCATION_CACHE_KEY,
      JSON.stringify({
        data: location,
        savedAt: Date.now(),
      })
    );
  } catch (error) {
    console.error(
      "Location cache save error:",
      error
    );
  }
}

// =====================================================
// READ LOCATION CACHE
// =====================================================

export function getLocationCache() {
  try {
    const saved =
      localStorage.getItem(
        LOCATION_CACHE_KEY
      );

    if (!saved) return null;

    return JSON.parse(saved);
  } catch (error) {
    console.error(
      "Location cache read error:",
      error
    );

    return null;
  }
}