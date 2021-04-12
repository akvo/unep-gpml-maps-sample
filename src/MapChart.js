import { useState } from "react";
import {
  ZoomableGroup,
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { scaleQuantize } from "d3-scale";
import landing from "./landing.json";

const geoUrl = "http://localhost:3000/unep-map.topo.json";

const MapChart = ({ setTooltipContent }) => {
  const [selected, setSelected] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [topic, setTopic] = useState("project");

  const domain = landing.map.reduce(
    (acc, curr) => {
      const v = curr[topic];
      const [min, max] = acc;
      return [min, v > max ? v : max];
    },
    [0, 0]
  );

  const colorScale = scaleQuantize()
    .domain(domain)
    .range([
      "#bbedda",
      "#a7e1cb",
      "#92d5bd",
      "#7dcaaf",
      "#67bea1" /*
      "#50b293",
      "#35a785",
      "#039B78",*/,
    ]);

  const fillColor = (v) => {
    return v === 0 ? "#fff" : colorScale(v);
  };

  console.log(colorScale.thresholds());

  return (
    <div>
      <div>
        {["project", "technology", "policy", "action_plan", "event"]
          .sort()
          .map((topic) => (
            <button
              key={topic + "btn"}
              onClick={() => {
                setTopic(topic);
              }}
            >
              {topic}
            </button>
          ))}
      </div>
      <button
        onClick={() => {
          setZoom(zoom + 0.5);
        }}
      >
        +
      </button>
      <button
        onClick={() => {
          setZoom(zoom - 0.5);
        }}
      >
        -
      </button>
      <ComposableMap
        data-tip=""
        projectionConfig={{ scale: 100 }}
        projection="geoEquirectangular"
        className="map"
      >
        <ZoomableGroup zoom={zoom}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const curr = landing.map.find(
                  (i) => i.iso_code === geo.properties.ISO3CD
                );

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    stroke="#79B0CC"
                    strokeWidth="0.2"
                    strokeOpacity="0.5"
                    cursor="pointer"
                    fill={
                      selected
                        ? geo.properties.MAPCLR === selected
                          ? "#84b4cc"
                          : fillColor(curr ? curr[topic] : 0)
                        : fillColor(curr ? curr[topic] : 0)
                    }
                    onMouseEnter={() => {
                      const { MAPLAB, MAPCLR } = geo.properties;
                      setSelected(MAPCLR);
                      setTooltipContent(`${MAPLAB} ${curr ? curr[topic] : ""}`);
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                      setSelected(null);
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};
export default MapChart;
