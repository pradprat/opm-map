import { Box, Heading } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useMap } from "react-map-gl";

interface Props {
  layerId: string;
  sourceId: string;
}
let hoveredPolygonId: any = null;

const Hover = (props: Props) => {
  const { current: map } = useMap();
  useEffect(() => {
    map?.on("mousemove", props.layerId, (e: any) => {
      if (e.features.length > 0) {
        if (hoveredPolygonId !== null) {
          map.setFeatureState(
            { source: props.sourceId, id: hoveredPolygonId },
            { hover: false }
          );
        }
        hoveredPolygonId = e.features[0].id;
        if (hoveredPolygonId) {
          map.setFeatureState(
            { source: props.sourceId, id: hoveredPolygonId },
            { hover: true }
          );
        }
      }
    });

    return () => {
      map?.off("mousemove", props.layerId, (e: any) => {
        if (e.features.length > 0) {
          if (hoveredPolygonId !== null) {
            map.setFeatureState(
              { source: props.sourceId, id: hoveredPolygonId },
              { hover: false }
            );
          }
          hoveredPolygonId = e.features[0].id;
          if (hoveredPolygonId) {
            map.setFeatureState(
              { source: props.sourceId, id: hoveredPolygonId },
              { hover: true }
            );
          }
        }
      });
    };
  }, []);

  return <></>;
};

export default Hover;
