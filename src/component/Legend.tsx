import { Box, Heading } from "@chakra-ui/react";
import React from "react";

interface Props {
  colors: string[];
  min: number;
  max: number;
}
const Legends = (props: Props) => {
  const { colors, min, max } = props;
  const range = max - min;
  const step = range / colors.length;
  const legend = colors.map((color, index) => {
    const start = min + step * index;
    const end = start + step;
    return (
      <Box key={index}>
        <Box
          display={"inline-block"}
          width={"20px"}
          height={"20px"}
          backgroundColor={color}
        />
        <Box display={"inline-block"} ml={2}>
          ${Math.floor(start)} - ${Math.floor(end)}
        </Box>
      </Box>
    );
  });
  return (
    <Box
      position={"absolute"}
      right={0}
      bottom={0}
      m={8}
      p={4}
      background={"white"}
      borderRadius={"lg"}
      shadow={"lg"}
    >
      <Heading size={"md"} mb={4}>
        Legend
      </Heading>
      {legend}
    </Box>
  );
};

export default Legends;
