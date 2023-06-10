import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  ButtonProps,
  Heading,
  Image,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import logo from "../assets/imgs/logo.svg";

interface Props {}
const Sidebar = (props: Props) => {
  return (
    <VStack alignItems={"start"} w={"full"}>
      <Heading size={"sm"}>
        <Image src={logo}></Image>
      </Heading>
      <VStack alignItems={"start"} w={"full"}>
        <Accordion allowToggle>
          <AccordionItem>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                Section 1 title
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
    </VStack>
  );
};

export default Sidebar;
