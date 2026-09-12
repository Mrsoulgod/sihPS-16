"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { GisGeoJsonFeatureCollection, GisGeoJsonFeature } from "@/lib/types/parcel";
import { GIS_NH48_PKG4 } from "@/lib/data/gis_datasets";
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
  Ruler,
  Square,
  Trash2,
  Download,
  Share2,
  ChevronRight,
  X,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  BadgeCheck,
  Trees,
  Home,
  Droplet,
  Info,
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
  enableDrawer?: boolean;
}

export const DEFAULT_FALLBACK_GIS = GIS_NH48_PKG4;

type BaseMapType = "STREET" | "SATELLITE" | "TOPO" | "DARK";
type MeasureMode = "NONE" | "DISTANCE" | "AREA";

export function LeafletParcelMap({
  geojsonData,
  geoJson,
  selectedParcelId,
  onSelectParcel,
  onParcelClick,
  height = "600px",
  title,
  showControls = true,
  enableDrawer = true,
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
  const measureLayerGroupRef = useRef<any>(null);

  // UI State - Default to SATELLITE view as requested
  const [activeBaseMap, setActiveBaseMap] = useState<BaseMapType>("SATELLITE");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchKhasra, setSearchKhasra] = useState<string>("");
  const [selectedParcel, setSelectedParcel] = useState<any>(null);
  const [copiedUlpin, setCopiedUlpin] = useState<boolean>(false);

  // Layer Toggles
  const [layerVisibility, setLayerVisibility] = useState({
    parcels: true,
    rowCenterline: true,
    rowBuffer: true,
    villageBounds: true,
    ecoSensitive: true,
  });
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);

  // Measurement State
  const [measureMode, setMeasureMode] = useState<MeasureMode>("NONE");
  const [measurePoints, setMeasurePoints] = useState<Array<[number, number]>>([]);
  const [measuredResult, setMeasuredResult] = useState<{
    distanceMeters?: number;
    distanceKm?: string;
    areaSqm?: number;
    areaAcres?: string;
    areaHectares?: string;
    areaBighas?: string;
  } | null>(null);

  // Cursor Coordinates
  const [cursorCoords, setCursorCoords] = useState<{
    lat: number;
    lng: number;
    easting?: number;
    northing?: number;
  } | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(15);

  // Geodesic distance calculation helper
  const calculateDistance = (p1: [number, number], p2: [number, number]): number => {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (p1[0] * Math.PI) / 180;
    const phi2 = (p2[0] * Math.PI) / 180;
    const deltaPhi = ((p2[0] - p1[0]) * Math.PI) / 180;
    const deltaLambda = ((p2[1] - p1[1]) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Spherical polygon area calculation helper (Shoelace on equirectangular projection)
  const calculatePolygonArea = (points: Array<[number, number]>): number => {
    if (points.length < 3) return 0;
    const R = 6378137; // meters
    let totalArea = 0;
    const len = points.length;

    for (let i = 0; i < len; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % len];
      const radP1Lat = (p1[0] * Math.PI) / 180;
      const radP2Lat = (p2[0] * Math.PI) / 180;
      const radP1Lng = (p1[1] * Math.PI) / 180;
      const radP2Lng = (p2[1] * Math.PI) / 180;

      totalArea += (radP2Lng - radP1Lng) * (2 + Math.sin(radP1Lat) + Math.sin(radP2Lat));
    }
    totalArea = (Math.abs(totalArea) * R * R) / 2.0;
    return totalArea;
  };

  // 1. Initialize Map Instance
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
      const center = effectiveData?.metadata?.center || [26.9145, 75.7895];
      const map = L.map(mapContainerRef.current, {
        center,
        zoom: 15,
        zoomControl: false,
        scrollWheelZoom: true,
      });

      // Add Zoom Control bottom-right so it NEVER overlaps with the top toolbar
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Default to high-resolution Esri World Imagery Satellite Tiles + Reference Labels
      const satelliteTiles = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles &copy; Esri &mdash; High-Resolution Satellite & Aerial Imagery",
          maxZoom: 19,
        }
      );
      const labelTiles = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Labels &copy; Esri",
          maxZoom: 19,
        }
      );
      const satelliteGroup = L.layerGroup([satelliteTiles, labelTiles]).addTo(map);

      baseTileLayerRef.current = satelliteGroup;

      // Layer group for measurements
      measureLayerGroupRef.current = L.layerGroup().addTo(map);

      // Mouse move listener for live coordinates
      map.on("mousemove", (e: any) => {
        const lat = parseFloat(e.latlng.lat.toFixed(6));
        const lng = parseFloat(e.latlng.lng.toFixed(6));
        // Approximate UTM Zone 43N Easting & Northing for Rajasthan / Delhi corridor
        const easting = Math.round((lng - 72.0) * 111320 + 500000);
        const northing = Math.round(lat * 110574);
        setCursorCoords({ lat, lng, easting, northing });
      });

      map.on("zoomend", () => {
        setCurrentZoom(map.getZoom());
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Filter features according to layer visibility and status/khasra filters
    const allFeatures = effectiveData.features || [];
    const filteredFeatures = allFeatures.filter((f) => {
      const p = f.properties || {};
      const layerType = p.layer_type || "PARCEL";

      // Layer visibility checks
      if (layerType === "ROW_CENTERLINE" && !layerVisibility.rowCenterline) return false;
      if (layerType === "ROW_BUFFER" && !layerVisibility.rowBuffer) return false;
      if (layerType === "VILLAGE_BOUNDARY" && !layerVisibility.villageBounds) return false;
      if (layerType === "ECO_SENSITIVE" && !layerVisibility.ecoSensitive) return false;
      if (layerType === "PARCEL" && !layerVisibility.parcels) return false;

      // Filter only applies to parcels
      if (layerType === "PARCEL") {
        if (statusFilter === "ACQUIRED" && p.acquisition_status !== "ACQUIRED" && p.acquisition_status !== "POSSESSION_TAKEN") return false;
        if (statusFilter === "NOTIFIED" && p.acquisition_status !== "SECTION_11_NOTIFIED" && p.acquisition_status !== "SECTION_19_DECLARED") return false;
        if (statusFilter === "DISPUTED" && !p.is_disputed) return false;
        if (statusFilter === "SURVEY" && p.acquisition_status !== "VERIFICATION_PENDING" && p.current_stage !== "GROUND_SURVEY") return false;
        if (statusFilter === "AWARD" && p.acquisition_status !== "AWARD_ENQUIRY" && p.current_stage !== "SECTION_23") return false;

        if (searchKhasra.trim()) {
          const q = searchKhasra.toLowerCase();
          const matchesKhasra = p.khasra_number?.toLowerCase().includes(q);
          const matchesUlpin = p.ulpin?.toLowerCase().includes(q);
          const matchesOwner = p.owner_name?.toLowerCase().includes(q);
          const matchesVillage = p.village_name?.toLowerCase().includes(q);
          if (!matchesKhasra && !matchesUlpin && !matchesOwner && !matchesVillage) {
            return false;
          }
        }
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
          const layerType = props.layer_type || "PARCEL";

          if (layerType === "ROW_CENTERLINE") {
            return {
              color: "#2563eb",
              weight: 3.5,
              opacity: 0.9,
              dashArray: "6, 6",
            };
          }

          if (layerType === "ROW_BUFFER") {
            return {
              fillColor: "#3b82f6",
              color: "#1d4ed8",
              weight: 1.5,
              fillOpacity: 0.15,
              dashArray: "4, 4",
            };
          }

          if (layerType === "ECO_SENSITIVE") {
            return {
              fillColor: "#059669",
              color: "#047857",
              weight: 2,
              fillOpacity: 0.2,
              dashArray: "5, 5",
            };
          }

          if (layerType === "VILLAGE_BOUNDARY") {
            return {
              fillColor: "#64748b",
              color: "#334155",
              weight: 1.5,
              fillOpacity: 0.05,
              dashArray: "3, 6",
            };
          }

          // Default Parcel
          return {
            fillColor:
              props.fillColor ||
              (props.is_disputed
                ? "#ef4444"
                : props.acquisition_status === "ACQUIRED"
                ? "#138808"
                : props.acquisition_status === "SECTION_19_DECLARED"
                ? "#3b82f6"
                : "#10b981"),
            color: isSelected ? "#ffffff" : props.color || "#0a5c04",
            weight: isSelected ? 4 : 2,
            opacity: 1,
            fillOpacity: isSelected ? 0.85 : props.fillOpacity || 0.65,
          };
        },
        onEachFeature: (feature: any, layer: any) => {
          const props = feature.properties || {};
          const layerType = props.layer_type || "PARCEL";

          if (layerType === "PARCEL") {
            const popupContent = `
              <div style="font-family: inherit; min-width: 230px; padding: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
                  <div>
                    <span style="font-weight: 800; font-size: 13px; color: #0f172a;">Khasra #${props.khasra_number}</span>
                    ${props.ulpin ? `<div style="font-size: 9px; font-family: monospace; color: #64748b;">ULPIN: ${props.ulpin}</div>` : ''}
                  </div>
                  <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;">
                    ${props.village_name || "Village"}
                  </span>
                </div>
                <div style="font-size: 11px; color: #475569; line-height: 1.6; margin-bottom: 8px;">
                  <div><strong>Khatedar:</strong> ${props.owner_name || "Multiple Joint Owners"}</div>
                  <div><strong>Total Area:</strong> ${props.total_area_acres} Acres (${props.area_bigha || ((props.total_area_acres || 0) * 1.6).toFixed(2)} Bigha)</div>
                  <div><strong>Acquired:</strong> ${props.acquired_area_acres || props.total_area_acres} Acres</div>
                  <div><strong>Classification:</strong> ${props.land_type || "Agricultural Irrigated"}</div>
                  ${props.assessed_compensation_inr ? `<div><strong>Assessed Award:</strong> ₹${((props.assessed_compensation_inr) / 10000000).toFixed(2)} Cr</div>` : ''}
                  <div><strong>Status:</strong> <span style="font-weight: 700; color: ${props.color || '#138808'};">${props.status_label || props.acquisition_status}</span></div>
                  ${props.is_disputed ? `<div style="color: #b91c1c; font-weight: 700; margin-top: 2px; background: #fef2f2; padding: 2px 4px; border-radius: 3px;">⚠️ ${props.dispute_reason || "Court Stay Under Sec 15"}</div>` : ''}
                </div>
                <div style="display: flex; gap: 4px;">
                  <a href="/land-parcels/${props.parcel_id}" style="flex: 1; text-align: center; background: #138808; color: #ffffff; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-decoration: none;">
                    360° Profile →
                  </a>
                </div>
              </div>
            `;

            layer.bindPopup(popupContent);

            layer.on({
              click: () => {
                setSelectedParcel(props);
                if (effectiveSelect && props.parcel_id) {
                  effectiveSelect(props.parcel_id);
                }
              },
              mouseover: (e: any) => {
                const l = e.target;
                l.setStyle({ weight: 4, fillOpacity: 0.85 });
              },
              mouseout: (e: any) => {
                geojsonLayer.resetStyle(e.target);
              },
            });
          } else {
            // RoW or Boundary layer popup
            layer.bindPopup(`
              <div style="font-family: inherit; font-size: 11px; padding: 4px;">
                <strong style="color: #0f172a;">${props.khasra_number || props.parcel_id}</strong>
                <div style="color: #64748b; margin-top: 2px;">${props.status_label || props.village_name}</div>
              </div>
            `);
          }
        },
      }).addTo(map);

      geojsonLayerRef.current = geojsonLayer;

      const bounds = geojsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [35, 35] });
      }
    }

    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 600);

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    effectiveData,
    selectedParcelId,
    effectiveSelect,
    statusFilter,
    searchKhasra,
    layerVisibility,
  ]);

  // 2. Handle interactive measurement clicks
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const L = require("leaflet");

    const handleMapClick = (e: any) => {
      if (measureMode === "NONE") return;

      const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
      const updatedPoints = [...measurePoints, newPoint];
      setMeasurePoints(updatedPoints);

      // Redraw measurement graphics
      if (measureLayerGroupRef.current) {
        measureLayerGroupRef.current.clearLayers();

        // Draw marker for each point
        updatedPoints.forEach((pt, idx) => {
          const circleMarker = L.circleMarker(pt, {
            radius: 5,
            fillColor: "#f59e0b",
            color: "#ffffff",
            weight: 2,
            fillOpacity: 0.9,
          });
          circleMarker.bindTooltip(`Pt ${idx + 1}`, { permanent: true, direction: "top", className: "measure-tooltip" });
          measureLayerGroupRef.current.addLayer(circleMarker);
        });

        if (measureMode === "DISTANCE" && updatedPoints.length >= 2) {
          const polyline = L.polyline(updatedPoints, {
            color: "#f59e0b",
            weight: 3.5,
            dashArray: "5, 5",
          });
          measureLayerGroupRef.current.addLayer(polyline);

          let totalMeters = 0;
          for (let i = 0; i < updatedPoints.length - 1; i++) {
            totalMeters += calculateDistance(updatedPoints[i], updatedPoints[i + 1]);
          }

          setMeasuredResult({
            distanceMeters: Math.round(totalMeters),
            distanceKm: (totalMeters / 1000).toFixed(3),
          });
        } else if (measureMode === "AREA" && updatedPoints.length >= 3) {
          const polygon = L.polygon(updatedPoints, {
            fillColor: "#f59e0b",
            color: "#d97706",
            weight: 2,
            fillOpacity: 0.35,
          });
          measureLayerGroupRef.current.addLayer(polygon);

          const sqm = calculatePolygonArea(updatedPoints);
          const acres = sqm / 4046.86;
          const hectares = sqm / 10000;
          const bighas = acres * 1.6; // Standard Rajasthan Pucca Bigha

          setMeasuredResult({
            areaSqm: Math.round(sqm),
            areaAcres: acres.toFixed(3),
            areaHectares: hectares.toFixed(3),
            areaBighas: bighas.toFixed(3),
          });
        }
      }
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [measureMode, measurePoints]);

  // Reset measurement
  const resetMeasurement = () => {
    setMeasureMode("NONE");
    setMeasurePoints([]);
    setMeasuredResult(null);
    if (measureLayerGroupRef.current) {
      measureLayerGroupRef.current.clearLayers();
    }
  };

  // Switch basemap
  const switchBaseMap = (type: BaseMapType) => {
    if (!mapInstanceRef.current) return;
    const L = require("leaflet");
    const map = mapInstanceRef.current;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }

    if (type === "SATELLITE") {
      const satelliteTiles = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles &copy; Esri &mdash; High-Resolution Satellite & Aerial Imagery",
          maxZoom: 19,
        }
      );
      const labelTiles = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Labels &copy; Esri",
          maxZoom: 19,
        }
      );
      const satelliteGroup = L.layerGroup([satelliteTiles, labelTiles]).addTo(map);
      baseTileLayerRef.current = satelliteGroup;
    } else if (type === "STREET") {
      const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      baseTileLayerRef.current = streetLayer;
    } else if (type === "TOPO") {
      const topoLayer = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM | Style: OpenTopoMap',
        maxZoom: 19,
      }).addTo(map);
      baseTileLayerRef.current = topoLayer;
    } else if (type === "DARK") {
      const darkLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);
      baseTileLayerRef.current = darkLayer;
    }

    setActiveBaseMap(type);
  };

  // Recenter map
  const handleRecenter = () => {
    if (mapInstanceRef.current && geojsonLayerRef.current) {
      const bounds = geojsonLayerRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [35, 35] });
      }
    }
  };

  // Export active GeoJSON
  const handleExportGeoJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(effectiveData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `NLAMS_Cadastre_${effectiveData.metadata?.project_id || "Corridor"}.geojson`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Copy ULPIN helper
  const handleCopyUlpin = (ulpin: string) => {
    navigator.clipboard.writeText(ulpin);
    setCopiedUlpin(true);
    setTimeout(() => setCopiedUlpin(false), 2000);
  };

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-slate-700/60 shadow-lg bg-slate-950 w-full"
      style={{
        height: height || "600px",
        minHeight: height?.includes("px") && parseInt(height) < 450 ? height : "360px",
        position: "relative",
      }}
    >
      {/* 1. Top HUD Bar & Tools - Fixed z-[1000] so it is ALWAYS visible and never hidden by tiles or controls */}
      {showControls && (
        <div className="absolute top-2.5 left-2.5 right-2.5 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Left: Corridor Layer Badge, Quick Search, Layers & Measurement */}
          <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap">
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/90 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-xs text-white">
              <Layers className="h-4 w-4 text-[#138808]" />
              <span className="font-bold whitespace-nowrap">
                {title || effectiveData.metadata?.project_title?.slice(0, 28) || "Cadastral Layer"}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-[10px] text-emerald-400 font-mono whitespace-nowrap">
                {effectiveData.features.filter((f) => f.properties?.layer_type === "PARCEL" || !f.properties?.layer_type).length} Parcels
              </span>
            </div>

            {/* Quick Search */}
            <div className="relative hidden xl:block">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Khasra / ULPIN..."
                value={searchKhasra}
                onChange={(e) => setSearchKhasra(e.target.value)}
                className="pl-8 pr-7 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700/90 text-xs text-white placeholder-slate-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#138808] w-48"
              />
              {searchKhasra && (
                <button
                  type="button"
                  onClick={() => setSearchKhasra("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Layer Visibility Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLayerMenu(!showLayerMenu)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md border shadow-lg transition-all ${
                  showLayerMenu
                    ? "bg-[#138808] text-white border-green-500 shadow-emerald-950/50"
                    : "bg-slate-900/95 text-slate-200 border-slate-700 hover:bg-slate-800"
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-emerald-400" />
                <span>Layers</span>
              </button>

              {showLayerMenu && (
                <div className="absolute left-0 top-full mt-1.5 w-60 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-2.5 shadow-2xl z-[1100] text-xs space-y-1.5 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                  <div className="font-bold text-[11px] text-slate-400 uppercase tracking-wider px-1 pb-1 border-b border-slate-800 flex items-center justify-between">
                    <span>Spatial Overlays</span>
                    <button type="button" onClick={() => setShowLayerMenu(false)} className="text-slate-400 hover:text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-xs bg-[#138808]" />
                      Cadastral Parcels
                    </span>
                    <input
                      type="checkbox"
                      checked={layerVisibility.parcels}
                      onChange={(e) => setLayerVisibility({ ...layerVisibility, parcels: e.target.checked })}
                      className="rounded accent-[#138808]"
                    />
                  </label>
                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="h-0.5 w-3 bg-blue-500" />
                      RoW Centerline
                    </span>
                    <input
                      type="checkbox"
                      checked={layerVisibility.rowCenterline}
                      onChange={(e) => setLayerVisibility({ ...layerVisibility, rowCenterline: e.target.checked })}
                      className="rounded accent-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-xs bg-blue-500/40 border border-blue-400" />
                      60m Statutory RoW Buffer
                    </span>
                    <input
                      type="checkbox"
                      checked={layerVisibility.rowBuffer}
                      onChange={(e) => setLayerVisibility({ ...layerVisibility, rowBuffer: e.target.checked })}
                      className="rounded accent-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-xs bg-slate-500/30 border border-slate-400" />
                      Village Boundaries
                    </span>
                    <input
                      type="checkbox"
                      checked={layerVisibility.villageBounds}
                      onChange={(e) => setLayerVisibility({ ...layerVisibility, villageBounds: e.target.checked })}
                      className="rounded accent-slate-400"
                    />
                  </label>
                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500/40 border border-emerald-400" />
                      Eco-Sensitive Buffer
                    </span>
                    <input
                      type="checkbox"
                      checked={layerVisibility.ecoSensitive}
                      onChange={(e) => setLayerVisibility({ ...layerVisibility, ecoSensitive: e.target.checked })}
                      className="rounded accent-emerald-500"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Measurement Tools */}
            <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 p-0.5 rounded-xl shadow-lg text-xs">
              <button
                type="button"
                onClick={() => {
                  if (measureMode === "DISTANCE") resetMeasurement();
                  else {
                    resetMeasurement();
                    setMeasureMode("DISTANCE");
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  measureMode === "DISTANCE"
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
                title="Measure linear distance between points"
              >
                <Ruler className="h-3 w-3" />
                <span className="hidden sm:inline">Distance</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (measureMode === "AREA") resetMeasurement();
                  else {
                    resetMeasurement();
                    setMeasureMode("AREA");
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  measureMode === "AREA"
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
                title="Calculate enclosed polygon area (Acres / Bighas)"
              >
                <Square className="h-3 w-3" />
                <span className="hidden sm:inline">Area</span>
              </button>
              {measureMode !== "NONE" && (
                <button
                  type="button"
                  onClick={resetMeasurement}
                  className="p-1 rounded text-rose-400 hover:bg-rose-950/50"
                  title="Clear measurement"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Basemap Switcher & Actions */}
          <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700 p-1 rounded-xl shadow-lg text-xs">
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
              <button
                type="button"
                onClick={() => switchBaseMap("SATELLITE")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-[11px] transition-all ${
                  activeBaseMap === "SATELLITE"
                    ? "bg-[#138808] text-white shadow-sm ring-1 ring-emerald-400"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                }`}
                title="High-Resolution Satellite Imagery + Labels"
              >
                <Globe className="h-3 w-3" />
                <span>Satellite</span>
              </button>
              <button
                type="button"
                onClick={() => switchBaseMap("STREET")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-[11px] transition-all ${
                  activeBaseMap === "STREET"
                    ? "bg-[#138808] text-white shadow-sm ring-1 ring-emerald-400"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                }`}
                title="OpenStreetMap Standard Street Layer"
              >
                <MapIcon className="h-3 w-3" />
                <span>Street</span>
              </button>
              <button
                type="button"
                onClick={() => switchBaseMap("TOPO")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-[11px] transition-all ${
                  activeBaseMap === "TOPO"
                    ? "bg-[#138808] text-white shadow-sm ring-1 ring-emerald-400"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                }`}
                title="Topographic Elevation Contours"
              >
                <Compass className="h-3 w-3" />
                <span>Topo</span>
              </button>
              <button
                type="button"
                onClick={() => switchBaseMap("DARK")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-[11px] transition-all ${
                  activeBaseMap === "DARK"
                    ? "bg-[#138808] text-white shadow-sm ring-1 ring-emerald-400"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                }`}
                title="Dark Matter Canvas"
              >
                <span>Dark</span>
              </button>
            </div>

            <div className="h-4 w-px bg-slate-700 mx-0.5" />

            <button
              type="button"
              onClick={handleRecenter}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
              title="Fit to project corridor bounds"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleExportGeoJson}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 transition-colors border border-slate-700/60"
              title="Export Corridor GeoJSON"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Active Measurement Banner */}
      {measureMode !== "NONE" && (
        <div className="absolute top-16 left-3 z-[400] bg-slate-900/95 backdrop-blur-md border border-amber-500/80 p-2.5 rounded-xl shadow-xl text-xs text-slate-200 flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
          <div>
            <div className="font-bold text-amber-400">
              {measureMode === "DISTANCE" ? "Distance Measurement Mode" : "Polygon Area Mode"}
            </div>
            <div className="text-[11px] text-slate-400">
              {measurePoints.length === 0
                ? "Click anywhere on the map to place the first point."
                : `Placed ${measurePoints.length} point(s). Click to add more.`}
            </div>
            {measuredResult && (
              <div className="mt-1.5 pt-1.5 border-t border-slate-800 font-mono text-xs text-white">
                {measureMode === "DISTANCE" && (
                  <div>
                    Total Length: <strong>{measuredResult.distanceMeters} m</strong> ({measuredResult.distanceKm} km)
                  </div>
                )}
                {measureMode === "AREA" && (
                  <div className="space-y-0.5">
                    <div>Area: <strong>{measuredResult.areaAcres} Acres</strong> ({measuredResult.areaBighas} Bigha)</div>
                    <div className="text-[10px] text-slate-400">
                      {measuredResult.areaSqm} sq.m / {measuredResult.areaHectares} Ha
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={resetMeasurement}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
          >
            Done
          </button>
        </div>
      )}

      {/* 3. Live Cursor Coordinates & Telemetry (Bottom-Right) */}
      <div className="absolute bottom-3 right-3 z-[400] hidden sm:flex items-center gap-2 pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-800 px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-400 shadow-md">
        <Compass className="h-3 w-3 text-emerald-400" />
        {cursorCoords ? (
          <span>
            {cursorCoords.lat}° N, {cursorCoords.lng}° E | UTM43N: {cursorCoords.easting}E {cursorCoords.northing}N | z{currentZoom}
          </span>
        ) : (
          <span>Hover map for coordinates | z{currentZoom}</span>
        )}
      </div>

      {/* 4. Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{ height: "100%", width: "100%", minHeight: "500px" }}
      />

      {/* 5. Bottom Status Filter & Legend */}
      <div className="absolute bottom-3 left-3 z-[400] flex flex-wrap items-center gap-2 pointer-events-none max-w-[calc(100%-240px)]">
        {/* Filter Pills */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1 rounded-lg shadow-md flex items-center gap-1 text-[11px] overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Filter:</span>
          {[
            { id: "ALL", label: "All" },
            { id: "ACQUIRED", label: "Acquired" },
            { id: "NOTIFIED", label: "Notified" },
            { id: "AWARD", label: "Sec 23 Award" },
            { id: "SURVEY", label: "Survey" },
            { id: "DISPUTED", label: "Disputed" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`px-2.5 py-0.5 rounded font-bold transition-all whitespace-nowrap ${
                statusFilter === f.id
                  ? "bg-[#138808] text-white shadow-xs"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="pointer-events-auto hidden lg:flex bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-lg shadow-md items-center gap-3 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#138808]" />
            <span>Acquired</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#10b981]" />
            <span>Notified (Sec 11)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#3b82f6]" />
            <span>Sec 19 Declared</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#8b5cf6]" />
            <span>Sec 23 Award</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#ef4444]" />
            <span className="text-rose-400 font-bold">Disputed</span>
          </div>
        </div>
      </div>

      {/* 6. Authoritative 360° Parcel Inspector Drawer / Side Sheet */}
      {enableDrawer && selectedParcel && (
        <div className="absolute top-16 right-3 bottom-12 w-80 md:w-96 z-[450] bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl p-4 flex flex-col justify-between overflow-y-auto text-slate-200 animate-in slide-in-from-right duration-200">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-white">
                    Khasra #{selectedParcel.khasra_number}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    Khata #{selectedParcel.khata_number}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-emerald-400" />
                  {selectedParcel.village_name}, {selectedParcel.tehsil_name || "Tehsil"}, {selectedParcel.district_name || "Jaipur"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedParcel(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Bhu-Aadhaar 14-Digit ULPIN Stamp */}
            {selectedParcel.ulpin && (
              <div className="bg-emerald-950/40 border border-emerald-600/40 rounded-xl p-2.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    <BadgeCheck className="h-3 w-3" />
                    Bhu-Aadhaar (ULPIN)
                  </div>
                  <div className="font-mono text-xs font-bold text-emerald-200 mt-0.5">
                    {selectedParcel.ulpin}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyUlpin(selectedParcel.ulpin)}
                  className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300"
                  title="Copy ULPIN"
                >
                  {copiedUlpin ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}

            {/* Dispute Alert if Any */}
            {selectedParcel.is_disputed && (
              <div className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-2.5 text-xs text-rose-200 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-300">Active Litigation / Title Dispute</div>
                  <div className="text-[11px] text-rose-300/90 mt-0.5">
                    {selectedParcel.dispute_reason || "Legal objection pending before Land Acquisition Authority."}
                  </div>
                </div>
              </div>
            )}

            {/* Key Spatial Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2">
                <span className="text-[10px] text-slate-400 block uppercase">Total Extent</span>
                <span className="font-bold text-white text-sm">{selectedParcel.total_area_acres} Acres</span>
                <span className="text-[10px] text-slate-400 block">
                  ({selectedParcel.area_bigha || ((selectedParcel.total_area_acres || 0) * 1.6).toFixed(2)} Bigha)
                </span>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2">
                <span className="text-[10px] text-slate-400 block uppercase">Acquired Area</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {selectedParcel.acquired_area_acres || selectedParcel.total_area_acres} Acres
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {selectedParcel.area_sqm ? `${Math.round(selectedParcel.area_sqm)} sq.m` : "100% RoW Corridor"}
                </span>
              </div>
            </div>

            {/* Khatedar (Landowner) & Compensation Details */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Khatedar (Owner):</span>
                <span className="font-bold text-white text-right">{selectedParcel.owner_name || "Joint Landowners"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Land Classification:</span>
                <span className="font-semibold text-slate-200">{selectedParcel.land_type || "Agricultural"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Circle Rate (DLC):</span>
                <span className="font-mono text-slate-200">₹{selectedParcel.circle_rate_sqm || 850}/sq.m</span>
              </div>
              {selectedParcel.assessed_compensation_inr && (
                <div className="flex justify-between items-center pt-2 border-t border-slate-700 font-semibold">
                  <span className="text-slate-300">Total Solatium Award:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    ₹{(selectedParcel.assessed_compensation_inr / 10000000).toFixed(2)} Cr
                  </span>
                </div>
              )}
            </div>

            {/* Tree & Structure Asset Count */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2">
                <Trees className="h-3.5 w-3.5 mx-auto text-emerald-400 mb-1" />
                <span className="text-[10px] text-slate-400 block">Trees</span>
                <span className="font-bold text-white">{selectedParcel.trees_count ?? 0}</span>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2">
                <Home className="h-3.5 w-3.5 mx-auto text-amber-400 mb-1" />
                <span className="text-[10px] text-slate-400 block">Structures</span>
                <span className="font-bold text-white">{selectedParcel.structures_count ?? 0}</span>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2">
                <Droplet className="h-3.5 w-3.5 mx-auto text-blue-400 mb-1" />
                <span className="text-[10px] text-slate-400 block">Wells / Tube</span>
                <span className="font-bold text-white">{selectedParcel.wells_count ?? 0}</span>
              </div>
            </div>

            {/* Current Stage Status */}
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Statutory Progress</span>
                <span className="font-bold text-white">{selectedParcel.status_label || selectedParcel.acquisition_status}</span>
              </div>
              <span
                className="px-2 py-1 rounded text-[10px] font-bold"
                style={{
                  backgroundColor: `${selectedParcel.color || '#138808'}25`,
                  color: selectedParcel.color || '#10b981',
                  border: `1px solid ${selectedParcel.color || '#10b981'}60`,
                }}
              >
                {selectedParcel.current_stage || "SECTION_11"}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <Link
              href={`/land-parcels/${selectedParcel.parcel_id}`}
              className="w-full flex items-center justify-center gap-1.5 bg-[#138808] hover:bg-green-700 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-md transition-all"
            >
              <span>Inspect 360° Land Record</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={`/field/tasks?parcel_id=${selectedParcel.parcel_id}`}
              className="w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-1.5 px-3 rounded-xl text-xs border border-slate-700 transition-all"
            >
              <span>Dispatch Mobile Field Survey</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
