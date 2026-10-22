// utils/locationUtils.ts

/**
 * Detects if the user is on a mobile/small device
 * @returns true if device is mobile/small, false otherwise
 */
const isMobileDevice = (): boolean => {
  // Check screen width
  const isMobileWidth = window.innerWidth < 768;
  
  // Check user agent
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  // Check for touch support
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Return true if any mobile indicator is present
  return isMobileWidth || isMobileUA || isTouchDevice;
};

/**
 * Fetches location data from ip-api.com (for mobile devices)
 */
const fetchFromIpApi = async () => {
  const response = await fetch("http://ip-api.com/json");
  if (!response.ok) throw new Error("Failed to fetch location from ip-api");
  
  const data = await response.json();
  
  if (data.status === "fail") {
    throw new Error(data.message || "IP-API request failed");
  }
  
  return {
    country: data.country || "Unknown",
    language: {
      code: data.countryCode?.toLowerCase() || "en",
      name: new Intl.DisplayNames(["en"], { type: "region" }).of(data.countryCode || "US") || "Unknown",
    },
    city: data.city || "Unknown",
    region: data.regionName || "Unknown",
    timezone: data.timezone || "Unknown",
  };
};

/**
 * Fetches location data from ipapi.co (for desktop devices)
 */
const fetchFromIpApiCo = async () => {
  const response = await fetch("https://ipapi.co/json/");
  if (!response.ok) throw new Error("Failed to fetch location from ipapi.co");

  const data = await response.json();
  
  return {
    country: data.country_name || "Unknown",
    language: {
      code: (data.languages?.split(",")[0] || "en").split("-")[0],
      name: new Intl.DisplayNames(["en"], { type: "language" }).of(
        (data.languages?.split(",")[0] || "en").split("-")[0]
      ) || "English",
    },
    city: data.city || "Unknown",
    region: data.region || "Unknown",
    timezone: data.timezone || "Unknown",
  };
};

/**
 * Main function to detect user location based on device type
 */
export const detectUserLocation = async () => {
  try {
    // Check cache first
    const cached = localStorage.getItem("userLocationData");
    const cacheTime = localStorage.getItem("userLocationCacheTime");
    
    // Check if cache is still valid (24 hours)
    if (cached && cacheTime) {
      const cacheAge = Date.now() - parseInt(cacheTime);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (cacheAge < twentyFourHours) {
        console.log("Using cached location data");
        return JSON.parse(cached);
      } else {
        console.log("Cache expired, fetching fresh data");
        clearLocationCache();
      }
    }

    // Detect device type
    const isMobile = isMobileDevice();
    console.log(`Device type: ${isMobile ? "Mobile" : "Desktop"}`);
    
    let result;
    
    try {
      // Use appropriate API based on device type
      if (isMobile) {
        console.log("Fetching from ip-api.com (mobile)");
        result = await fetchFromIpApi();
      } else {
        console.log("Fetching from ipapi.co (desktop)");
        result = await fetchFromIpApiCo();
      }
    } catch (primaryError) {
      console.warn(`Primary API failed: ${primaryError}`);
      
      // Fallback to alternative API
      try {
        if (isMobile) {
          console.log("Falling back to ipapi.co");
          result = await fetchFromIpApiCo();
        } else {
          console.log("Falling back to ip-api.com");
          result = await fetchFromIpApi();
        }
      } catch (fallbackError) {
        console.error("Both APIs failed:", fallbackError);
        throw new Error("Unable to detect location");
      }
    }

    // Cache the result
    localStorage.setItem("userLocationData", JSON.stringify(result));
    localStorage.setItem("userLocationCacheTime", Date.now().toString());

    return result;
  } catch (error) {
    console.error("Location detection failed:", error);

    // Return fallback data
    return {
      country: "Unknown",
      language: { code: "en", name: "English" },
      city: "Unknown",
      region: "Unknown",
      timezone: "Unknown",
    };
  }
};

/**
 * Clears the cached location data
 */
export const clearLocationCache = () => {
  localStorage.removeItem("userLocationData");
  localStorage.removeItem("userLocationCacheTime");
  console.log("Location cache cleared");
};

/**
 * Forces a refresh of location data
 */
export const refreshLocationData = async () => {
  clearLocationCache();
  return await detectUserLocation();
};

/**
 * Gets device type information
 */
export const getDeviceInfo = () => {
  const isMobile = isMobileDevice();
  return {
    isMobile,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    userAgent: navigator.userAgent,
  };
};