import { useEffect, useRef, useState, useMemo } from "react";
import { HeadFC, PageProps, Script } from "gatsby";
import mapboxgl from "mapbox-gl";
import React from "react";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  ButtonProps,
  HStack,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderMark,
  RangeSliderThumb,
  RangeSliderTrack,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  VStack,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { loadBingApi } from "../libs/bingMap";
import { getGeojson, getPostalCodesData } from "../request/getGeojson";
import pivot_bedroom from "../content/pivot_bedroom.json";
import us_zip from "../content/us_zip.json";
import Legends from "../component/Legend";
import Map, { Layer, Marker, Source } from "react-map-gl";
import Hover from "../component/Hover";
import BedroomFilter from "../component/BedroomFilter";
import {
  MdAttachMoney,
  MdGraphicEq,
  MdOutlineChevronRight,
} from "react-icons/md";
import {
  filterGeojson,
  geoJsonAddFeatureId,
  geoJsonAddProperties,
  getPointGeojson,
} from "../utils/map";
import { formatMoneyDataToNumber, getMinMaxValue } from "../utils/data";
import Click from "../component/Click";
import raw_bedroom from "../content/raw_bedroom.json";
import * as turf from "@turf/turf";

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
    value: [0, 0],
  });
  const map = useRef<mapboxgl.Map>();
  const [zipGeojson, setzipGeojson] = useState();
  const [zipBorderGeojson, setzipBorderGeojson] = useState();
  const [pointGeojson, setpointGeojson] = useState();
  const [zipSelected, setzipSelected] = useState("");
  const [bedroomList, setbedroomList] = useState([]);
  const [selectedBedroom, setselectedBedroom] = useState<any>({});

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
      value: [min, max],
    });
    setzipGeojson(addedDataGeojson);
    const pointGeojson = getPointGeojson(addedDataGeojson);
    setpointGeojson(pointGeojson);
    setzipBorderGeojson(us_zip as any);
    return () => {};
  }, [filters]);

  const setOnClickZip = (e: any) => {
    const zipcode = e.features[0].properties.zipcode;
    setzipSelected(zipcode);
  };

  useEffect(() => {
    const filteredZipGeojson = (zipGeojson as any)?.features.filter(
      (item: any) =>
        item.properties["num_avg__" + filters.bedroom] > sliderData.value[0] &&
        item.properties["num_avg__" + filters.bedroom] < sliderData.value[1]
    );
    const filteredPointGeojson = (pointGeojson as any)?.features.filter(
      (item: any) =>
        item.properties["num_avg__" + filters.bedroom] > sliderData.value[0] &&
        item.properties["num_avg__" + filters.bedroom] < sliderData.value[1]
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
  const zipBorderLayer = useMemo(
    () => ({
      id: "zip-border",
      type: "line",
      source: "zip",
      layout: {},
      paint: {
        "line-color": "#000",
        "line-width": 1,
      },
    }),
    []
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

  const zoomToZip = (zip: string) => {
    if (zipGeojson === undefined || zipGeojson === "") {
      return;
    }
    const zipFeature = (zipGeojson as any).features.find(
      (item: any) => item.properties.zipcode === zip
    );
    const bounds = turf.bbox(zipFeature) as any;
    map.current?.fitBounds(bounds, {
      padding: 20,
    });
  };

  const zoomOut = () => {
    if (zipGeojson) {
      const bounds = turf.bbox(zipGeojson) as any;
      map.current?.fitBounds(bounds, {
        padding: 20,
      });
    }
  };

  useEffect(() => {
    if (zipSelected === "" || zipSelected === undefined) {
      setbedroomList([]);
      zoomOut();
      return;
    }
    zoomToZip(zipSelected);
    const bedroooms = (raw_bedroom as any).filter(
      (item: any) =>
        item["regions/zipcode_ids/0"] === zipSelected &&
        String(item["bedrooms"]) === String(filters.bedroom)
    );
    setbedroomList(bedroooms);
    return () => {};
  }, [zipSelected, filters]);

  return (
    <Box>
      {/* filters */}
      <VStack
        position={"absolute"}
        zIndex={1}
        m={4}
        alignItems={"flex-start"}
        gap={2}
        minWidth={"200px"}
      >
        <Box bg={"white"} p={4} shadow={"lg"} borderRadius={"lg"}>
          <Breadcrumb
            spacing="8px"
            separator={
              <Heading size={"md"}>
                <MdOutlineChevronRight color="gray.500" />
              </Heading>
            }
          >
            <BreadcrumbItem>
              <Button
                variant={"link"}
                onClick={() => setzipSelected("")}
                color={"black"}
                _hover={{ textDecoration: "none" }}
              >
                <Heading size={"md"}>Phoenix</Heading>
              </Button>
            </BreadcrumbItem>
            {zipSelected && (
              <BreadcrumbItem>
                <Heading size={"md"}>{zipSelected}</Heading>
              </BreadcrumbItem>
            )}
          </Breadcrumb>
        </Box>
        <VStack
          bg={"white"}
          p={4}
          shadow={"lg"}
          borderRadius={"lg"}
          alignItems={"start"}
          gap={4}
        >
          <Heading size={"md"}>Filter</Heading>
          <BedroomFilter
            setfilters={setfilters}
            filters={filters}
          ></BedroomFilter>
          <VStack w={"full"} alignItems={"start"}>
            <Heading size={"md"}>Revenue</Heading>
            <RangeSlider
              aria-label={["min", "max"]}
              value={sliderData.value}
              onChange={(value) => {
                setsliderData({ ...sliderData, value: value as number[] });
              }}
              min={sliderData.min}
              max={sliderData.max}
            >
              <RangeSliderTrack>
                <RangeSliderFilledTrack />
              </RangeSliderTrack>
              <RangeSliderThumb boxSize={6} index={0}>
                <Box as={MdAttachMoney} />
              </RangeSliderThumb>
              <RangeSliderThumb boxSize={6} index={1}>
                <Box as={MdAttachMoney} />
              </RangeSliderThumb>
            </RangeSlider>
          </VStack>
        </VStack>
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
        <Source id="zip-border" type="geojson" data={zipBorderGeojson}>
          <Layer {...(zipBorderLayer as any)}></Layer>
        </Source>
        {!zipSelected && (
          <Source id="zip" type="geojson" data={zipGeojson}>
            <Layer {...(zipLayer as any)} beforeId="zip-border"></Layer>
            <Hover sourceId="zip" layerId="zip"></Hover>
            <Click sourceId="zip" layerId="zip" onClick={setOnClickZip}></Click>
          </Source>
        )}
        {!zipSelected && (
          <Source id="zip-label" type="geojson" data={pointGeojson}>
            <Layer {...(labelLayer as any)}></Layer>
          </Source>
        )}
        {bedroomList.map((item: any) => (
          <Marker
            longitude={item.longitude}
            latitude={item.latitude}
            anchor="bottom"
            onClick={() => {
              setselectedBedroom(item);
            }}
          >
            <VStack maxW={48} gap={0}>
              <Image
                height={16}
                width={16}
                src="https://docs.mapbox.com/help/demos/custom-markers-gl-js/mapbox-icon.png"
              />
              <Heading textAlign={"center"} size={"sm"} mt={-8}>
                {item.title || ""}
              </Heading>
            </VStack>
          </Marker>
        ))}
      </Map>
      <Modal
        isOpen={selectedBedroom.title}
        onClose={() => setselectedBedroom({})}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedBedroom.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Image
              src={selectedBedroom.img_cover}
              borderRadius={"md"}
              mb={4}
              height={300}
              width={"full"}
              fallbackSrc="https://via.placeholder.com/300"
              objectFit={"cover"}
            ></Image>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Home Page</title>;
