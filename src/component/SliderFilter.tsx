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

const SliderFilter = (props: Props) => {
  return (
    <Box px={4} py={2} w={"full"}>
      <RangeSlider
        aria-label={["min", "max"]}
        value={props.filters?.value}
        onChange={(value: any) => {
          props.setfilters({ ...props.filters, value: value });
        }}
        min={props.filters?.min}
        max={props.filters?.max}
      >
        <RangeSliderMark
          value={props.filters?.min || 0}
          mt="2.5"
          ml="-3"
          fontWeight={"bold"}
          fontSize="sm"
        >
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            notation: "compact",
          }).format(props.filters?.min)}
        </RangeSliderMark>
        <RangeSliderMark
          value={props.filters?.max || 0}
          mt="2.5"
          ml="-3"
          fontWeight={"bold"}
          fontSize="sm"
        >
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            notation: "compact",
          }).format(props.filters?.max)}
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
  );
};

export default SliderFilter;
