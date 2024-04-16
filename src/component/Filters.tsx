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
    </VStack>
  );
};

export default Filters;
