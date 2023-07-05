import { useEffect, useRef, useState, useMemo } from "react";
import { HeadFC, PageProps } from "gatsby";
import mapboxgl from "mapbox-gl";
import React from "react";
import { Box, Button, Flex, VStack } from "@chakra-ui/react";
import pivot_bedroom from "../content/pivot_bedroom.json";
import us_zip from "../content/us_zip.json";
import Map, { LayerProps, Marker, NavigationControl } from "react-map-gl";
import {
  filterGeojson,
  geoJsonAddFeatureId,
  geoJsonAddProperties,
  geoJsonAddRandomFeatureId,
  getPointGeojson,
} from "../utils/map";
import { formatMoneyDataToNumber } from "../utils/data";
import raw_bedroom from "../content/raw_bedroom.json";
import az_geojson from "../data/geojson/us/cities/az/phoenix.json";
import * as turf from "@turf/turf";
import {
  getGeneralLayer,
  getZipLabelLayer,
  getZipLayer,
} from "../utils/layers";
import { COLOR_SCENE } from "../constant";
import BedroomMarker from "../component/BedroomMarker";
import Sidebar from "../component/Sidebar";
import ComposedLayer from "../component/ComposedLayer";
import Filters from "../component/Filters";
mapboxgl.accessToken =
  "pk.eyJ1IjoicHJhZHByYXQiLCJhIjoiY2tnMHhwbXZvMDc4eDJ1cXd1ZmFueHk5YiJ9.wfhci5Mpn6cahjx3GnOfYQ";

const IndexPage: React.FC<PageProps> = () => {
  const [refreshMarker, setrefreshMarker] = useState(0);
  const map = useRef<mapboxgl.Map>();

  // state
  const [filters, setfilters] = useState({
    bedroom: ["1"],
    revenue: {
      min: 0,
      max: 0,
      value: [0, 0],
    },
  });
  const [level, setlevel] = useState({
    current: "state",
    state: "",
    city: "",
    zip: "",
  });
  const [zipGeojson, setzipGeojson] = useState();
  const [stateGeojson, setstateGeojson] = useState(
    geoJsonAddRandomFeatureId(az_geojson)
  );
  const [pointGeojson, setpointGeojson] = useState();
  const [zipSelected, setzipSelected] = useState("");
  const [bedroomList, setbedroomList] = useState([]);

  // memo
  const zipLayer = useMemo(
    () =>
      getZipLayer({
        numBedroom: filters.bedroom[0],
        min: filters.revenue.min,
        max: filters.revenue.max,
      }),
    [filters, filters.revenue]
  );
  const labelLayer = useMemo(
    () => getZipLabelLayer({ numBedroom: filters.bedroom }),
    [filters]
  );
  const filteredBedroomList = useMemo(() => {
    return bedroomList.filter((item: any) => {
      return (
        item.revenue > filters.revenue.value[0] &&
        item.revenue < filters.revenue.value[1]
      );
    });
  }, [filters.revenue.value, bedroomList]);

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
      setfilters({
        ...filters,
        revenue: {
          min,
          max,
          value: [min, max],
        },
      });
    });
    setzipGeojson(addedDataGeojson);
    const pointGeojson = getPointGeojson(addedDataGeojson);
    setpointGeojson(pointGeojson);
    return () => {};
  }, [filters.bedroom]);

  useEffect(() => {
    const filteredZipGeojson = (zipGeojson as any)?.features.filter(
      (item: any) =>
        item.properties["num_avg__" + filters.bedroom[0]] >
          filters.revenue.value[0] &&
        item.properties["num_avg__" + filters.bedroom[0]] <
          filters.revenue.value[1]
    );
    const filteredPointGeojson = (pointGeojson as any)?.features.filter(
      (item: any) =>
        item.properties["num_avg__" + filters.bedroom[0]] >
          filters.revenue.value[0] &&
        item.properties["num_avg__" + filters.bedroom[0]] <
          filters.revenue.value[1]
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
  }, [filters.revenue]);

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
    if (level.current === "state") {
      const bounds = turf.bbox(stateGeojson) as any;
      map.current?.fitBounds(bounds, {
        padding: 20,
      });
    }

    return () => {};
  }, [level.current]);

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
    setlevel({
      ...level,
      zip: zipcode,
      current: "zip",
    });
  };

  return (
    <Flex>
      <Box w={336} background={"#26023D"} color={"white"}>
        <Sidebar></Sidebar>
      </Box>
      <Box w="100%" h="100vh" flex={1}>
        <VStack
          position={"absolute"}
          zIndex={1}
          m={4}
          alignItems={"flex-start"}
          gap={2}
          minWidth={"200px"}
        >
          {["zip", "city"].includes(level.current) && (
            <Filters filters={filters} setfilters={setfilters}></Filters>
          )}
          <Box>
            {level.current === "zip" && (
              <Button
                onClick={() => {
                  setzipSelected("");
                  setlevel({
                    ...level,
                    current: "city",
                    zip: "",
                  });
                }}
                bg={"white"}
                shadow={"lg"}
              >
                Back to city view
              </Button>
            )}
            {level.current === "city" && (
              <Button
                onClick={() => {
                  setzipSelected("");
                  setlevel({
                    ...level,
                    current: "state",
                    city: "",
                  });
                }}
                bg={"white"}
                shadow={"lg"}
              >
                Back to state view
              </Button>
            )}
          </Box>
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
          onIdle={(e) => {
            setrefreshMarker(e.target.getCenter().lat);
          }}
        >
          {level.current === "state" && (
            <ComposedLayer
              id="state"
              geojson={stateGeojson}
              layerProps={getGeneralLayer()}
              hoverEffect
              onClick={() => {
                setlevel({
                  ...level,
                  current: "city",
                  state: "AZ",
                });
              }}
            ></ComposedLayer>
          )}
          {level.current === "city" && (
            <>
              <ComposedLayer
                id="zip"
                geojson={zipGeojson}
                layerProps={zipLayer}
                hoverEffect
                onClick={setOnClickZip}
              ></ComposedLayer>
              <ComposedLayer
                id="zip-label"
                geojson={pointGeojson}
                layerProps={labelLayer}
              ></ComposedLayer>
            </>
          )}
          {filteredBedroomList.map((item: any) => (
            <Marker
              longitude={item.longitude}
              latitude={item.latitude}
              anchor="bottom"
            >
              <BedroomMarker
                item={item}
                refreshValue={refreshMarker}
              ></BedroomMarker>
            </Marker>
          ))}
          <NavigationControl />
        </Map>
      </Box>
    </Flex>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Home Page</title>;
