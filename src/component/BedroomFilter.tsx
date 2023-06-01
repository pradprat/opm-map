import { Box, Heading } from "@chakra-ui/react";
import React from "react";

interface Props {
  colors: string[];
  min: number;
  max: number;
}
const Legends = (props: Props) => {
  return (
    <Box
      position={"absolute"}
      right={0}
      bottom={0}
      m={4}
      p={4}
      background={"white"}
      borderRadius={"lg"}
      shadow={"lg"}
    ></Box>
  );
};

export default Legends;
