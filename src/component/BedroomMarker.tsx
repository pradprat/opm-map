import {
  Box,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Image,
  Link,
  Tag,
  TagLabel,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { BiLinkExternal } from "react-icons/bi";
import { FaBed } from "react-icons/fa";
import { Popup } from "react-map-gl";
import "./BedroomMarker.css";
import { COLOR_SCENE } from "../constant";

interface Props {
  item: any;
  refreshValue?: any;
}

const BedroomMarker = (props: Props) => {
  const [isFocus, setisFocus] = useState(true);
  const [isOpen, setisOpen] = useState(false);
  return (
    <>
      <Box
        w={8}
        h={8}
        borderRadius={"full"}
        shadow={"lg"}
        background={COLOR_SCENE[Number(props.item.bedrooms) - 1]}
        _hover={{ transform: "scale(1.2)", cursor: "pointer" }}
        transition={"all 0.1s"}
        border={"4px solid white"}
        position={"relative"}
        onClick={() => setisOpen(!isOpen)}
      ></Box>
      {isOpen && (
        <Popup
          longitude={props.item.longitude}
          latitude={props.item.latitude}
          anchor="bottom"
          closeButton={false}
          closeOnClick={false}
          offset={32}
          className="bedroom-popup"
        >
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
                <Link href={props.item["Airbnb Link"]} target="none">
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
        </Popup>
      )}
    </>
  );
};

export default BedroomMarker;
