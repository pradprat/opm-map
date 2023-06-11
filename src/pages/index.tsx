import { useEffect, useRef, useState, useMemo } from "react";
import { HeadFC, Link, PageProps } from "gatsby";
import mapboxgl from "mapbox-gl";
import React from "react";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Portal,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderMark,
  RangeSliderThumb,
  RangeSliderTrack,
  SliderMark,
  Tag,
  TagLabel,
  Text,
  VStack,
  useBreakpoint,
  useMediaQuery,
} from "@chakra-ui/react";
import pivot_bedroom from "../content/pivot_bedroom.json";
import us_zip from "../content/us_zip.json";
import Map, { Layer, Marker, Source } from "react-map-gl";
import Hover from "../component/Hover";
import BedroomFilter from "../component/BedroomFilter";
import { MdAttachMoney, MdOutlineChevronRight } from "react-icons/md";
import {
  filterGeojson,
  geoJsonAddFeatureId,
  geoJsonAddProperties,
  getPointGeojson,
} from "../utils/map";
import { formatMoneyDataToNumber } from "../utils/data";
import Click from "../component/Click";
import raw_bedroom from "../content/raw_bedroom.json";
import * as turf from "@turf/turf";
import { FaBed } from "react-icons/fa";
import {
  getZipBorderLayer,
  getZipLabelLayer,
  getZipLayer,
} from "../utils/layers";
import { BEDROOM_COUNT, COLOR_SCENE } from "../constant";
import { BiLinkExternal } from "react-icons/bi";
import BedroomMarker from "../component/BedroomMarker";
import Sidebar from "../component/Sidebar";

mapboxgl.accessToken =
  "pk.eyJ1IjoicHJhZHByYXQiLCJhIjoiY2tnMHhwbXZvMDc4eDJ1cXd1ZmFueHk5YiJ9.wfhci5Mpn6cahjx3GnOfYQ";

const IndexPage: React.FC<PageProps> = () => {
  const breakpoint = useBreakpoint({ ssr: false });
  const [isOnMobile] = useMediaQuery("(min-width: 30em)");
  const map = useRef<mapboxgl.Map>();

  // state
  const [filters, setfilters] = useState({
    bedroom: ["1"],
  });
  const [sliderData, setsliderData] = useState({
    min: 0,
    max: 0,
    value: [0, 0],
  });
  const [zipGeojson, setzipGeojson] = useState();
  const [zipBorderGeojson, setzipBorderGeojson] = useState();
  const [pointGeojson, setpointGeojson] = useState();
  const [zipSelected, setzipSelected] = useState("");
  const [bedroomList, setbedroomList] = useState([]);
  const [selectedBedroom, setselectedBedroom] = useState<any>({});

  // memo
  const zipLayer = useMemo(
    () =>
      getZipLayer({
        numBedroom: filters.bedroom[0],
        min: sliderData.min,
        max: sliderData.max,
      }),
    [filters, sliderData]
  );
  const zipBorderLayer = useMemo(() => getZipBorderLayer(), []);
  const labelLayer = useMemo(
    () => getZipLabelLayer({ numBedroom: filters.bedroom[0] }),
    [filters]
  );
  const filteredBedroomList = useMemo(() => {
    return bedroomList.filter((item: any) => {
      return (
        item.revenue > sliderData.value[0] && item.revenue < sliderData.value[1]
      );
    });
  }, [sliderData.value, bedroomList]);

  // effect
  useEffect(() => {
    const zipGeojson = geoJsonAddFeatureId(us_zip, "ZCTA5CE10");
    const room_data = pivot_bedroom.map((item) => {
      return formatMoneyDataToNumber(item);
    });
    const availableRoomData = room_data.filter((item) => {
      return filters.bedroom
        .map((bedroom) => {
          return item["num_avg__" + bedroom] !== 0;
        })
        .reduce((a, b) => a || b);
    });
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
    filters.bedroom.forEach((bedroom) => {
      const bedroomData = availableRoomData.map((item) => {
        return item["num_avg__" + bedroom];
      });
      const min = Math.min(...bedroomData);
      const max = Math.max(...bedroomData);
      setsliderData({
        min,
        max,
        value: [min, max],
      });
    });
    setzipGeojson(addedDataGeojson);
    const pointGeojson = getPointGeojson(addedDataGeojson);
    setpointGeojson(pointGeojson);
    setzipBorderGeojson(us_zip as any);
    return () => {};
  }, [filters]);

  useEffect(() => {
    const filteredZipGeojson = (zipGeojson as any)?.features.filter(
      (item: any) =>
        item.properties["num_avg__" + filters.bedroom[0]] >
          sliderData.value[0] &&
        item.properties["num_avg__" + filters.bedroom[0]] < sliderData.value[1]
    );
    const filteredPointGeojson = (pointGeojson as any)?.features.filter(
      (item: any) =>
        item.properties["num_avg__" + filters.bedroom[0]] >
          sliderData.value[0] &&
        item.properties["num_avg__" + filters.bedroom[0]] < sliderData.value[1]
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

  useEffect(() => {
    if (zipSelected === "" || zipSelected === undefined) {
      setbedroomList([]);
      zoomOut();
      return;
    }
    const bedroooms = (raw_bedroom as any).filter(
      (item: any) =>
        item["regions/zipcode_ids/0"] === zipSelected &&
        filters.bedroom.includes(String(item["bedrooms"]))
    );
    const coloredBedrooms = bedroooms.map((item: any) => {
      const bedIndex = filters.bedroom.indexOf(String(item["bedrooms"]));
      const color = COLOR_SCENE[bedIndex];
      return {
        ...item,
        color,
      };
    });
    setbedroomList(coloredBedrooms);
    setTimeout(() => {
      zoomToZip(zipSelected);
    }, 500);
    return () => {};
  }, [zipSelected, filters]);

  useEffect(() => {
    resizeMap();
    return () => {};
  }, [isOnMobile]);

  // function
  const resizeMap = () => {
    map.current?.resize();
  };

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

  const setOnClickZip = (e: any) => {
    const zipcode = e.features[0].properties.zipcode;
    setzipSelected(zipcode);
  };

  return (
    <Flex>
      {isOnMobile && (
        <Box w={336}>
          <Sidebar></Sidebar>
        </Box>
      )}
      <Box w="100%" h="100vh" flex={1}>
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
            minWidth={240}
          >
            <VStack w={"full"} alignItems={"start"}>
              <Heading size={"md"}>Bedroom</Heading>
              <BedroomFilter
                setfilters={setfilters}
                filters={filters}
                allowMultiple={zipSelected !== ""}
                colorScene={COLOR_SCENE}
                bedroomCount={BEDROOM_COUNT}
              ></BedroomFilter>
            </VStack>
            <VStack w={"full"} alignItems={"start"} pb={8}>
              <Heading size={"md"}>Revenue</Heading>
              <Box px={4} w={"full"}>
                <RangeSlider
                  aria-label={["min", "max"]}
                  value={sliderData.value}
                  onChange={(value) => {
                    setsliderData({ ...sliderData, value: value as number[] });
                  }}
                  min={sliderData.min}
                  max={sliderData.max}
                >
                  <RangeSliderMark
                    value={sliderData.min || 0}
                    mt="2.5"
                    ml="-3"
                    fontWeight={"bold"}
                    fontSize="sm"
                  >
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      notation: "compact",
                    }).format(sliderData.min)}
                  </RangeSliderMark>
                  <RangeSliderMark
                    value={sliderData.max || 0}
                    mt="2.5"
                    ml="-3"
                    fontWeight={"bold"}
                    fontSize="sm"
                  >
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      notation: "compact",
                    }).format(sliderData.max)}
                  </RangeSliderMark>
                  <RangeSliderTrack>
                    <RangeSliderFilledTrack bg={COLOR_SCENE[0]} />
                  </RangeSliderTrack>
                  <RangeSliderThumb boxSize={6} index={0}>
                    <Box as={MdAttachMoney} />
                  </RangeSliderThumb>
                  <RangeSliderThumb boxSize={6} index={1}>
                    <Box as={MdAttachMoney} />
                  </RangeSliderThumb>
                </RangeSlider>
              </Box>
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
              <Click
                sourceId="zip"
                layerId="zip"
                onClick={setOnClickZip}
              ></Click>
            </Source>
          )}
          {!zipSelected && (
            <Source id="zip-label" type="geojson" data={pointGeojson}>
              <Layer {...(labelLayer as any)}></Layer>
            </Source>
          )}
          {filteredBedroomList.map((item: any) => (
            <Marker
              longitude={item.longitude}
              latitude={item.latitude}
              anchor="bottom"
            >
              <BedroomMarker item={item}></BedroomMarker>
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
      {/* filters */}
    </Flex>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Home Page</title>;
