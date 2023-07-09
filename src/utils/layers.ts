import { COLOR_SCENE } from "../constant";
export const getGeneralLayer = () => {
  return {
    type: "fill",
    layout: {},
    paint: {
      "fill-color": COLOR_SCENE[0],
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1,
        0.5,
      ],
    },
  };
};
export const getZipLayer = ({ numBedroom, min, max }: any) => {
  return {
    type: "fill",
    layout: {},
    paint: {
      "fill-color": [
        "interpolate",
        ["exponential", 1],
        ["get", "totalCount"],
        0,
        "gray",
        1,
        COLOR_SCENE[0],
      ],
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1,
        0.5,
      ],
    },
  };
};
export const getZipBorderLayer = () => {
  return {
    type: "line",
    layout: {},
    paint: {
      "line-color": "#ADADAD",
      "line-width": 1,
    },
  };
};
export const getZipLabelLayer = ({ numBedroom }: any) => {
  const bedroomRevenueTextConfig: any[] = [];

  if (numBedroom.length === 1) {
    bedroomRevenueTextConfig.push(["get", "avg__" + numBedroom[0]]);
    bedroomRevenueTextConfig.push({
      "font-scale": 1.2,
    });
  } else {
    numBedroom.forEach((bedroom: any, index: number) => {
      bedroomRevenueTextConfig.push(`${bedroom} Bedroom - `);
      bedroomRevenueTextConfig.push({
        // "text-color": COLOR_SCENE[index],
      });
      bedroomRevenueTextConfig.push(["get", "avg__" + bedroom]);
      bedroomRevenueTextConfig.push({
        "font-scale": 1.2,
        // "text-color": COLOR_SCENE[index],
      });
      bedroomRevenueTextConfig.push("\n");
      bedroomRevenueTextConfig.push({});
    });
  }

  return {
    type: "symbol",
    layout: {
      "text-field": [
        "format",
        ["get", "zipcode"],
        { "font-scale": 1.2 },
        "\n",
        {},
        ...bedroomRevenueTextConfig,
      ],
      "text-variable-anchor": ["top", "bottom", "left", "right"],
      "text-radial-offset": 0.5,
      "text-justify": "auto",
      "icon-image": ["get", "icon"],
    },
  };
};
