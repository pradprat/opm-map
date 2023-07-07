import { Box, Button, ButtonProps, Heading, VStack } from "@chakra-ui/react";
import React, { useMemo } from "react";
import SliderFilter from "./SliderFilter";

interface Props {
  setfilters: (filters: any) => void;
  filters: any;
  colorScene?: string[];
  bedroomCount?: string[];
}

const selectedFilter = {
  color: "white",
  _hover: {},
} as ButtonProps;

const BedroomFilter = (props: Props) => {
  const isActive = (item: string) => {
    return props.filters.bedroom.includes(item);
  };
  return (
    <VStack alignItems={"start"} w={"full"}>
      {props.bedroomCount?.map((item) => {
        const index = props.filters.bedroom.indexOf(item);
        return (
          <Box w={"full"}>
            <Button
              size={"sm"}
              w={"full"}
              key={item}
              onClick={() => {
                const ifExist = props.filters.bedroom.includes(item);
                if (ifExist && props.filters.bedroom.length > 1) {
                  props.setfilters({
                    ...props.filters,
                    bedroom: props.filters.bedroom.filter(
                      (i: string) => i !== item
                    ),
                  });
                }
                if (!ifExist) {
                  props.setfilters({
                    ...props.filters,
                    bedroom: [...props.filters.bedroom, item],
                  });
                }
              }}
              {...(isActive(item) ? selectedFilter : {})}
              bg={isActive(item) ? props.colorScene?.[index] : "gray.300"}
              textAlign={"left"}
              justifyContent={"flex-start"}
            >
              {item} bedrooms
            </Button>
            {isActive(item) && (
              <SliderFilter
                filters={props.filters.revenue[String(item)]}
                setfilters={(filters: any) => {
                  props.setfilters({
                    ...props.filters,
                    revenue: {
                      ...props.filters.revenue,
                      [item]: filters,
                    },
                  });
                }}
              ></SliderFilter>
            )}
          </Box>
        );
      })}
    </VStack>
  );
};

export default BedroomFilter;
