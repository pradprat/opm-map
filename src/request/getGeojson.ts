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

export const getPostalCodesData = async (query: string | string[]) => {
  const url = "https://nominatim.openstreetmap.org/search";
  const q = Array.isArray(query) ? query.join(",") : query;
  return axios({
    method: "get",
    url,
    responseType: "json",
    params: {
      q,
      format: "json",
      countrycodes: "us",
      polygon_geojson: "1",
      addressdetails: "1",
    },
  });
};

export const getArea = async (long: number, lat: number) => {
  const url =
    "https://api.maptiler.com/geocoding/-104.997956%2C39.815190.json?proximity=-104.854792%2C39.764418&autocomplete=false&fuzzyMatch=true&key=eIgS48TpQ70m77qKYrsx";
  return axios({
    method: "get",
    url,
    responseType: "json",
    params: {
      lat,
      lon: long,
      format: "json",
      countrycodes: "us",
      polygon_geojson: "1",
      addressdetails: "1",
    },
  });
};
