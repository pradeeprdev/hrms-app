const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_ENDPOINTS = {
  ATTENDANCE: `${BASE_URL}/attendance`,
  LEAVES: `${BASE_URL}/leaves`,
  EMPLOYEES: `${BASE_URL}/employees`,
  CANDIDATES: `${BASE_URL}/candidates`,
  AUTH: `${BASE_URL}/auth`,
  UPLOADS: `${BASE_URL}/uploads`,
};