import { Box, Heading } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { Layer, LayerProps, Source, useMap } from "react-map-gl";
import Hover from "./Hover";
import Click from "./Click";
import { Feature, FeatureCollection, Geometry, Properties } from "@turf/turf";

interface Props {
  id: string;
  onClick?: (e: any) => void;
  onHover?: (e: any) => void;
  hoverEffect?: boolean;
  layerProps?: LayerProps | any;
  geojson?:
    | string
    | Geometry
    | Feature<Geometry, Properties>
    | FeatureCollection<Geometry, Properties>
    | any;
}

const ComposedLayer = (props: Props) => {
  return (
    <Source id={props.id} type="geojson" data={props.geojson || ""}>
      {props.layerProps && <Layer {...props.layerProps}></Layer>}
      {props.hoverEffect && <Hover sourceId={props.id} layerId={props.id}></Hover>}
      {props.onClick && (
        <Click
          sourceId={props.id}
          layerId={props.id}
          onClick={props.onClick}
        ></Click>
      )}
    </Source>
  );
};

export default ComposedLayer;
