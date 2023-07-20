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
// import logo from "../assets/imgs/logo-small.svg";
import { FaChartLine, FaMap, FaMapPin } from "react-icons/fa";

interface Props {}
const Sidebar = (props: Props) => {
  return (
    <VStack alignItems={"start"} w={"full"}>
      <Box px={8} py={8}>
        <Image
          src={
            // "https://ik.imagekit.io/nantidatangcdn/locationlab/logo-small_qzZ3clHsz.svg"
            "https://ik.imagekit.io/nantidatangcdn/locationlab/logo-white_sUmKbA0uO.svg"
          }
        ></Image>
      </Box>
      <VStack alignItems={"start"} w={"full"}>
        <Accordion w={"full"} defaultIndex={[0]} allowMultiple>
          <AccordionItem border={"none"}>
            <AccordionButton>
              <Button variant={"unstyled"} w={"full"} textAlign={"left"}>
                Phoenix
              </Button>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel
              px={4}
              py={2}
              gap={4}
              display={"flex"}
              flexDir={"column"}
              background={"#0F0019"}
            >
              <Button
                variant={"ghost"}
                w={"full"}
                justifyContent={"start"}
                leftIcon={<Icon as={FaMapPin}></Icon>}
                color={"white"}
                background={"#0F0019"}
                _hover={{ background: "#0F0019" }}
              >
                Map
              </Button>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
    </VStack>
  );
};

export default Sidebar;
