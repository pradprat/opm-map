import { Box, Heading } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useMap } from "react-map-gl";

interface Props {
  layerId: string;
  sourceId: string;
  onClick: (e: any) => void;
}
let hoveredPolygonId: any = null;

const Click = (props: Props) => {
  const { current: map } = useMap();
  useEffect(() => {
    map?.on("click", props.layerId, (e: any) => {
      props.onClick(e);
    });
    return () => {
      map?.off("click", props.layerId, (e: any) => {
        props.onClick(e);
      });
    };
  }, []);

  return <></>;
};

export default Click;
