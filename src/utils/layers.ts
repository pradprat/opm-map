export const getZipLayer = ({ numBedroom, min, max }: any) => {
  return {
    id: "zip",
    type: "fill",
    source: "zip",
    layout: {},
    paint: {
      "fill-color": [
        "interpolate",
        ["exponential", 1],
        ["get", "num_avg__" + numBedroom],
        min / 2,
        "white",

        max,
        "green",
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
    id: "zip-border",
    type: "line",
    source: "zip",
    layout: {},
    paint: {
      "line-color": "#ADADAD",
      "line-width": 1,
    },
  };
};
export const getZipLabelLayer = ({ numBedroom }: any) => {
  return {
    id: "zip-labels",
    type: "symbol",
    source: "zip-label",
    layout: {
      "text-field": [
        "format",
        ["get", "zipcode"],
        { "font-scale": 1.2 },
        "\n",
        {},
        ["get", "avg__" + numBedroom],
        {
          "font-scale": 0.8,
        },
      ],
      "text-variable-anchor": ["top", "bottom", "left", "right"],
      "text-radial-offset": 0.5,
      "text-justify": "auto",
      "icon-image": ["get", "icon"],
    },
  };
};
