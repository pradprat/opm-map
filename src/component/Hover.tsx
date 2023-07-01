import { Box, Heading } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useMap } from "react-map-gl";

interface Props {
  layerId: string;
  sourceId: string;
}

const Hover = (props: Props) => {
  let hoveredPolygonId: any = null;
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
    map?.on("mouseleave", props.layerId, (e: any) => {
      map.setFeatureState(
        { source: props.sourceId, id: hoveredPolygonId },
        { hover: false }
      );
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
      map?.off("mouseleave", props.layerId, (e: any) => {
        map.setFeatureState(
          { source: props.sourceId, id: hoveredPolygonId },
          { hover: false }
        );
      });
    };
  }, []);

  return <></>;
};

export default Hover;
