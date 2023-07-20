import * as turf from "@turf/turf";
import * as uuid from 'uuid';
export const getGeojson = (features: any[]) => {
  return {
    type: "FeatureCollection",
    features: features,
  };
};

export const geoJsonAddProperties = (
  geojson: any,
  data: any[],
  featureId: string = ""
) => {
  const features = geojson.features.map((feature: any) => {
    const properties = data.find(
      (item: any) => String(item[featureId]) === String(feature.id)
    );
    return {
      ...feature,
      properties: {
        ...feature.properties,
        ...properties,
      },
    };
  });
  return {
    ...geojson,
    features,
  };
};
export const geoJsonAddFeatureId = (geojson: any, featureId: string) => {
  const features = geojson.features.map((feature: any) => {
    return {
      ...feature,
      id: Number(feature.properties[featureId]),
    };
  });
  return {
    ...geojson,
    features,
  };
};
export const geoJsonAddRandomFeatureId = (geojson: any) => {
  const features = geojson.features.map((feature: any) => {
    return {
      ...feature,
      id: new Date().getTime(),
    };
  });
  return {
    ...geojson,
    features,
  };
};
export const filterGeojson = (
  geojson: any,
  data: any[],
  geoJsonKey: string,
  dataKey: string
) => {
  const features = geojson.features.filter((feature: any) => {
    const properties = data.find(
      (item: any) =>
        String(item[dataKey]) === String(feature.properties[geoJsonKey])
    );
    return properties;
  });
  return {
    ...geojson,
    features,
  };
};
export const getPointGeojson = (geojson: any) => {
  const features = geojson.features.map((feature: any) => {
    const feat = turf.feature(feature);
    return {
      ...feature,
      geometry: turf.centerOfMass(feat.geometry).geometry,
    };
  });
  return {
    ...geojson,
    features,
  };
};
