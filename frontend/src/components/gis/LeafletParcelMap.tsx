"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GisGeoJsonFeatureCollection, GisGeoJsonFeature } from "@/lib/types/parcel";
import {
  MapPin,
  Layers,
  ExternalLink,
  ShieldAlert,
  Search,
  Maximize2,
  Minimize2,
  Eye,
  CheckCircle2,
  Navigation,
  Globe,
  Map as MapIcon,
  Compass,
} from "lucide-react";

export interface LeafletParcelMapProps {
  geojsonData?: GisGeoJsonFeatureCollection;
  geoJson?: GisGeoJsonFeatureCollection;
  selectedParcelId?: string;
  onSelectParcel?: (parcelId: string) => void;
  onParcelClick?: (parcelId: string) => void;
  height?: string;
  title?: string;
  showControls?: boolean;
}

// Built-in benchmark fallback GIS data (Rajasthan Jaipur-Kotputli corridor)
const DEFAULT_FALLBACK_GIS: GisGeoJsonFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "PCL-RJ-JAI-001",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.7860, 26.9115],
            [75.7885, 26.9115],
            [75.7885, 26.9135],
            [75.7860, 26.9135],
            [75.7860, 26.9115],
          ],
        ],
      },
      properties: {
        parcel_id: "PCL-RJ-JAI-001",
        khasra_number: "142/1",
        khata_number: "58",
        village_name: "Sundarpura",
        total_area_acres: 3.45,
        acquired_area_acres: 3.45,
        land_type: "AGRICULTURAL_IRRIGATED",
        acquisition_status: "ACQUIRED",
        status_label: "Acquired / Disbursed",
        verification_status: "VERIFIED",
        is_disputed: false,
        centroid: [75.7873, 26.9124],
        current_stage: "SECTION_38",
        fillColor: "#138808",
        color: "#0a5c04",
        fillOpacity: 0.65,
        weight: 2,
      },
    },
    {
      type: "Feature",
      id: "PCL-RJ-JAI-002",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.7885, 26.9135],
            [75.7910, 26.9135],
            [75.7910, 26.9155],
            [75.7885, 26.9155],
            [75.7885, 26.9135],
          ],
        ],
      },
      properties: {
        parcel_id: "PCL-RJ-JAI-002",
        khasra_number: "142/2",
        khata_number: "58",
        village_name: "Sundarpura",
        total_area_acres: 2.80,
        acquired_area_acres: 2.80,
        land_type: "AGRICULTURAL_UNIRRIGATED",
        acquisition_status: "SECTION_11_NOTIFIED",
        status_label: "Sec 11 Notified",
        verification_status: "VERIFIED",
        is_disputed: false,
        centroid: [75.7892, 26.9145],
        current_stage: "SECTION_11",
        fillColor: "#10b981",
        color: "#059669",
        fillOpacity: 0.65,
        weight: 2,
      },
    },
    {
      type: "Feature",
      id: "PCL-RJ-JAI-003",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.7910, 26.9155],
            [75.7935, 26.9155],
            [75.7935, 26.9175],
            [75.7910, 26.9175],
            [75.7910, 26.9155],
          ],
        ],
      },
      properties: {
        parcel_id: "PCL-RJ-JAI-003",
        khasra_number: "143/A",
        khata_number: "62",
        village_name: "Sundarpura",
        total_area_acres: 4.10,
        acquired_area_acres: 0.0,
        land_type: "RESIDENTIAL_COMMERCIAL",
        acquisition_status: "DISPUTED",
        status_label: "Disputed / Court Stay",
        verification_status: "SURVEYED",
        is_disputed: true,
        centroid: [75.7922, 26.9165],
        current_stage: "SECTION_15",
        fillColor: "#ef4444",
        color: "#b91c1c",
        fillOpacity: 0.7,
        weight: 2,
      },
    },
    {
      type: "Feature",
      id: "PCL-RJ-JAI-004",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.7860, 26.9135],
            [75.7885, 26.9135],
            [75.7885, 26.9155],
            [75.7860, 26.9155],
            [75.7860, 26.9135],
          ],
        ],
      },
      properties: {
        parcel_id: "PCL-RJ-JAI-004",
        khasra_number: "144/B",
        khata_number: "71",
        village_name: "Sundarpura",
        total_area_acres: 1.95,
        acquired_area_acres: 1.00,
        land_type: "AGRICULTURAL_IRRIGATED",
        acquisition_status: "VERIFICATION_PENDING",
        status_label: "Under Ground Survey",
        verification_status: "IN_PROGRESS",
        is_disputed: false,
        centroid: [75.7872, 26.9145],
        current_stage: "GROUND_SURVEY",
        fillColor: "#f59e0b",
        color: "#d97706",
        fillOpacity: 0.65,
        weight: 2,
      },
    },
  ],
  metadata: {
    total_parcels: 4,
    center: [26.9135, 75.7895],
  },
};

type BaseMapType = "STREET" | "SATELLITE" | "TOPO";

export function LeafletParcelMap({
  geojsonData,
  geoJson,
  selectedParcelId,
  onSelectParcel,
  onParcelClick,
  height = "460px",
  title,
  showControls = true,
}: LeafletParcelMapProps) {
  const rawData = geojsonData || geoJson;
  const effectiveData =
    rawData && rawData.features && rawData.features.length > 0
      ? rawData
      : DEFAULT_FALLBACK_GIS;

  const effectiveSelect = onSelectParcel || onParcelClick;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const geojsonLayerRef = useRef<any>(null);
  const baseTileLayerRef = useRef<any>(null);

  const [activeBaseMap, setActiveBaseMap] = useState<BaseMapType>("STREET");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchKhasra, setSearchKhasra] = useState<string>("");
  const [activeParcelPopup, setActiveParcelPopup] = useState<any>(null);

  // Initialize Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    const L = require("leaflet");

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    if (!mapInstanceRef.current) {
      const center = effectiveData?.metadata?.center || [26.9135, 75.7895];
      const map = L.map(mapContainerRef.current, {
        center,
        zoom: 15,
        zoomControl: false,
        scrollWheelZoom: true,
      });

      // Add Zoom Control top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Base tile layer
      const streetLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | NLAMS GIS Engine',
          maxZoom: 19,
        }
      ).addTo(map);

      baseTileLayerRef.current = streetLayer;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Filter features
    const filteredFeatures = effectiveData.features.filter((f) => {
      const p = f.properties || {};
      if (statusFilter === "ACQUIRED" && p.acquisition_status !== "ACQUIRED") return false;
      if (statusFilter === "NOTIFIED" && p.acquisition_status !== "SECTION_11_NOTIFIED") return false;
      if (statusFilter === "DISPUTED" && !p.is_disputed) return false;
      if (statusFilter === "SURVEY" && p.acquisition_status !== "VERIFICATION_PENDING") return false;
      if (searchKhasra.trim() && !p.khasra_number?.toLowerCase().includes(searchKhasra.toLowerCase())) {
        return false;
      }
      return true;
    });

    // Remove existing GeoJSON layer
    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }

    if (filteredFeatures.length > 0) {
      const filteredGeoJson = {
        ...effectiveData,
        features: filteredFeatures,
      };

      const geojsonLayer = L.geoJSON(filteredGeoJson as any, {
        style: (feature: any) => {
          const props = feature.properties || {};
          const isSelected = selectedParcelId && props.parcel_id === selectedParcelId;

          return {
            fillColor: props.fillColor || (props.is_disputed ? "#ef4444" : props.acquisition_status === "ACQUIRED" ? "#138808" : "#10b981"),
            color: isSelected ? "#ffffff" : (props.color || "#0a5c04"),
            weight: isSelected ? 3.5 : 2,
            opacity: 1,
            fillOpacity: isSelected ? 0.85 : 0.6,
          };
        },
        onEachFeature: (feature: any, layer: any) => {
          const props = feature.properties || {};

          const popupContent = `
            <div style="font-family: inherit; min-width: 200px; padding: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
                <span style="font-weight: 800; font-size: 13px; color: #0f172a;">Khasra #${props.khasra_number}</span>
                <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;">
                  ${props.village_name || "Village"}
                </span>
              </div>
              <div style="font-size: 11px; color: #475569; line-height: 1.6; margin-bottom: 8px;">
                <div><strong>Total Area:</strong> ${props.total_area_acres} Acres</div>
                <div><strong>Acquired:</strong> ${props.acquired_area_acres || props.total_area_acres} Acres</div>
                <div><strong>Classification:</strong> ${props.land_type || "Chahi / Agricultural"}</div>
                <div><strong>Status:</strong> <span style="font-weight: 700; color: ${props.color || '#138808'};">${props.status_label || props.acquisition_status}</span></div>
                ${props.is_disputed ? '<div style="color: #b91c1c; font-weight: 700; margin-top: 2px;">⚠️ Title Disputed</div>' : ''}
              </div>
              <a href="/land-parcels/${props.parcel_id}" style="display: block; text-align: center; background: #138808; color: #ffffff; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-decoration: none;">
                Inspect Khasra 360° →
              </a>
            </div>
          `;

          layer.bindPopup(popupContent);

          layer.on({
            click: () => {
              setActiveParcelPopup(props);
              if (effectiveSelect && props.parcel_id) {
                effectiveSelect(props.parcel_id);
              }
            },
            mouseover: (e: any) => {
              const l = e.target;
              l.setStyle({ weight: 3.5, fillOpacity: 0.85 });
            },
            mouseout: (e: any) => {
              geojsonLayer.resetStyle(e.target);
            },
          });
        },
      }).addTo(map);

      geojsonLayerRef.current = geojsonLayer;

      const bounds = geojsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [35, 35] });
      }
    }

    return () => {
      // do not remove map on simple filter re-render
    };
  }, [effectiveData, selectedParcelId, effectiveSelect, statusFilter, searchKhasra]);

  // Handle basemap switch
  const switchBaseMap = (type: BaseMapType) => {
    if (!mapInstanceRef.current) return;
    const L = require("leaflet");
    const map = mapInstanceRef.current;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }

    let tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    let attr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

    if (type === "SATELLITE") {
      tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attr = "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";
    } else if (type === "TOPO") {
      tileUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
      attr = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>';
    }

    const newLayer = L.tileLayer(tileUrl, { attribution: attr, maxZoom: 19 }).addTo(map);
    baseTileLayerRef.current = newLayer;
    setActiveBaseMap(type);
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current && geojsonLayerRef.current) {
      const bounds = geojsonLayerRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [35, 35] });
      }
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
      {/* Top Header & Interactive Ribbon */}
      {showControls && (
        <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Left: Layer Badge & Search */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 text-xs">
              <Layers className="h-4 w-4 text-[#138808]" />
              <span className="font-bold text-slate-800">
                {title || "Cadastral Layer"}: {effectiveData?.features?.length || 0} Parcels
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-[10px] text-slate-500 font-mono">EPSG:4326 PostGIS</span>
            </div>

            {/* Quick Search */}
            <div className="relative hidden sm:block">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Khasra (e.g. 142/1)..."
                value={searchKhasra}
                onChange={(e) => setSearchKhasra(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 text-xs text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#138808]"
              />
            </div>
          </div>

          {/* Right: Basemap Switcher & Recenter */}
          <div className="flex items-center gap-1.5 pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200 p-1 rounded-lg shadow-sm text-xs">
            <button
              type="button"
              onClick={() => switchBaseMap("STREET")}
              className={`px-2 py-1 rounded font-semibold text-[11px] transition-colors ${
                activeBaseMap === "STREET" ? "bg-[#138808] text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Street
            </button>
            <button
              type="button"
              onClick={() => switchBaseMap("SATELLITE")}
              className={`px-2 py-1 rounded font-semibold text-[11px] transition-colors ${
                activeBaseMap === "SATELLITE" ? "bg-[#138808] text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => switchBaseMap("TOPO")}
              className={`px-2 py-1 rounded font-semibold text-[11px] transition-colors ${
                activeBaseMap === "TOPO" ? "bg-[#138808] text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Topo
            </button>
            <button
              type="button"
              onClick={handleRecenter}
              className="p-1 rounded text-slate-600 hover:bg-slate-100 border-l border-slate-200 pl-1.5 ml-0.5"
              title="Fit to project corridor bounds"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Map Canvas */}
      <div ref={mapContainerRef} style={{ height, width: "100%" }} />

      {/* Bottom Status Filter & Legend */}
      <div className="absolute bottom-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Filter Pills */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200 p-1 rounded-lg shadow-md flex items-center gap-1 text-[11px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Filter:</span>
          {[
            { id: "ALL", label: "All Parcels" },
            { id: "ACQUIRED", label: "Acquired" },
            { id: "NOTIFIED", label: "Notified" },
            { id: "SURVEY", label: "Surveyed" },
            { id: "DISPUTED", label: "Disputed" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`px-2.5 py-0.5 rounded font-bold transition-all ${
                statusFilter === f.id
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-lg shadow-md flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#138808]" />
            <span className="text-slate-700 font-semibold">Acquired</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#10b981]" />
            <span className="text-slate-700 font-semibold">Notified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#f59e0b]" />
            <span className="text-slate-700 font-semibold">Survey Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#ef4444]" />
            <span className="text-rose-700 font-bold">Disputed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

