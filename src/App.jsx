/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import React from "react";
import { Box, Button, Flex, Heading, VStack } from "@chakra-ui/react";
import pivot_bedroom from "./json/pivot_bedroom.json";
import us_zip from "./json/us_zip.json";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl";
import {
  filterGeojson,
  geoJsonAddFeatureId,
  geoJsonAddProperties,
  geoJsonAddRandomFeatureId,
  getPointGeojson,
} from "./utils/map";
import { formatMoneyDataToNumber } from "./utils/data";
import raw_bedroom from "./json/raw_bedroom.json";
import az_geojson from "./json/geojson/us/cities/az/phoenix.json";
import phoenix_zip from "./json/phoenixZipcode.json";
import * as turf from "@turf/turf";
import {
  getGeneralLineLayer,
  getZipLayer,
} from "./utils/layers";
import { COLOR_SCENE } from "./constant";
import BedroomMarker from "./component/BedroomMarker";
import Sidebar from "./component/Sidebar";
import ComposedLayer from "./component/ComposedLayer";
import Filters from "./component/Filters";
import "./index.css";
mapboxgl.accessToken =
  "pk.eyJ1IjoicHJhZHByYXQiLCJhIjoiY2tnMHhwbXZvMDc4eDJ1cXd1ZmFueHk5YiJ9.wfhci5Mpn6cahjx3GnOfYQ";
const App = () => {


  // zipcodes fetch apis

  const [zipcodes, setZipCodes] = useState([]);


  let fetchRes = fetch("http://34.71.248.31:8080/v1/city-zip-stats?city=Phoenix");
    fetchRes.then(res =>
        res.json()).then(d => {
          setZipCodes(d.zipCodeStats);
            //  console.log(zipcodes)
        })





  const [refreshMarker, setrefreshMarker] = useState(0);
  const map = useRef();

  // state
  const [filters, setfilters] = useState({
    bedroom: ["1"],
    revenue: {},
  });
  const [level, setlevel] = useState({
    current: "city",
    state: "",
    city: "",
    zip: "",
  });
  const [mouseCoord, setmouseCoord] = useState([]);
  const [zipGeojson, setzipGeojson] = useState();

  const [zipGeojsonCache, setzipGeojsonCache] = useState();
  const [stateGeojson, setstateGeojson] = useState(
    geoJsonAddRandomFeatureId(az_geojson)
  );
  const [pointGeojson, setpointGeojson] = useState();
  const [zipSelected, setzipSelected] = useState("");
  const [bedroomList, setbedroomList] = useState([]);
  const [zipHovered, setzipHovered] = useState();


  const selectedZipGeojson = useMemo(() => {
    const zipFeature = zipGeojson?.features.find((item) => {
      return String(item.properties.zipcode) === String(zipSelected);
    });
    return {
      type: "FeatureCollection",
      features: [zipFeature],
    };
  }, [zipGeojson, zipSelected]);

  // const allZipList = zipcodes.map((item) => item.ZipCode);
  const allZipList = phoenix_zip.map((item) => item.zip_code);
 
  const allZipGeojson = useMemo(() => {
    const zipGeojson = geoJsonAddFeatureId(us_zip, "ZCTA5CE10");
    const zipFeature = zipGeojson?.features.filter((item) => {
      return allZipList.includes(Number(item.id));
    });
    return {
      type: "FeatureCollection",
      features: zipFeature,
    };
  }, [allZipList]);

  useEffect(() => {
    if (level.current === "zip") {
      const revenueFilter = filters.bedroom.map((bedroom) => {
        const countBedroom = bedroomList.filter(
          (item) =>
            Number(item["bedrooms"]) === Number(bedroom) && item["revenue"]
        );
        const minmax = getMinMax(countBedroom, "revenue");
        return {
          [bedroom]: {
            min: minmax.min,
            max: minmax.max,
            value: [minmax.min, minmax.max],
          },
        };
      });
      setfilters({
        ...filters,
        revenue: {
          ...filters.revenue,
          ...revenueFilter.reduce((a, b) => ({ ...a, ...b }), {}),
        },
      });
    }
    return () => { };
  }, [bedroomList, level.current]);

  // memo
  const zipLayer = useMemo(
    () =>
      getZipLayer({
        numBedroom: filters.bedroom[0],
        min: 0,
        max: 2000,
      }),
    [filters, filters.revenue]
  );

  const filteredBedroomList = useMemo(() => {
    return bedroomList.filter((item) => {
      const revenue = item["revenue"];
      const bedroom = item["bedrooms"];
      const revenueFilter = filters.revenue[String(bedroom)];
      return (
        revenue >= revenueFilter?.value[0] && revenue <= revenueFilter?.value[1]
      );
    });
  }, [bedroomList, filters.revenue]);

  // effect
  useEffect(() => {
    const zipGeojson = allZipGeojson;
    const room_data = pivot_bedroom.map((item) => {
      return formatMoneyDataToNumber(item);
    });
    const listingCount = room_data.map((item) => {
      const bedCount = filters.bedroom.map((bedroom) => {
        return item["num_count_bed_" + bedroom];
      });
      const totalCount = bedCount.reduce((a, b) => a + b);
      return {
        ...item,
        totalCount,
      };
    });
    const filteredGeojson = filterGeojson(
      zipGeojson,
      listingCount,
      "ZCTA5CE10",
      "zipcode"
    );
    const addedDataGeojson = geoJsonAddProperties(
      filteredGeojson,
      listingCount,
      "zipcode"
    );
    if (level.current === "city") {
      const bedroomsMinMax = filters.bedroom.map((bedroom) => {
        const bedroomData = room_data.map((item) => {
          return item["num_avg_rev_bed_" + bedroom];
        });
        const minmax = getMinMax(bedroomData);
        return {
          [String(bedroom)]: {
            min: minmax.min,
            max: minmax.max,
            value: [minmax.min, minmax.max],
          },
        };
      });
      setfilters({
        ...filters,
        revenue: {
          ...filters.revenue,
          ...bedroomsMinMax.reduce((a, b) => ({ ...a, ...b }), {}),
        },
      });
    }
    setzipGeojsonCache(addedDataGeojson);
    const pointGeojson = getPointGeojson(addedDataGeojson);
    setpointGeojson(pointGeojson);
    return () => { };
  }, [filters.bedroom, level.current, allZipGeojson]);

  useEffect(() => {
    const zipData = zipGeojsonCache?.features;
    const filteredListring = zipData?.map((item) => {
      const bedroomFilterByRevenue = filters.bedroom?.map((bedroom) => {
        const revenue = item.properties["num_avg_rev_bed_" + bedroom];
        const revenueFilter = filters.revenue[String(bedroom)];
        return (
          revenue >= revenueFilter?.value[0] &&
          revenue <= revenueFilter?.value[1]
        );
      });
      const hasListing = bedroomFilterByRevenue.reduce((a, b) => a || b);

      return {
        ...item,
        properties: {
          ...item.properties,
          totalCount: bedroomFilterByRevenue.reduce((a, b) => a || b)
            ? item.properties.totalCount
            : 0,
          hasListing: item.properties.totalCount
            ? hasListing
              ? "hasListing"
              : "noListing"
            : "noData",
        },
      };
    });
    const filteredZipGeojson = {
      type: "FeatureCollection",
      features: filteredListring || [],
    };

    setzipGeojson(filteredZipGeojson);
    const pointGeojson = getPointGeojson(filteredZipGeojson);
    setpointGeojson(pointGeojson);
    return () => { };
  }, [filters.revenue]);

  useEffect(() => {
    if (zipSelected === "" || zipSelected === undefined) {
      setbedroomList([]);
      zoomOut();
      return;
    }
    const bedroooms = (raw_bedroom).filter(
      (item) =>
        item["regions/zipcode_ids/0"] === zipSelected &&
        filters.bedroom.includes(String(item["bedrooms"]))
    );

    setbedroomList(bedroooms);
    setTimeout(() => {
      zoomToZip(zipSelected);
    }, 500);
    return () => { };
  }, [zipSelected, filters.bedroom]);

  useEffect(() => {
    if (level.current === "state") {
      const bounds = turf.bbox(stateGeojson);
      map.current?.fitBounds(bounds, {
        padding: 20,
      });
    }
    return () => { };
  }, [level.current]);

  useEffect(() => {
    map.current?.setFeatureState(
      { source: "zip-label", id: zipHovered },
      { hover: true }
    );
    return () => { };
  }, [zipHovered]);

  const getMinMax = (data, key) => {
    const min = Math.min(...data.map((item) => (key ? item[key] : item)));
    const max = Math.max(...data.map((item) => (key ? item[key] : item)));
    return {
      min,
      max,
    };
  };

  const zoomToZip = (zip) => {
    if (zipGeojson === undefined || zipGeojson === "") {
      return;
    }
    const zipFeature = (zipGeojson).features.find(
      (item) => item.properties.zipcode === zip
    );
    const bounds = turf.bbox(zipFeature);
    map.current?.fitBounds(bounds, {
      padding: 20,
    });
  };

  const zoomOut = () => {
    if (zipGeojson) {
      const bounds = turf.bbox(zipGeojson);
      map.current?.fitBounds(bounds, {
        padding: 20,
      });
    }
  };

  const setOnClickZip = (e) => {
    const zipcode = e.features[0].properties.zipcode;
    setzipSelected(zipcode);
    setlevel({
      ...level,
      zip: zipcode,
      current: "zip",
    });
  };
  return (
    <Flex w={"full"}>
      {/* <Box w={260} background={"#26023D"} color={"white"}>
        <Sidebar></Sidebar>
      </Box> */}
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
          </Box>
        </VStack>
        <Map
          ref={(ref) => (map.current = ref?.getMap())}
          initialViewState={{
            longitude: -112.06053,
            latitude: 33.53343,
            zoom: 10,
          }}
          style={{ width: "100%", height: "100vh" }}
          mapStyle="mapbox://styles/mapbox/light-v10"
          onMoveEnd={() => {
            setrefreshMarker(Math.random());
          }}
          onMouseMove={(e) => {
            setmouseCoord(e.lngLat.toArray());
          }}
        >
          {zipHovered && (
            <Popup
              longitude={mouseCoord[0]}
              latitude={mouseCoord[1]}
              className="zip-popup"
              closeButton={false}
              offset={10}
            >
              <Heading size={"md"}>{zipHovered}</Heading>
              {filters.bedroom.sort().map((bedroom, index) => {
                const zipData = zipGeojsonCache?.features.find(
                  (feature) => feature.properties.zipcode === zipHovered
                )?.properties;
                if (zipData[`avg_rev_bed_${bedroom}`]) {
                  return (
                    <Heading
                      size={"sm"}
                      color={COLOR_SCENE[Number(bedroom) - 1]}
                      key={index}
                    >
                      {bedroom} Bedrooms:{zipData[`avg_rev_bed_${bedroom}`]}
                    </Heading>
                  );
                }
              })}
            </Popup>
          )}
          {level.current === "city" && (
            <>
              <ComposedLayer
                id="zip"
                geojson={zipGeojson}
                layerProps={zipLayer}
                hoverEffect
                onHover={(id) => setzipHovered(id)}
                onClick={setOnClickZip}
              ></ComposedLayer>
            </>
          )}
          {filteredBedroomList.map((item, index) => (
            <Marker
              key={index}
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

export default App;
