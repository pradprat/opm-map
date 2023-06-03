import { Box, Button, ButtonProps, Heading, VStack } from "@chakra-ui/react";
import React from "react";

interface Props {
  setfilters: (filters: any) => void;
  filters: any;
}

const selectedFilter = {
  bg: "teal.400",
  color: "white",
  _hover: {},
} as ButtonProps;
const BedroomFilter = (props: Props) => {
  return (
    <VStack alignItems={"start"} w={"full"}>
      <Heading size={"sm"}>Bedrooms</Heading>
      <VStack alignItems={"start"} w={"full"}>
        {["1", "2", "3", "4", "5"].map((item) => {
          return (
            <Button
              w={"full"}
              key={item}
              onClick={() => {
                props.setfilters({
                  ...props.filters,
                  bedroom: item,
                });
              }}
              {...(props.filters.bedroom === item ? selectedFilter : {})}
              textAlign={"left"}
              justifyContent={"flex-start"}
            >
              {item} bedrooms
            </Button>
          );
        })}
      </VStack>
    </VStack>
  );
};

export default BedroomFilter;
