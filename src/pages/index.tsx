import { useEffect, useRef, useState } from "react";
import { HeadFC, PageProps, Script } from "gatsby";
import mapboxgl from "mapbox-gl";
import React from "react";
import { Box, Heading, VStack } from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { loadBingApi } from "../libs/bingMap";
import { getGeojson } from "../request/getGeojson";
import pivot_bedroom from "../content/pivot_bedroom.json";
import us_zip from "../content/us_zip.json";
import Map from "../component/Map";

const w = window as any;
const IndexPage: React.FC<PageProps> = () => {
  const [map, setmap] = useState<mapboxgl.Map>();
  const zipList = pivot_bedroom.map((item) => String(item.zipcode));
  const filteredZipGeoJson = (us_zip as any).features.filter((item: any) => {
    if (zipList.includes(item.properties.ZCTA5CE10)) {
      console.log(item.properties.ZCTA5CE10);
    }
    return zipList.includes(item.properties.ZCTA5CE10);
  });
  map?.on("load", () => {
    map?.addSource("zip", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: filteredZipGeoJson,
      },
    });
    map?.addLayer({
      id: "zip",
      type: "fill",
      source: "zip",
      layout: {},
      paint: {
        "fill-color": "#088",
        "fill-opacity": 0.8,
      },
    });
  });

  return (
    <Box>
      {/* filters */}
      <VStack
        position={"absolute"}
        bg={"white"}
        p={6}
        zIndex={1}
        m={8}
        borderRadius={"lg"}
        shadow={"lg"}
        alignItems={"flex-start"}
        gap={4}
      >
        <Heading size={"md"}>Filter</Heading>
        <Select
          useBasicStyles
          options={[
            {
              label: "I am red",
              value: "i-am-red",
              colorScheme: "red", // The option color scheme overrides the global
            },
            {
              label: "I fallback to purple",
              value: "i-am-purple",
            },
          ]}
        ></Select>
      </VStack>
      <Map onInit={(map) => setmap(map)}></Map>
    </Box>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Home Page</title>;
