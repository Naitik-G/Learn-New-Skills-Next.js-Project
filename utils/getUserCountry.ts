// /utils/getUserCountry.ts
export async function getUserCountry(): Promise<string | null> {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return data.country_code || null; // e.g., "IN", "DE", "SA"
  } catch (error) {
    console.error("Failed to fetch user country", error);
    return null;
  }
}
