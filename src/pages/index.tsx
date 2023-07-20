import { useEffect, useRef, useState, useMemo } from "react";
import { HeadFC, PageProps } from "gatsby";
import mapboxgl from "mapbox-gl";
import React from "react";
import { Box, Button, Flex, VStack } from "@chakra-ui/react";
import pivot_bedroom from "../content/pivot_bedroom.json";
import us_zip from "../content/us_zip.json";
import Map, { Marker, NavigationControl } from "react-map-gl";
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
import phoenix_zip from "../data/phoenixZipcode.json";
import * as turf from "@turf/turf";
import {
  getGeneralLineLayer,
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
    revenue: {} as { [key: string]: any },
  });
  const [level, setlevel] = useState({
    current: "city",
    state: "",
    city: "",
    zip: "",
  });
  const [zipGeojson, setzipGeojson] = useState<any>();

  const [zipGeojsonCache, setzipGeojsonCache] = useState<any>();
  const [stateGeojson, setstateGeojson] = useState(
    geoJsonAddRandomFeatureId(az_geojson)
  );
  const [pointGeojson, setpointGeojson] = useState();
  const [zipSelected, setzipSelected] = useState("");
  const [bedroomList, setbedroomList] = useState([]);

  const selectedZipGeojson = useMemo(() => {
    const zipFeature = zipGeojson?.features.find((item: any) => {
      return String(item.properties.zipcode) === String(zipSelected);
    });
    return {
      type: "FeatureCollection",
      features: [zipFeature],
    };
  }, [zipGeojson, zipSelected]);

  const allZipList = phoenix_zip.map((item) => item.zip_code);
  const allZipGeojson = useMemo(() => {
    const zipGeojson = geoJsonAddFeatureId(us_zip, "ZCTA5CE10");
    const zipFeature = zipGeojson?.features.filter((item: any) => {
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
          (item: any) =>
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
    return () => {};
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
  const labelLayer = useMemo(
    () => getZipLabelLayer({ numBedroom: filters.bedroom }),
    [filters]
  );

  const filteredBedroomList = useMemo(() => {
    return bedroomList.filter((item: any) => {
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
        return item["num_count__" + bedroom];
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
          return item["num_avg__" + bedroom];
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
    return () => {};
  }, [filters.bedroom, level.current]);

  useEffect(() => {
    const zipData = zipGeojsonCache?.features;
    const filteredListring = zipData?.map((item: any) => {
      console.log(zipData);

      const bedroomFilterByRevenue = filters.bedroom?.map((bedroom) => {
        const revenue = item.properties["num_avg__" + bedroom];
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
    return () => {};
  }, [filters.revenue]);

  useEffect(() => {
    const filteredZipGeojson = (zipGeojson as any)?.features.filter(
      (item: any) => true
    );
    const filteredPointGeojson = (pointGeojson as any)?.features.filter(
      (item: any) => true
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
  }, [zipSelected, filters.bedroom]);

  useEffect(() => {
    if (level.current === "state") {
      const bounds = turf.bbox(stateGeojson) as any;
      map.current?.fitBounds(bounds, {
        padding: 20,
      });
    }
    return () => {};
  }, [level.current]);

  const getMinMax = (data: any, key?: string) => {
    const min = Math.min(...data.map((item: any) => (key ? item[key] : item)));
    const max = Math.max(...data.map((item: any) => (key ? item[key] : item)));
    return {
      min,
      max,
    };
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
    setlevel({
      ...level,
      zip: zipcode,
      current: "zip",
    });
  };

  return (
    <Flex>
      <Box w={280} background={"#26023D"} color={"white"}>
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
            {/* {level.current === "city" && (
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
            )} */}
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
          {level.current !== "zip" && (
            <ComposedLayer
              id="state"
              geojson={stateGeojson}
              layerProps={getGeneralLineLayer("#333333")}
              // hoverEffect
              // onClick={() => {
              //   setlevel({
              //     ...level,
              //     current: "city",
              //     state: "AZ",
              //   });
              // }}
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
                id="zip-border"
                sourceId="zip-border"
                geojson={allZipGeojson}
                layerProps={getGeneralLineLayer("#4d4d4d")}
              ></ComposedLayer>
              <ComposedLayer
                id="zip-label"
                geojson={pointGeojson}
                layerProps={labelLayer}
              ></ComposedLayer>
            </>
          )}
          {/* selected zip border */}
          {level.current === "zip" && (
            <ComposedLayer
              id="zip-border-selected"
              sourceId="zip-border-selected"
              geojson={selectedZipGeojson}
              layerProps={getGeneralLineLayer("#4d4d4d")}
            ></ComposedLayer>
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
