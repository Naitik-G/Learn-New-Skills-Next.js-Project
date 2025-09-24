// utils/locationUtils.ts
export const detectUserLocation = async () => {
  try {
    // check cache
    const cached = localStorage.getItem("userLocationData");
    if (cached) {
      return JSON.parse(cached);
    }

    // fetch fresh
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) throw new Error("Failed to fetch location");

    const data = await response.json();
    const result = {
      country: data.country_name || "Unknown",
      language: {
        code: (data.languages?.split(",")[0] || "en").split("-")[0], // e.g. en-IN → en
        name:
          new Intl.DisplayNames(["en"], { type: "language" }).of(
            (data.languages?.split(",")[0] || "en").split("-")[0]
          ) || "English",
      },
    };

    // cache for 24 hours
    localStorage.setItem("userLocationData", JSON.stringify(result));
    localStorage.setItem("userLocationCacheTime", Date.now().toString());

    return result;
  } catch (error) {
    console.error("Location detection failed:", error);

    // fallback
    return {
      country: "Unknown",
      language: { code: "en", name: "English" },
    };
  }
};

export const clearLocationCache = () => {
  localStorage.removeItem("userLocationData");
  localStorage.removeItem("userLocationCacheTime");
};
