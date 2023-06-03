import { useEffect, useRef, useState, useMemo } from "react";
import { HeadFC, PageProps, Script } from "gatsby";
import mapboxgl from "mapbox-gl";
import React from "react";
import {
  Box,
  Button,
  ButtonProps,
  Heading,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  VStack,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { loadBingApi } from "../libs/bingMap";
import { getGeojson } from "../request/getGeojson";
import pivot_bedroom from "../content/pivot_bedroom.json";
import us_zip from "../content/us_zip.json";
import Legends from "../component/Legend";
import Map, { Layer, Source } from "react-map-gl";
import Hover from "../component/Hover";
import BedroomFilter from "../component/BedroomFilter";
import { MdAttachMoney } from "react-icons/md";
import {
  filterGeojson,
  geoJsonAddFeatureId,
  geoJsonAddProperties,
  getPointGeojson,
} from "../utils/map";
import { formatMoneyDataToNumber, getMinMaxValue } from "../utils/data";

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
  const [sliderData, setsliderData] = useState({
    min: 0,
    max: 0,
    value: 0,
  });
  const map = useRef<mapboxgl.Map>();
  const [zipGeojson, setzipGeojson] = useState();
  const [pointGeojson, setpointGeojson] = useState();
  useEffect(() => {
    const zipGeojson = geoJsonAddFeatureId(us_zip, "ZCTA5CE10");
    const room_data = pivot_bedroom.map((item) => {
      return formatMoneyDataToNumber(item);
    });
    const availableRoomData = room_data.filter(
      (item) => item["num_avg__" + filters.bedroom] !== 0
    );
    const filteredGeojson = filterGeojson(
      zipGeojson,
      availableRoomData,
      "ZCTA5CE10",
      "zipcode"
    );
    const addedDataGeojson = geoJsonAddProperties(
      filteredGeojson,
      availableRoomData,
      "zipcode"
    );
    const { min, max } = getMinMaxValue(
      availableRoomData,
      "num_avg__" + filters.bedroom
    );
    setsliderData({
      min,
      max,
      value: min,
    });
    setzipGeojson(addedDataGeojson);
    const pointGeojson = getPointGeojson(addedDataGeojson);
    setpointGeojson(pointGeojson);
    return () => {};
  }, [filters]);

  useEffect(() => {
    const filteredZipGeojson = (zipGeojson as any)?.features.filter(
      (item: any) =>
        item.properties["num_avg__" + filters.bedroom] > sliderData.value
    );
    const filteredPointGeojson = (pointGeojson as any)?.features.filter(
      (item: any) =>
        item.properties["num_avg__" + filters.bedroom] > sliderData.value
    );
    (map.current?.getSource("zip") as any)?.setData({
      type: "FeatureCollection",
      features: filteredZipGeojson,
    });
    (map.current?.getSource("zip-label") as any)?.setData({
      type: "FeatureCollection",
      features: filteredPointGeojson,
    });
    return () => {};
  }, [sliderData]);

  const zipLayer = useMemo(
    () => ({
      id: "zip",
      type: "fill",
      source: "zip",
      layout: {},
      paint: {
        "fill-color": [
          "interpolate",
          // Set the exponential rate of change to 0.5
          ["exponential", 1],
          ["get", "num_avg__" + filters.bedroom],
          // When zoom is 15, buildings will be beige.

          sliderData.min / 2,
          "white",

          sliderData.max,
          "green",
        ],
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          1,
          0.5,
        ],
      },
    }),
    [filters, sliderData]
  );
  const labelLayer = useMemo(
    () => ({
      id: "zip-labels",
      type: "symbol",
      source: "zip-label",
      layout: {
        "text-field": [
          "format",
          ["get", "zipcode"],
          { "font-scale": 1.2 },
          "\n",
          {},
          ["get", "avg__" + filters.bedroom],
          {
            "font-scale": 0.8,
          },
        ],
        "text-variable-anchor": ["top", "bottom", "left", "right"],
        "text-radial-offset": 0.5,
        "text-justify": "auto",
        "icon-image": ["get", "icon"],
      },
    }),
    [filters]
  );
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
        minWidth={"200px"}
      >
        <Heading size={"md"}>Filter</Heading>
        <BedroomFilter
          setfilters={setfilters}
          filters={filters}
        ></BedroomFilter>
        <Slider
          aria-label="slider-ex-4"
          value={sliderData.value}
          onChange={(value) =>
            setsliderData({ ...sliderData, value: value as number })
          }
          min={sliderData.min}
          max={sliderData.max}
        >
          <SliderMark
            value={sliderData.value}
            textAlign="center"
            color="black"
            mt="-8"
            fontSize={"xs"}
          >
            {sliderData.value}
          </SliderMark>
          <SliderTrack bg="red.100">
            <SliderFilledTrack bg="tomato" />
          </SliderTrack>
          <SliderThumb boxSize={6} border={"1px"} borderColor={"tomato"}>
            <Box color="tomato" as={MdAttachMoney} />
          </SliderThumb>
        </Slider>
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
        <Source id="zip" type="geojson" data={zipGeojson}>
          <Layer {...(zipLayer as any)}></Layer>
          <Hover sourceId="zip" layerId="zip"></Hover>
        </Source>
        <Source id="zip-label" type="geojson" data={pointGeojson}>
          <Layer {...(labelLayer as any)}></Layer>
        </Source>
      </Map>
    </Box>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Home Page</title>;
