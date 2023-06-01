import { useEffect, useRef, useState, useMemo } from "react";
import { HeadFC, PageProps, Script } from "gatsby";
import mapboxgl from "mapbox-gl";
import React from "react";
import { Box, Button, ButtonProps, Heading, VStack } from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { loadBingApi } from "../libs/bingMap";
import { getGeojson } from "../request/getGeojson";
import pivot_bedroom from "../content/pivot_bedroom.json";
import us_zip from "../content/us_zip.json";
import Legends from "../component/Legend";
import Map, { Layer, Source } from "react-map-gl";
import Hover from "../component/Hover";

const legends = {
  colors: ["purple", "red", "blue", "green"],
  min: 0,
  max: 20000,
};
mapboxgl.accessToken =
  "pk.eyJ1IjoicHJhZHByYXQiLCJhIjoiY2tnMHhwbXZvMDc4eDJ1cXd1ZmFueHk5YiJ9.wfhci5Mpn6cahjx3GnOfYQ";

const IndexPage: React.FC<PageProps> = () => {
  const [filters, setfilters] = useState({
    bedroom: "1",
  });
  console.log(filters);

  const map = useRef<mapboxgl.Map>();
  const zipList = pivot_bedroom.map((item) => String(item.zipcode));
  const filteredZipGeoFeatures = (us_zip as any).features.filter(
    (item: any) => {
      if (zipList.includes(item.properties.ZCTA5CE10)) {
      }
      return zipList.includes(item.properties.ZCTA5CE10);
    }
  );

  useEffect(() => {
    console.log(filters.bedroom);
    // add id to features
    filteredZipGeoFeatures?.forEach((item: any, index: number) => {
      item.id = index;
    });
    filteredZipGeoFeatures?.forEach((item: any) => {
      const zip = item.properties.ZCTA5CE10;
      const pivotItem = pivot_bedroom.find((i) => String(i.zipcode) === zip);
      item.properties = {
        ...item.properties,
        ...pivotItem,
      };
    });
    filteredZipGeoFeatures?.forEach((item: any) => {
      if (isNaN(item.properties["avg__" + filters.bedroom])) {
        // format $###,###,### to number
        try {
          item.properties["value"] = Number(
            item.properties["avg__" + filters.bedroom]?.replace(
              /[^0-9.-]+/g,
              ""
            )
          );
        } catch (error) {
          console.log(error);
        }
        // add paint color property based on number
        item.properties["color"] = legends.colors.find((color, index) => {
          const start = legends.min + (legends.max - legends.min) * index;
          const end = start + (legends.max - legends.min);
          return (
            item.properties["value"] >= start && item.properties["value"] < end
          );
        });
      }
    });
    if (map.current) {
      (map.current.getSource("zip") as any).setData({
        type: "FeatureCollection",
        features: filteredZipGeoFeatures,
      });
    }
    return () => {};
  }, [filteredZipGeoFeatures, filters]);

  const zipLayer = useMemo(
    () => ({
      id: "zip",
      type: "fill",
      source: "zip",
      layout: {},
      paint: {
        "fill-color": ["coalesce", ["get", "color"], "white"],
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          1,
          0.5,
        ],
      },
    }),
    [filters, filteredZipGeoFeatures]
  );

  const selectedFilter = {
    bg: "teal.400",
    color: "white",
    _hover: {},
  } as ButtonProps;
  return (
    <Box>
      {/* filters */}
      <VStack
        position={"absolute"}
        bg={"white"}
        p={4}
        zIndex={1}
        m={4}
        borderRadius={"lg"}
        shadow={"lg"}
        alignItems={"flex-start"}
        gap={4}
      >
        <Heading size={"md"}>Filter</Heading>
        <VStack alignItems={"start"}>
          <Heading size={"sm"}>Bedrooms</Heading>
          <VStack alignItems={"start"}>
            <Button
              w={"full"}
              {...(filters.bedroom === "0" ? selectedFilter : {})}
              onClick={() => {
                setfilters({
                  ...filters,
                  bedroom: "0",
                });
              }}
            >
              All
            </Button>
            {["1", "2", "3", "4", "5"].map((item) => {
              return (
                <Button
                  w={"full"}
                  key={item}
                  onClick={() => {
                    setfilters({
                      ...filters,
                      bedroom: item,
                    });
                  }}
                  {...(filters.bedroom === item ? selectedFilter : {})}
                >
                  {item} bedrooms
                </Button>
              );
            })}
          </VStack>
        </VStack>
        {/* <Select
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
        ></Select> */}
      </VStack>
      <Map
        ref={(ref) => (map.current = ref?.getMap() as any)}
        initialViewState={{
          longitude: -112.06053,
          latitude: 33.53343,
          zoom: 10,
        }}
        style={{ width: "100%", height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/light-v10"
      >
        <Source
          id="zip"
          type="geojson"
          data={{
            type: "FeatureCollection",
            features: filteredZipGeoFeatures,
          }}
        >
          <Layer {...(zipLayer as any)}></Layer>
          <Hover sourceId="zip" layerId="zip"></Hover>
        </Source>
      </Map>
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
