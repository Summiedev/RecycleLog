import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import leaflet from "leaflet";
import { Trash2, AlertTriangle, AlertCircle, Trash } from "lucide-react";
import { renderToString } from "react-dom/server";

// Fix for default markers
delete leaflet.Icon.Default.prototype._getIconUrl;
leaflet.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LagosBounds = [
  [6.2, 2.8], // Southwest
  [6.8, 4.0], // Northeast
];

// Create dynamic bin icon with Lucide icons
const createBinIcon = (fillPercent) => {
  let color = "#10b981"; // Green (empty/low)
  let IconComponent = Trash;

  if (fillPercent >= 80) {
    color = "#ef4444"; // Red (critical)
    IconComponent = AlertCircle;
  } else if (fillPercent >= 60) {
    color = "#f59e0b"; // Amber (high)
    IconComponent = AlertTriangle;
  } else if (fillPercent >= 40) {
    color = "#3b82f6"; // Blue (medium)
    IconComponent = Trash2;
  }

  // Convert React component to string
  const iconString = renderToString(
    <IconComponent size={16} color="white" strokeWidth={2.5} />
  );

  const svgIcon = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="${color}" stroke="#ffffff" stroke-width="2"/>
      <g transform="translate(12, 8)">
        ${iconString}
      </g>
      <text x="20" y="32" text-anchor="middle" font-size="8" fill="white" font-weight="bold">${fillPercent}%</text>
      ${
        fillPercent >= 80
          ? '<circle cx="32" cy="8" r="4" fill="#ff0000"><animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite"/></circle>'
          : ""
      }
    </svg>
  `;

  return new leaflet.DivIcon({
    html: svgIcon,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
    className: "custom-bin-icon",
  });
};

// CSS-based dynamic icon with Lucide icons
const createCSSBinIcon = (fillPercent) => {
  let statusClass = "bin-low";
  let statusColor = "#10b981";
  let IconComponent = Trash2;

  if (fillPercent >= 80) {
    statusClass = "bin-critical";
    statusColor = "#ef4444";
    IconComponent = AlertCircle;
  } else if (fillPercent >= 60) {
    statusClass = "bin-high";
    statusColor = "#f59e0b";
    IconComponent = AlertTriangle;
  } else if (fillPercent >= 40) {
    statusClass = "bin-medium";
    statusColor = "#3b82f6";
    IconComponent = Trash2;
  } else {
    IconComponent = Trash;
  }

  const iconString = renderToString(
    <IconComponent size={20} color="white" strokeWidth={2.5} />
  );

  const htmlIcon = `
    <div class="bin-marker ${statusClass}" style="background-color: ${statusColor}">
      <div class="bin-icon">${iconString}</div>
      <div class="bin-percentage">${fillPercent}%</div>
      ${fillPercent >= 80 ? '<div class="alert-dot"></div>' : ""}
    </div>
  `;

  return new leaflet.DivIcon({
    html: htmlIcon,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25],
    className: "custom-bin-marker",
  });
};

export default function BinMap({ bins }) {
  return (
    <>
      {/* Add CSS styles */}
      <style>{`
        .bin-marker {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .bin-marker:hover {
          transform: scale(1.15);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }

        .bin-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2px;
        }

        .bin-icon svg {
          filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.3));
        }

        .bin-percentage {
          font-size: 8px;
          font-weight: bold;
          color: white;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
          line-height: 1;
        }

        .alert-dot {
          position: absolute;
          top: -3px;
          right: -3px;
          width: 14px;
          height: 14px;
          background: linear-gradient(45deg, #ff0000, #ff4444);
          border-radius: 50%;
          border: 2px solid white;
          animation: pulse 2s infinite;
          box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
          }
          70% {
            transform: scale(1.1);
            box-shadow: 0 0 0 8px rgba(255, 0, 0, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
          }
        }

        .bin-critical {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        .bin-high {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }
        .bin-medium {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }
        .bin-low {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .custom-bin-icon {
          background: none !important;
          border: none !important;
        }
      `}</style>

      <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden shadow-lg border border-green-100">
        <MapContainer
          center={[6.5244, 3.3792]}
          zoom={13}
          minZoom={9.5}
          maxZoom={15}
          maxBounds={LagosBounds}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          className="rounded-lg"
        >
          <TileLayer
            url={`https://api.mapbox.com/styles/v1/mapbox/navigation-night-v1/tiles/{z}/{x}/{y}?access_token=${
              import.meta.env.VITE_MAPBOX_TOKEN
            }`}
            tileSize={512}
            zoomOffset={-1}
            keepBuffer={2}
          />

          {bins.map((bin) => (
            <Marker
              key={bin.bin_id}
              position={bin.location}
              icon={createCSSBinIcon(bin.bin_fill_percent)}
              eventHandlers={{
                click: () => {
                  console.log(`Clicked bin: ${bin.name}`);
                },
              }}
            >
              <Tooltip>
                <div className="font-outfit flex flex-col justify-center p-1">
                  <div className="flex items-center gap-2">
                    {bin.bin_fill_percent >= 80 ? (
                      <AlertCircle size={16} className="text-red-600" />
                    ) : bin.bin_fill_percent >= 60 ? (
                      <AlertTriangle size={16} className="text-yellow-600" />
                    ) : bin.bin_fill_percent >= 40 ? (
                      <Trash2 size={16} className="text-blue-600" />
                    ) : (
                      <Trash size={16} className="text-green-600" />
                    )}
                    <strong className="text-forest">{bin.ward}</strong>
                  </div>
                  <strong className="text-forest">{bin.name}</strong>
                  <span className="text-primary font-semibold text-md">
                    Fill Level: {bin.bin_fill_percent}%
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      bin.bin_fill_percent >= 80
                        ? "text-red-600"
                        : bin.bin_fill_percent >= 60
                        ? "text-yellow-600"
                        : bin.bin_fill_percent >= 40
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  >
                    Status:
                    {bin.bin_fill_percent >= 80
                      ? "🚨 Critical"
                      : bin.bin_fill_percent >= 60
                      ? "⚠️ High"
                      : bin.bin_fill_percent >= 40
                      ? "📦 Medium"
                      : "✅ Low"}
                  </span>
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </>
  );
}
