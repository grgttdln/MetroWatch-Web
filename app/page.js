"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { db, realtime } from "../utils/supabase/api";
import ReportsSidebar from "../components/ReportsSidebar";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});
const Tooltip = dynamic(() => import("react-leaflet").then((m) => m.Tooltip), {
  ssr: false,
});

let leafletLoaded = false;

export default function HomePage() {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState("connecting");
  const [leafletReady, setLeafletReady] = useState(false);
  const [severityIcons, setSeverityIcons] = useState({});
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await db.select(
          "reports",
          "report_id, latitude, longitude, severity, category, description, date, time, location, url, user_id, upvote, status, users(name)"
        );
        if (error) {
          console.error("Database error:", error);
          setStatus("error");
          return;
        }
        console.log("Fetched reports:", data);
        setReports(Array.isArray(data) ? data : []);
        setStatus("connected");
      } catch (err) {
        console.error("Fetch error:", err);
        setStatus("error");
      }
    })();
  }, []);

  useEffect(() => {
    const channel = realtime.subscribe("reports", (payload) => {
      setReports((prev) => {
        const { eventType, new: newRow, old: oldRow } = payload;
        if (eventType === "INSERT") return [...prev, newRow];
        if (eventType === "UPDATE")
          return prev.map((r) =>
            r.report_id === newRow.report_id ? newRow : r
          );
        if (eventType === "DELETE")
          return prev.filter((r) => r.report_id !== oldRow.report_id);
        return prev;
      });
    });
    return () => realtime.unsubscribe(channel);
  }, []);

  useEffect(() => {
    if (leafletLoaded) {
      setLeafletReady(true);
      return;
    }
    let canceled = false;

    const loadLeaflet = async () => {
      try {
        const mod = await import("leaflet");
        if (canceled) return;

        const L = mod.default;

        if (
          typeof window !== "undefined" &&
          !document.querySelector('link[href*="leaflet.css"]')
        ) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        const makeDivIcon = (bg) =>
          L.divIcon({
            className: "severity-icon",
            html: `<div style=\"background:${bg};border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.25);width:16px;height:16px;border-radius:50%;\"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });

        setSeverityIcons({
          high: makeDivIcon("#e53935"),
          medium: makeDivIcon("#fb8c00"),
          low: makeDivIcon("#1e88e5"),
          default: makeDivIcon("#607d8b"),
        });

        leafletLoaded = true;

        setTimeout(() => {
          if (!canceled) {
            setLeafletReady(true);
          }
        }, 100);
      } catch (error) {
        console.error("Failed to load Leaflet:", error);
        if (!canceled) {
          setStatus("error");
        }
      }
    };

    loadLeaflet();

    return () => {
      canceled = true;
    };
  }, []);

  const bounds = useMemo(() => {
    const pts = reports
      .map((r) => [parseFloat(r.latitude), parseFloat(r.longitude)])
      .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));
    return pts.length ? pts : null;
  }, [reports]);

  useEffect(() => {
    if (mapRef.current && bounds) {
      mapRef.current.fitBounds(bounds, { padding: [24, 24] });
    }
  }, [bounds]);

  const categories = {
    Garbage: "🗑️",
    Traffic: "🚦",
    Flooding: "🌊",
    Vandalism: "⚠️",
    "Noise Pollution": "🔊",
    "Road Damage": "🕳️",
    "Illegal Parking": "🚗",
    "Street Lighting": "💡",
    "Stray Animals": "🐶",
    Others: "📋",
  };

  const formatDateTime = (date, time) => {
    try {
      if (!date) return "";
      const dateTime = time ? `${date}T${time}` : date;
      const d = new Date(dateTime);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: time ? "numeric" : undefined,
        minute: time ? "2-digit" : undefined,
        hour12: true,
      }).format(d);
    } catch {
      return date || "";
    }
  };

  const handleMapNavigation = (coordinates, zoom = 15) => {
    if (mapRef.current && coordinates) {
      mapRef.current.setView(coordinates, zoom);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen overflow-hidden bg-gray-50">
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="lg:hidden fixed top-4 left-4 z-[1001] bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg p-2 shadow-lg"
      >
        <svg
          className="w-5 h-5 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {showSidebar ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      <div
        className={`relative flex-1 ${
          showSidebar ? "hidden lg:block" : "block"
        } lg:min-h-full border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-100`}
      >
        {leafletReady && (
          <MapContainer
            key="metro-watch-map"
            center={[14.5995, 120.9842]}
            zoom={12}
            className="w-full h-full z-10"
            whenReady={(mapInstance) => {
              const leafletMap = mapInstance.target;
              mapRef.current = leafletMap;
              if (bounds) {
                setTimeout(() => {
                  leafletMap.fitBounds(bounds, { padding: [24, 24] });
                }, 100);
              }
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {reports
              .filter(
                (r) =>
                  !isNaN(parseFloat(r.latitude)) &&
                  !isNaN(parseFloat(r.longitude))
              )
              .map((r, idx) => (
                <Marker
                  key={`${r.report_id}-${idx}`}
                  position={[parseFloat(r.latitude), parseFloat(r.longitude)]}
                  icon={
                    severityIcons[(r.severity || "").toLowerCase()] ||
                    severityIcons.default
                  }
                >
                  <Tooltip direction="top" opacity={1} offset={[0, -4]}>
                    <div className="text-xs">
                      <div className="font-semibold">
                        {r.description || r.location || "Report"}
                      </div>
                      <div>{r.severity || "Unknown"}</div>
                    </div>
                  </Tooltip>
                  <Popup>
                    <div className="max-w-56">
                      {r.url && (
                        <img
                          src={r.url}
                          alt="report"
                          className="w-full h-30 object-cover rounded-md mb-2"
                        />
                      )}
                      <h3 className="text-sm font-semibold mb-1 text-gray-900">
                        {r.description || r.location || "Report"}
                      </h3>
                      <p className="text-xs text-gray-600 mb-1">
                        {formatDateTime(r.date, r.time)}
                      </p>
                      <p className="text-xs text-gray-600 mb-1">
                        Category: {r.category || "N/A"}
                      </p>
                      <p className="text-xs text-gray-600 mb-1">
                        Severity: {r.severity || "N/A"}
                      </p>
                      <p className="text-xs text-gray-600 mb-3">
                        Upvotes: {r.upvote || 0}
                      </p>
                      <button
                        onClick={() => {
                          setSelectedReport(r);
                          setShowSidebar(true);
                        }}
                        className="inline-block px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        )}

        {/* Floating Legend */}
        {leafletReady && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/20 z-[1000] min-w-36 max-w-44">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 min-h-4">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 border border-white/80 shadow-sm flex-shrink-0"></div>
                <span className="text-sm font-medium text-gray-700">High</span>
              </div>
              <div className="flex items-center gap-2 min-h-4">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 border border-white/80 shadow-sm flex-shrink-0"></div>
                <span className="text-sm font-medium text-gray-700">
                  Medium
                </span>
              </div>
              <div className="flex items-center gap-2 min-h-4">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 border border-white/80 shadow-sm flex-shrink-0"></div>
                <span className="text-sm font-medium text-gray-700">Low</span>
              </div>
            </div>
          </div>
        )}

        {!leafletReady && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-600 bg-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Loading map...
            </div>
          </div>
        )}
      </div>

      <div
        className={`${
          showSidebar ? "block" : "hidden lg:block"
        } lg:max-w-2xl w-full`}
      >
        <ReportsSidebar
          reports={reports}
          status={status}
          selectedReport={selectedReport}
          onSelectReport={setSelectedReport}
          onMapNavigation={handleMapNavigation}
        />
      </div>
    </div>
  );
}
