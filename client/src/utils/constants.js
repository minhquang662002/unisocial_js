export const apiUrl =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:5000"
    : "https://unisocial-production.up.railway.app";
