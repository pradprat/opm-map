import { Box, Button, ButtonProps, Heading, VStack } from "@chakra-ui/react";
import React from "react";

interface Props {
  setfilters: (filters: any) => void;
  filters: any;
  allowMultiple?: boolean;
  colorScene?: string[];
  bedroomCount?: string[];
}

const selectedFilter = {
  color: "white",
  _hover: {},
} as ButtonProps;

const BedroomFilter = (props: Props) => {
  return (
    <VStack alignItems={"start"} w={"full"}>
      {props.bedroomCount?.map((item) => {
        const index = props.filters.bedroom.indexOf(item);
        return (
          <Button
            size={"sm"}
            w={"full"}
            key={item}
            onClick={() => {
              if (props.allowMultiple) {
                // toggle filter
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
              } else {
                props.setfilters({
                  ...props.filters,
                  bedroom: [item],
                });
              }
            }}
            {...(props.filters.bedroom.includes(item) ? selectedFilter : {})}
            bg={
              props.filters.bedroom.includes(item)
                ? props.colorScene?.[index]
                : "gray.300"
            }
            textAlign={"left"}
            justifyContent={"flex-start"}
          >
            {item} bedrooms
          </Button>
        );
      })}
    </VStack>
  );
};

export default BedroomFilter;
