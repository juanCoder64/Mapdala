"use client";

import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

interface Props {
    routeCoords: [number, number][];
}

export default function Mapa({ routeCoords }: Props) {
    useEffect(() => {
        let map: L.Map | null = null;

        import("leaflet").then((L) => {
            if (!map) {
                map = L.map("map").setView([40.7128, -74.0060], 6);

                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: 19,
                    attribution: "© OpenStreetMap contributors",
                }).addTo(map);

                if (routeCoords && routeCoords.length > 0) {
                    const polyline = L.polyline(routeCoords, { color: "blue", weight: 4 }).addTo(map);
                    map.fitBounds(polyline.getBounds());
                }
            }
        });

        return () => {
            if (map) {
                map.remove(); // Clean up the map instance
                map = null;
            }
        };
    }, [routeCoords]);

    return <div id="map" className="w-full h-[80vh] rounded-lg shadow-md" />;
}