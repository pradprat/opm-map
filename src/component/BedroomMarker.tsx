import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Portal,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Tag,
  TagLabel,
  VStack,
} from "@chakra-ui/react";
import { Link } from "gatsby";
import React, { useState } from "react";
import { BiLinkExternal } from "react-icons/bi";
import { FaBed } from "react-icons/fa";

interface Props {
  item: any;
  refreshValue?: any;
}

const BedroomMarker = (props: Props) => {
  const [isFocus, setisFocus] = useState(true);
  return (
    <Popover isLazy placement="top" closeOnBlur={false}>
      <PopoverTrigger>
        <Box
          w={8}
          h={8}
          borderRadius={"full"}
          shadow={"lg"}
          background={props.item.color}
          _hover={{ transform: "scale(1.2)", cursor: "pointer" }}
          transition={"all 0.1s"}
          border={"4px solid white"}
          position={"relative"}
        ></Box>
      </PopoverTrigger>
      <Portal>
        <Box
          position={"relative"}
          zIndex={isFocus ? 2000 : "popover"}
          onBlur={() => setisFocus(false)}
          onFocus={() => setisFocus(true)}
        >
          <PopoverContent aria-label={props.refreshValue}>
            <PopoverArrow bgSize={16} />
            <PopoverCloseButton
              background={"black"}
              opacity={0.2}
              color={"white"}
              _hover={{ opacity: 0.7 }}
            />
            <PopoverBody p={0}>
              <Image
                src={props.item.img_cover}
                borderRadius={"md"}
                borderBottomRadius={"none"}
                width={"full"}
                height={150}
                fallbackSrc="https://via.placeholder.com/300"
                objectFit={"cover"}
              ></Image>
              <VStack p={4} alignItems={"start"}>
                <HStack justifyContent={"space-between"}>
                  <Heading size={"sm"}>{props.item.title}</Heading>
                  {props.item["Airbnb Link"] && (
                    <Link to={props.item["Airbnb Link"]} target="none">
                      <IconButton
                        as={BiLinkExternal}
                        aria-label="go"
                        variant={"ghost"}
                        size={"xs"}
                      ></IconButton>
                    </Link>
                  )}
                </HStack>
                <Flex wrap={"wrap"} gap={1}>
                  <Tag variant="solid">
                    <TagLabel>{props.item.property_type}</TagLabel>
                  </Tag>
                  <Tag variant="solid">
                    <TagLabel>{props.item.room_type}</TagLabel>
                  </Tag>
                  <Tag variant="solid">
                    <TagLabel>{props.item.bedrooms}</TagLabel>
                    <Icon as={FaBed} ml={2}></Icon>
                  </Tag>
                </Flex>
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Box>
      </Portal>
    </Popover>
  );
};

export default BedroomMarker;
