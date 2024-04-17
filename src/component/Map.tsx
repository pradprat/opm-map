import { MutableRefObject, Ref, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import React from "react";
import { Box, Heading, VStack } from "@chakra-ui/react";
// passing ref to props
interface Props {
  map?: MutableRefObject<mapboxgl.Map | undefined>;
  onInit?: (map: mapboxgl.Map) => void;
}

const Map = ({ map, onInit }: Props) => {
  mapboxgl.accessToken =
    "pk.eyJ1IjoicHJhZHByYXQiLCJhIjoiY2tnMHhwbXZvMDc4eDJ1cXd1ZmFueHk5YiJ9.wfhci5Mpn6cahjx3GnOfYQ";
  useEffect(() => {
    const mapbox = new mapboxgl.Map({
      container: "mapbox", // container ID
      // mapbox light
      style: "mapbox://styles/mapbox/light-v10", // style URL
      center: [-112.035238, 33.651376], // starting position [lng, lat]
      zoom: 9, // starting zoom
    });
    onInit?.(mapbox);
    map && (map.current = mapbox);
    return () => {};
  }, []);
  return (
    <Box>
      <Box style={{ width: "100%", height: "100vh" }} id="mapbox"></Box>
    </Box>
  );
};

export default Map;
