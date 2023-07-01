import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Flex,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderMark,
  RangeSliderThumb,
  RangeSliderTrack,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useMap } from "react-map-gl";
import BedroomFilter from "./BedroomFilter";
import { BEDROOM_COUNT, COLOR_SCENE } from "../constant";
import { MdAttachMoney } from "react-icons/md";

interface Props {
  setfilters: (filters: any) => void;
  filters: any;
}

const Filters = (props: Props) => {
  return (
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
          setfilters={props.setfilters}
          filters={props.filters}
          colorScene={COLOR_SCENE}
          bedroomCount={BEDROOM_COUNT}
        ></BedroomFilter>
      </VStack>
      <VStack w={"full"} alignItems={"start"} pb={8}>
        <Heading size={"md"}>Revenue</Heading>
        <Box px={4} w={"full"}>
          <RangeSlider
            aria-label={["min", "max"]}
            value={props.filters.revenue.value}
            onChange={(value: any) => {
              props.setfilters({
                ...props.filters,
                revenue: { ...props.filters.revenue, value: value },
              });
            }}
            min={props.filters.revenue.min}
            max={props.filters.revenue.max}
          >
            <RangeSliderMark
              value={props.filters.revenue.min || 0}
              mt="2.5"
              ml="-3"
              fontWeight={"bold"}
              fontSize="sm"
            >
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                notation: "compact",
              }).format(props.filters.revenue.min)}
            </RangeSliderMark>
            <RangeSliderMark
              value={props.filters.revenue.max || 0}
              mt="2.5"
              ml="-3"
              fontWeight={"bold"}
              fontSize="sm"
            >
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                notation: "compact",
              }).format(props.filters.revenue.max)}
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
  );
};

export default Filters;
