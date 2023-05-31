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
import Legends from "../component/Legend";

const legends = {
  colors: ["purple", "red", "blue", "green"],
  min: 0,
  max: 20000,
};

const IndexPage: React.FC<PageProps> = () => {
  const [map, setmap] = useState<mapboxgl.Map>();
  const zipList = pivot_bedroom.map((item) => String(item.zipcode));
  const filteredZipGeoJson = (us_zip as any).features.filter((item: any) => {
    if (zipList.includes(item.properties.ZCTA5CE10)) {
    }
    return zipList.includes(item.properties.ZCTA5CE10);
  });
  // join filteredZipGeoJson with pivot_bedroom
  filteredZipGeoJson.forEach((item: any) => {
    const zip = item.properties.ZCTA5CE10;
    const pivotItem = pivot_bedroom.find((i) => String(i.zipcode) === zip);
    item.properties = {
      ...item.properties,
      ...pivotItem,
    };
  });
  filteredZipGeoJson.forEach((item: any) => {
    Object.keys(item.properties).forEach((key) => {
      if (isNaN(item.properties[key])) {
        // format $###,###,### to number
        try {
          item.properties["number_" + key] = Number(
            item.properties[key]?.replace(/[^0-9.-]+/g, "")
          );
        } catch (error) {
          
        }
        // add paint color property based on number
        item.properties["color_" + key] = legends.colors.find(
          (color, index) => {
            const start = legends.min + (legends.max - legends.min) * index;
            const end = start + (legends.max - legends.min);
            return (
              item.properties["number_" + key] >= start &&
              item.properties["number_" + key] < end
            );
          }
        );
      }
    });
  });
  console.log(filteredZipGeoJson);

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
        // get color from feature's properties
        // if color is null then use default color
        "fill-color": ["coalesce", ["get", "color_avg"], "white"],
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
      <Legends
        colors={legends.colors}
        min={legends.min}
        max={legends.max}
      ></Legends>
    </Box>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Home Page</title>;
