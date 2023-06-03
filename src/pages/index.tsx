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
} from "../utils/map";
import { formatMoneyDataToNumber, getMaxValue } from "../utils/data";

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
  const map = useRef<mapboxgl.Map>();
  const [zipGeojson, setzipGeojson] = useState();
  // useEffect(() => {
  //   if (map.current) {
  //     (map.current.getSource("zip") as any)?.setData({
  //       type: "FeatureCollection",
  //       features: zipGeojson,
  //     });
  //   }
  //   return () => {};
  // }, [zipGeojson]);

  useEffect(() => {
    const zipGeojson = geoJsonAddFeatureId(us_zip, "ZCTA5CE10");
    const room_data = pivot_bedroom.map((item) => {
      return formatMoneyDataToNumber(item);
    });
    const filteredGeojson = filterGeojson(
      zipGeojson,
      room_data,
      "ZCTA5CE10",
      "zipcode"
    );
    const addedDataGeojson = geoJsonAddProperties(
      filteredGeojson,
      room_data,
      "zipcode"
    );

    // zipGeojson?.forEach((item: any) => {
    //   if (isNaN(item.properties["avg__" + filters.bedroom])) {
    //     // format $###,###,### to number
    //     try {
    //       item.properties["value"] = Number(
    //         item.properties["avg__" + filters.bedroom]?.replace(
    //           /[^0-9.-]+/g,
    //           ""
    //         )
    //       );
    //     } catch (error) {
    //       console.log(error);
    //     }
    //     // add paint color property based on number
    //     item.properties["color"] = legends.colors.find((color, index) => {
    //       const start = legends.min + (legends.max - legends.min) * index;
    //       const end = start + (legends.max - legends.min);
    //       return (
    //         item.properties["value"] >= start && item.properties["value"] < end
    //       );
    //     });
    //   }
    // });
    setzipGeojson(addedDataGeojson);

    return () => {};
  }, [filters]);

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
          ["exponential", 0.5],
          ["get", "num_avg__" + filters.bedroom],
          // When zoom is 15, buildings will be beige.
          20000,
          "red",

          30000,
          "yellow",
          // When zoom is 18 or higher, buildings will be yellow.
          51088,
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
        <Slider aria-label="slider-ex-4" defaultValue={30}>
          <SliderMark value={25} mt="1" ml="-2.5" fontSize="sm">
            25%
          </SliderMark>
          <SliderTrack bg="red.100">
            <SliderFilledTrack bg="tomato" />
          </SliderTrack>
          <SliderThumb boxSize={6} border={"1px"} borderColor={"tomato"}>
            <Box color="tomato" as={MdAttachMoney} />
          </SliderThumb>
        </Slider>

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
        <Source id="zip" type="geojson" data={zipGeojson}>
          <Layer {...(zipLayer as any)}></Layer>
          <Hover sourceId="zip" layerId="zip"></Hover>
        </Source>
      </Map>
      {/* <Legends
        colors={legends.colors}
        min={legends.min}
        max={legends.max}
      ></Legends> */}
    </Box>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Home Page</title>;
