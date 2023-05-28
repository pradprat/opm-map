import { useEffect } from "react";
import type { HeadFC, PageProps } from "gatsby";
import mapboxgl from "mapbox-gl";
import React from "react";
import { Box, Heading, VStack } from "@chakra-ui/react";
import { Select } from "chakra-react-select";

const IndexPage: React.FC<PageProps> = () => {
  mapboxgl.accessToken =
    "pk.eyJ1IjoicHJhZHByYXQiLCJhIjoiY2tnMHhwbXZvMDc4eDJ1cXd1ZmFueHk5YiJ9.wfhci5Mpn6cahjx3GnOfYQ";
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: "mapbox", // container ID
      // mapbox light
      style: "mapbox://styles/mapbox/light-v10", // style URL
      center: [-74.5, 40], // starting position [lng, lat]
      zoom: 9, // starting zoom
    });

    return () => {};
  }, []);

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
      <Box style={{ width: "100%", height: "100vh" }} id="mapbox"></Box>
    </Box>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Home Page</title>;
