import { useEffect } from "react";
import type { HeadFC, PageProps } from "gatsby";
import mapboxgl from "mapbox-gl";
import React from "react";

const IndexPage: React.FC<PageProps> = () => {
  mapboxgl.accessToken = "pk.eyJ1IjoicHJhZHByYXQiLCJhIjoiY2tnMHhwbXZvMDc4eDJ1cXd1ZmFueHk5YiJ9.wfhci5Mpn6cahjx3GnOfYQ";
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: "mapbox", // container ID
      style: "mapbox://styles/mapbox/streets-v12", // style URL
      center: [-74.5, 40], // starting position [lng, lat]
      zoom: 9, // starting zoom
    });
  
    return () => {
    }
  }, [])
  
  return (
    <div>
      <div style={{ width: "100%", height: "100vh" }} id="mapbox"></div>
    </div>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Home Page</title>;
