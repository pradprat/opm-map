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
  Icon,
  Image,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import logo from "../assets/imgs/logo-small.svg";
import { FaChartLine, FaMap, FaMapPin } from "react-icons/fa";

interface Props {}
const Sidebar = (props: Props) => {
  return (
    <VStack alignItems={"start"} w={"full"}>
      <Box px={16} py={8}>
        <Image src={logo.toString()}></Image>
      </Box>
      <VStack alignItems={"start"} w={"full"}>
        <Accordion allowToggle w={"full"} defaultIndex={[0]} allowMultiple>
          <AccordionItem border={"none"}>
            <AccordionButton>
              <Button variant={"unstyled"} w={"full"} textAlign={"left"}>
                Main App
              </Button>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel
              px={4}
              py={2}
              background={"#F6F6F4"}
              gap={4}
              display={"flex"}
              flexDir={"column"}
            >
              <Button
                variant={"ghost"}
                w={"full"}
                justifyContent={"start"}
                leftIcon={<Icon as={FaMapPin}></Icon>}
              >
                Map
              </Button>
              <Button
                variant={"ghost"}
                w={"full"}
                justifyContent={"start"}
                leftIcon={<Icon as={FaChartLine}></Icon>}
              >
                Charts
              </Button>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
    </VStack>
  );
};

export default Sidebar;
