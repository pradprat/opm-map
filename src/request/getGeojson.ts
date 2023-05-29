import axios from "axios";

export const getGeojson = async (query: string | string[]) => {
  const url = "https://nominatim.openstreetmap.org/search";
  const q = Array.isArray(query) ? query.join("|") : query;
  return axios({
    method: "get",
    url,
    responseType: "json",
    params: {
      q,
      format: "geojson",
      countrycodes: "us",
      polygon_geojson: "1",
    },
  });
};
