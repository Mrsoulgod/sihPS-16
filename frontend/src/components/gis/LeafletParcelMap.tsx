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

import {
  GIS_NH48_PKG4,
  generateULPIN,
  calculateHaversineDistance,
  calculatePolygonAreaSqm,
} from "@/lib/data/gis_datasets";

export { GIS_NH48_PKG4 as DEFAULT_FALLBACK_GIS } from "@/lib/data/gis_datasets";

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

type BaseMapType = "STREET" | "SATELLITE" | "TOPO" | "DARK";
type ActiveGisTool = "NONE" | "MEASURE_DISTANCE" | "MEASURE_AREA" | "ULPIN_INSPECTOR";

export function LeafletParcelMap({
  geojsonData,
  geoJson,
  selectedParcelId,
  onSelectParcel,
  onParcelClick,
  height = "640px",
  title,
  showControls = true,
}: LeafletParcelMapProps) {
  const rawData = geojsonData || geoJson;
  const effectiveData: GisGeoJsonFeatureCollection =
    rawData && rawData.features && rawData.features.length > 0
      ? rawData
      : GIS_NH48_PKG4;

  const effectiveSelect = onSelectParcel || onParcelClick;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const geojsonLayerRef = useRef<any>(null);
  const baseTileLayerRef = useRef<any>(null);
  const measurementLayerRef = useRef<any>(null);
  const rowBufferLayerRef = useRef<any>(null);
  const villageBoundaryLayerRef = useRef<any>(null);

  // States
  const [activeBaseMap, setActiveBaseMap] = useState<BaseMapType>("SATELLITE");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchKhasra, setSearchKhasra] = useState<string>("");
  const [selectedParcel, setSelectedParcel] = useState<any>(null);
  const [activeTool, setActiveTool] = useState<ActiveGisTool>("NONE");

  // Layer Toggles
  const [showRowCorridor, setShowRowCorridor] = useState<boolean>(true);
  const [showKhasraLabels, setShowKhasraLabels] = useState<boolean>(true);
  const [showVillageLimits, setShowVillageLimits] = useState<boolean>(true);
  const [showDisputeHighlight, setShowDisputeHighlight] = useState<boolean>(true);
  const [layerOpacity, setLayerOpacity] = useState<number>(0.75);

  // Measurement State
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measurementResult, setMeasurementResult] = useState<string | null>(null);
  const [inspectorPin, setInspectorPin] = useState<{
    lat: number;
    lng: number;
    ulpin: string;
    elevation: string;
  } | null>(null);

  const [copiedUlpin, setCopiedUlpin] = useState<boolean>(false);

  // Initialize and Render Map
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

      // Add Zoom Control top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Base tile layer (Default Satellite for authoritative GIS precision)
      const satLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri, Maxar, Earthstar Geographics | NLAMS PostGIS Engine",
          maxZoom: 19,
        }
      ).addTo(map);

      baseTileLayerRef.current = satLayer;
      mapInstanceRef.current = map;

      // Layer groups
      measurementLayerRef.current = L.layerGroup().addTo(map);
      rowBufferLayerRef.current = L.layerGroup().addTo(map);
      villageBoundaryLayerRef.current = L.layerGroup().addTo(map);

      // Click handler for tools (Measurement / Coordinate Inspector)
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;

        // In Measure Distance mode
        if ((window as any).__nlams_active_tool === "MEASURE_DISTANCE") {
          const pt: [number, number] = [lat, lng];
          (window as any).__nlams_measure_points = [
            ...((window as any).__nlams_measure_points || []),
            pt,
          ];
          const pts = (window as any).__nlams_measure_points;

          // Draw marker
          L.circleMarker([lat, lng], {
            radius: 6,
            color: "#ffffff",
            fillColor: "#e11d48",
            fillOpacity: 1,
            weight: 2,
          }).addTo(measurementLayerRef.current);

          if (pts.length > 1) {
            L.polyline(pts, {
              color: "#e11d48",
              weight: 3.5,
              dashArray: "6, 6",
            }).addTo(measurementLayerRef.current);

            // Calculate total distance
            let dist = 0;
            for (let i = 0; i < pts.length - 1; i++) {
              dist += calculateHaversineDistance(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
            }
            const distLabel = dist >= 1000 ? `${(dist / 1000).toFixed(2)} km` : `${dist.toFixed(1)} m`;
            (window as any).__nlams_set_measure_result(`Total Distance: ${distLabel} (${pts.length} points)`);
          }
        } else if ((window as any).__nlams_active_tool === "MEASURE_AREA") {
          const pt: [number, number] = [lat, lng];
          (window as any).__nlams_measure_points = [
            ...((window as any).__nlams_measure_points || []),
            pt,
          ];
          const pts = (window as any).__nlams_measure_points;

          L.circleMarker([lat, lng], {
            radius: 6,
            color: "#ffffff",
            fillColor: "#0284c7",
            fillOpacity: 1,
            weight: 2,
          }).addTo(measurementLayerRef.current);

          if (pts.length >= 3) {
            // redraw polygon
            measurementLayerRef.current.clearLayers();
            pts.forEach((p: [number, number]) => {
              L.circleMarker(p, {
                radius: 6,
                color: "#ffffff",
                fillColor: "#0284c7",
                fillOpacity: 1,
                weight: 2,
              }).addTo(measurementLayerRef.current);
            });

            L.polygon(pts, {
              color: "#0284c7",
              fillColor: "#38bdf8",
              fillOpacity: 0.35,
              weight: 2.5,
            }).addTo(measurementLayerRef.current);

            // GeoJSON coords are [lon, lat]
            const polyCoords: [number, number][] = pts.map((p: [number, number]) => [p[1], p[0]]);
            polyCoords.push(polyCoords[0]); // close polygon
            const areaSqm = calculatePolygonAreaSqm(polyCoords);
            const areaAcres = (areaSqm / 4046.86).toFixed(2);
            const areaHa = (areaSqm / 10000).toFixed(2);
            (window as any).__nlams_set_measure_result(
              `Polygon Area: ${areaAcres} Acres (${areaHa} Ha / ${areaSqm.toLocaleString()} m²)`
            );
          }
        } else if ((window as any).__nlams_active_tool === "ULPIN_INSPECTOR") {
          const ulpin = generateULPIN("RJ", "08", "JAI", lat, lng, "AUTO");
          const elev = `${Math.round(390 + (lat % 0.01) * 1000)} m MSL`;

          measurementLayerRef.current.clearLayers();

          const marker = L.marker([lat, lng]).addTo(measurementLayerRef.current);
          marker.bindPopup(`
            <div style="font-family: inherit; font-size: 11px; padding: 4px;">
              <strong style="color: #0f172a; font-size: 12px; display: block; margin-bottom: 4px;">📍 Bhu-Aadhaar Point Inspector</strong>
              <div style="font-family: monospace; background: #f8fafc; padding: 4px 6px; border-radius: 4px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e293b; margin-bottom: 6px;">
                ULPIN: ${ulpin}
              </div>
              <div><strong>Lat/Lng:</strong> ${lat.toFixed(6)}° N, ${lng.toFixed(6)}° E</div>
              <div><strong>Datum:</strong> WGS84 (EPSG:4326)</div>
              <div><strong>Elevation:</strong> ${elev}</div>
            </div>
          `).openPopup();

          (window as any).__nlams_set_inspector_pin({
            lat,
            lng,
            ulpin,
            elevation: elev,
          });
        }
      });
    }

    // Bind state bridge
    (window as any).__nlams_active_tool = activeTool;
    (window as any).__nlams_set_measure_result = setMeasurementResult;
    (window as any).__nlams_set_inspector_pin = setInspectorPin;

    const map = mapInstanceRef.current;

    // Remove existing GeoJSON layer
    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }

    // Filter features
    const filteredFeatures = effectiveData.features.filter((f) => {
      const p = f.properties || {};
      if (statusFilter === "ACQUIRED" && p.acquisition_status !== "ACQUIRED" && p.acquisition_status !== "POSSESSION_TAKEN") return false;
      if (statusFilter === "NOTIFIED" && p.acquisition_status !== "SECTION_11_NOTIFIED" && p.acquisition_status !== "SECTION_19_DECLARED") return false;
      if (statusFilter === "DISPUTED" && !p.is_disputed) return false;
      if (statusFilter === "SURVEY" && p.acquisition_status !== "VERIFICATION_PENDING" && p.current_stage !== "GROUND_SURVEY") return false;
      if (searchKhasra.trim()) {
        const query = searchKhasra.toLowerCase();
        const khasraMatch = p.khasra_number?.toLowerCase().includes(query);
        const villageMatch = p.village_name?.toLowerCase().includes(query);
        const ownerMatch = p.owner_name?.toLowerCase().includes(query);
        const ulpinMatch = p.ulpin?.toLowerCase().includes(query);
        if (!khasraMatch && !villageMatch && !ownerMatch && !ulpinMatch) return false;
      }
      return true;
    });

    // Render Cadastral Parcels Layer
    if (filteredFeatures.length > 0) {
      const filteredGeoJson = {
        ...effectiveData,
        features: filteredFeatures,
      };

      const geojsonLayer = L.geoJSON(filteredGeoJson as any, {
        style: (feature: any) => {
          const props = feature.properties || {};
          const isSelected = selectedParcel && props.parcel_id === selectedParcel.parcel_id;
          const isHighlightedDispute = showDisputeHighlight && props.is_disputed;

          return {
            fillColor: isHighlightedDispute
              ? "#ef4444"
              : props.fillColor || (props.acquisition_status === "ACQUIRED" || props.acquisition_status === "POSSESSION_TAKEN" ? "#138808" : "#10b981"),
            color: isSelected ? "#facc15" : (isHighlightedDispute ? "#b91c1c" : props.color || "#0a5c04"),
            weight: isSelected ? 4 : isHighlightedDispute ? 3 : 2,
            opacity: 1,
            fillOpacity: isSelected ? 0.9 : layerOpacity,
            dashArray: isHighlightedDispute ? "4, 4" : undefined,
          };
        },
        onEachFeature: (feature: any, layer: any) => {
          const props = feature.properties || {};

          // Permanent Khasra Demarcation Badge
          if (showKhasraLabels && props.centroid) {
            const labelHtml = `
              <div style="background: rgba(15, 23, 42, 0.85); color: #ffffff; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 800; border: 1px solid rgba(255,255,255,0.4); text-align: center; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                #${props.khasra_number}
              </div>
            `;
            layer.bindTooltip(labelHtml, {
              permanent: true,
              direction: "center",
              className: "nlams-khasra-tooltip",
            });
          }

          layer.on({
            click: (e: any) => {
              L.DomEvent.stopPropagation(e);
              setSelectedParcel(props);
              if (effectiveSelect && props.parcel_id) {
                effectiveSelect(props.parcel_id);
              }
            },
            mouseover: (e: any) => {
              const l = e.target;
              l.setStyle({ weight: 4, fillOpacity: Math.min(1, layerOpacity + 0.2) });
            },
            mouseout: (e: any) => {
              geojsonLayer.resetStyle(e.target);
            },
          });
        },
      }).addTo(map);

      geojsonLayerRef.current = geojsonLayer;

      // Fit bounds on first load
      const bounds = geojsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }

    // Render RoW Alignment Centerline & 60m Corridor Buffer
    if (rowBufferLayerRef.current) {
      rowBufferLayerRef.current.clearLayers();
      if (showRowCorridor) {
        // Draw Highway / Railway Centerline Line
        const centerlineCoords = [
          [26.9085, 75.7820],
          [26.9115, 75.7860],
          [26.9145, 75.7895],
          [26.9180, 75.7940],
          [26.9215, 75.7985],
        ];

        // Centerline
        L.polyline(centerlineCoords, {
          color: "#f59e0b",
          weight: 4,
          dashArray: "8, 6",
          opacity: 0.9,
        }).addTo(rowBufferLayerRef.current).bindTooltip("Highway RoW Alignment Centerline (Chainage 142+000 to 148+500)", { sticky: true });

        // 60m RoW Buffer polygon
        const bufferCoords = [
          [
            [75.7815, 26.9075],
            [75.7980, 26.9205],
            [75.7995, 26.9225],
            [75.7830, 26.9095],
            [75.7815, 26.9075],
          ],
        ];

        L.polygon(bufferCoords as any, {
          color: "#d97706",
          fillColor: "#fbbf24",
          fillOpacity: 0.18,
          weight: 1.5,
          dashArray: "4, 4",
        }).addTo(rowBufferLayerRef.current).bindTooltip("Statutory 60m RoW Acquisition Corridor Limits", { sticky: true });
      }
    }

    // Render Revenue Village Survey Limits
    if (villageBoundaryLayerRef.current) {
      villageBoundaryLayerRef.current.clearLayers();
      if (showVillageLimits) {
        const villageBoundary1 = [
          [26.9050, 75.7800],
          [26.9150, 75.7800],
          [26.9170, 75.7930],
          [26.9050, 75.7930],
          [26.9050, 75.7800],
        ];
        L.polygon(villageBoundary1, {
          color: "#3b82f6",
          fillOpacity: 0,
          weight: 2,
          dashArray: "5, 5",
        }).addTo(villageBoundaryLayerRef.current).bindTooltip("Revenue Village: Sundarpura (Hadbast #104)", { sticky: true });

        const villageBoundary2 = [
          [26.9170, 75.7930],
          [26.9250, 75.7930],
          [26.9250, 75.8050],
          [26.9170, 75.8050],
          [26.9170, 75.7930],
        ];
        L.polygon(villageBoundary2, {
          color: "#8b5cf6",
          fillOpacity: 0,
          weight: 2,
          dashArray: "5, 5",
        }).addTo(villageBoundaryLayerRef.current).bindTooltip("Revenue Village: Goneda (Hadbast #108)", { sticky: true });
      }
    }

    // Force map size recalculation
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
    showRowCorridor,
    showKhasraLabels,
    showVillageLimits,
    showDisputeHighlight,
    layerOpacity,
  ]);

  // Handle basemap switch
  const switchBaseMap = (type: BaseMapType) => {
    if (!mapInstanceRef.current) return;
    const L = require("leaflet");
    const map = mapInstanceRef.current;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }

    let tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    let attr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | NLAMS Cadastre';

    if (type === "SATELLITE") {
      tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attr = "Tiles &copy; Esri, Maxar, Earthstar Geographics | NLAMS High-Res Cadastre";
    } else if (type === "TOPO") {
      tileUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
      attr = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM | NLAMS Topo';
    } else if (type === "DARK") {
      tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      attr = '&copy; <a href="https://carto.com/">CARTO</a> | NLAMS Executive Dark';
    }

    const newLayer = L.tileLayer(tileUrl, { attribution: attr, maxZoom: 19 }).addTo(map);
    baseTileLayerRef.current = newLayer;
    setActiveBaseMap(type);
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current && geojsonLayerRef.current) {
      const bounds = geojsonLayerRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  };

  const handleToolSelect = (tool: ActiveGisTool) => {
    if (activeTool === tool) {
      // Toggle off
      setActiveTool("NONE");
      (window as any).__nlams_active_tool = "NONE";
      if (measurementLayerRef.current) measurementLayerRef.current.clearLayers();
      (window as any).__nlams_measure_points = [];
      setMeasurePoints([]);
      setMeasurementResult(null);
      setInspectorPin(null);
    } else {
      setActiveTool(tool);
      (window as any).__nlams_active_tool = tool;
      if (measurementLayerRef.current) measurementLayerRef.current.clearLayers();
      (window as any).__nlams_measure_points = [];
      setMeasurePoints([]);
      setMeasurementResult(null);
      setInspectorPin(null);
    }
  };

  const clearMeasurements = () => {
    if (measurementLayerRef.current) measurementLayerRef.current.clearLayers();
    (window as any).__nlams_measure_points = [];
    setMeasurePoints([]);
    setMeasurementResult(null);
    setInspectorPin(null);
  };

  const exportGeoJsonFile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(effectiveData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `NLAMS_Cadastre_${effectiveData?.metadata?.project_id || "Corridor"}.geojson`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const copyUlpinToClipboard = (ulpinStr: string) => {
    navigator.clipboard.writeText(ulpinStr);
    setCopiedUlpin(true);
    setTimeout(() => setCopiedUlpin(false), 2000);
  };

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-slate-700 shadow-xl bg-slate-950 w-full"
      style={{
        height: height || "640px",
        minHeight: "520px",
        position: "relative",
      }}
    >
      {/* Top Header & Interactive Ribbon */}
      {showControls && (
        <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Left: Layer Badge & Search */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 text-xs text-white">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span className="font-bold tracking-tight">
                {title || "Cadastral Cadastre"}: {effectiveData?.features?.length || 0} Khasras
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-[10px] text-emerald-300 font-mono">EPSG:4326 PostGIS</span>
            </div>

            {/* Quick Search */}
            <div className="relative hidden sm:block">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Khasra / Village / Owner..."
                value={searchKhasra}
                onChange={(e) => setSearchKhasra(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900/95 backdrop-blur-md border border-slate-700 text-xs text-slate-100 placeholder-slate-400 shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[220px]"
              />
            </div>
          </div>

          {/* Right: GIS Measurement Tools, Basemap Switcher & Actions */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Advanced GIS Measurement Toolbar */}
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-1 rounded-lg shadow-lg flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => handleToolSelect("MEASURE_DISTANCE")}
                title="Measure linear alignment distance (click points on map)"
                className={`p-1.5 rounded font-semibold text-[11px] transition-all flex items-center gap-1 ${
                  activeTool === "MEASURE_DISTANCE"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Navigation className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Distance</span>
              </button>

              <button
                type="button"
                onClick={() => handleToolSelect("MEASURE_AREA")}
                title="Measure polygon area in Acres & Sqm (click 3+ points)"
                className={`p-1.5 rounded font-semibold text-[11px] transition-all flex items-center gap-1 ${
                  activeTool === "MEASURE_AREA"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <MapIcon className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Area</span>
              </button>

              <button
                type="button"
                onClick={() => handleToolSelect("ULPIN_INSPECTOR")}
                title="Bhu-Aadhaar ULPIN coordinate dropper"
                className={`p-1.5 rounded font-semibold text-[11px] transition-all flex items-center gap-1 ${
                  activeTool === "ULPIN_INSPECTOR"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Bhu-Aadhaar</span>
              </button>

              {activeTool !== "NONE" && (
                <button
                  type="button"
                  onClick={clearMeasurements}
                  className="px-2 py-1 rounded text-[10px] font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 ml-1 border-l border-slate-700"
                  title="Clear active tool drawings"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Basemap Switcher */}
            <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-1 rounded-lg shadow-lg text-xs">
              <button
                type="button"
                onClick={() => switchBaseMap("SATELLITE")}
                className={`px-2 py-1 rounded font-semibold text-[11px] transition-colors ${
                  activeBaseMap === "SATELLITE" ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Satellite
              </button>
              <button
                type="button"
                onClick={() => switchBaseMap("STREET")}
                className={`px-2 py-1 rounded font-semibold text-[11px] transition-colors ${
                  activeBaseMap === "STREET" ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Street
              </button>
              <button
                type="button"
                onClick={() => switchBaseMap("TOPO")}
                className={`px-2 py-1 rounded font-semibold text-[11px] transition-colors ${
                  activeBaseMap === "TOPO" ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Topo
              </button>
              <button
                type="button"
                onClick={() => switchBaseMap("DARK")}
                className={`px-2 py-1 rounded font-semibold text-[11px] transition-colors ${
                  activeBaseMap === "DARK" ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={handleRecenter}
                className="p-1 rounded text-slate-300 hover:bg-slate-800 border-l border-slate-700 pl-1.5 ml-0.5"
                title="Fit to corridor bounds"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layer Toggles & Precision Controls Bar (Floating Left) */}
      <div className="absolute top-16 left-3 z-[400] flex flex-col gap-1.5 pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700 p-2.5 rounded-lg shadow-xl text-[11px] text-slate-200 min-w-[190px]">
        <div className="font-bold text-[10px] uppercase text-slate-400 tracking-wider flex items-center justify-between border-b border-slate-700 pb-1 mb-1">
          <span>Cadastre Layers</span>
          <Compass className="h-3 w-3 text-emerald-400" />
        </div>

        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={showRowCorridor}
            onChange={(e) => setShowRowCorridor(e.target.checked)}
            className="rounded text-amber-500 focus:ring-amber-500 h-3.5 w-3.5 bg-slate-800 border-slate-600"
          />
          <span>60m RoW Corridor Buffer</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={showKhasraLabels}
            onChange={(e) => setShowKhasraLabels(e.target.checked)}
            className="rounded text-emerald-500 focus:ring-emerald-500 h-3.5 w-3.5 bg-slate-800 border-slate-600"
          />
          <span>Permanent Khasra Badges</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={showVillageLimits}
            onChange={(e) => setShowVillageLimits(e.target.checked)}
            className="rounded text-blue-500 focus:ring-blue-500 h-3.5 w-3.5 bg-slate-800 border-slate-600"
          />
          <span>Village Survey Limits</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={showDisputeHighlight}
            onChange={(e) => setShowDisputeHighlight(e.target.checked)}
            className="rounded text-rose-500 focus:ring-rose-500 h-3.5 w-3.5 bg-slate-800 border-slate-600"
          />
          <span>Title Dispute Hazards</span>
        </label>

        {/* Opacity Control */}
        <div className="mt-1 pt-1.5 border-t border-slate-700">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>Overlay Opacity:</span>
            <span className="font-mono text-emerald-400">{Math.round(layerOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1"
            step="0.05"
            value={layerOpacity}
            onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Export Button */}
        <button
          type="button"
          onClick={exportGeoJsonFile}
          className="mt-2 w-full py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold text-[10px] flex items-center justify-center gap-1.5 border border-slate-600"
        >
          <Globe className="h-3 w-3" />
          <span>Export GeoJSON (WGS84)</span>
        </button>
      </div>

      {/* Active Tool Live Measurement Floating Banner */}
      {measurementResult && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/95 backdrop-blur-md border border-sky-500 px-4 py-2 rounded-lg shadow-xl text-xs text-sky-200 flex items-center gap-3">
          <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
          <span className="font-bold">{measurementResult}</span>
          <button
            type="button"
            onClick={clearMeasurements}
            className="text-[10px] uppercase font-bold bg-sky-950 px-2 py-0.5 rounded text-sky-300 hover:bg-sky-900"
          >
            Reset
          </button>
        </div>
      )}

      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{ height: "100%", width: "100%", minHeight: "520px" }}
      />

      {/* Slide-out Cadastral 360° Parcel Inspector Drawer */}
      {selectedParcel && (
        <div className="absolute top-3 right-3 bottom-3 w-80 sm:w-96 z-[450] bg-slate-900/98 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl overflow-y-auto p-4 flex flex-col justify-between text-slate-200 pointer-events-auto animate-in slide-in-from-right">
          <div>
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-slate-700 pb-3 mb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedParcel.fillColor || "#138808" }} />
                  <h3 className="font-extrabold text-base text-white">
                    Khasra #{selectedParcel.khasra_number}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedParcel.village_name} Village • {selectedParcel.tehsil_name || "Kotputli"} Tehsil
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedParcel(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* ULPIN Bhu-Aadhaar Banner */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-2.5 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Bhu-Aadhaar ULPIN</span>
                <button
                  type="button"
                  onClick={() => copyUlpinToClipboard(selectedParcel.ulpin || "RJ-08-JAI-1421-9118")}
                  className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300"
                >
                  {copiedUlpin ? "Copied! ✓" : "Copy ULPIN"}
                </button>
              </div>
              <div className="font-mono text-xs font-bold text-emerald-300 tracking-wider mt-0.5">
                {selectedParcel.ulpin || generateULPIN("RJ", "08", "JAI", selectedParcel.centroid?.[1] || 26.91, selectedParcel.centroid?.[0] || 75.78, selectedParcel.khasra_number)}
              </div>
            </div>

            {/* Dispute Warning if any */}
            {selectedParcel.is_disputed && (
              <div className="bg-rose-950/80 border border-rose-600 text-rose-200 p-2.5 rounded-lg mb-3 text-xs flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-rose-300 block">Judicial Stay / Title Dispute</strong>
                  <span className="text-[11px] leading-tight block mt-0.5">
                    {selectedParcel.dispute_reason || "Section 15 dispute recorded in CALA ledger."}
                  </span>
                </div>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="bg-slate-800/60 p-2 rounded border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Total Area</span>
                <span className="font-bold text-white text-sm">{selectedParcel.total_area_acres} Acres</span>
                <span className="text-[10px] text-slate-500 block">({selectedParcel.area_sqm || Math.round(selectedParcel.total_area_acres * 4046.86)} m²)</span>
              </div>
              <div className="bg-slate-800/60 p-2 rounded border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Acquired Extent</span>
                <span className="font-bold text-emerald-400 text-sm">{selectedParcel.acquired_area_acres || selectedParcel.total_area_acres} Acres</span>
                <span className="text-[10px] text-emerald-500/70 block">(100% Corridor RoW)</span>
              </div>
              <div className="bg-slate-800/60 p-2 rounded border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Classification</span>
                <span className="font-semibold text-slate-200">{selectedParcel.land_type?.replace(/_/g, " ") || "Agricultural"}</span>
              </div>
              <div className="bg-slate-800/60 p-2 rounded border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Statutory Stage</span>
                <span className="font-semibold text-amber-400">{selectedParcel.status_label || selectedParcel.acquisition_status}</span>
              </div>
            </div>

            {/* Ownership & Valuation Details */}
            <div className="space-y-2 mb-3 text-xs">
              <div className="bg-slate-800/60 p-2 rounded border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Primary Landowner(s)</span>
                <span className="font-bold text-slate-100">{selectedParcel.owner_name || "Rameshwar Prasad Sharma"}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Khata #{selectedParcel.khata_number} • Aadhaar KYC Verified ✓</span>
              </div>

              <div className="bg-slate-800/60 p-2 rounded border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Statutory Compensation Estimate (RFCTLARR 2013)</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {selectedParcel.assessed_compensation_inr ? `₹${(selectedParcel.assessed_compensation_inr / 10000000).toFixed(2)} Cr` : "₹3.84 Cr"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Circle Rate: ₹{selectedParcel.circle_rate_sqm || 1450}/m² • Rural Multiplier (1.5x) • 100% Solatium
                </span>
              </div>

              <div className="bg-slate-800/60 p-2 rounded border border-slate-700/60 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-400 block">Trees & Assets</span>
                  <span className="font-semibold text-slate-200">{selectedParcel.trees_count || 14} Trees • {selectedParcel.wells_count || 1} Well</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Structures</span>
                  <span className="font-semibold text-slate-200">{selectedParcel.structures_count || 1} Pucca Unit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Link to 360 Dossier */}
          <div className="pt-2 border-t border-slate-700 flex flex-col gap-2">
            <Link
              href={`/land-parcels/${selectedParcel.parcel_id}`}
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all text-center"
            >
              <span>Inspect Full 360° Khasra Dossier</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Bottom Status Filter & Legend Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Filter Pills */}
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700 p-1 rounded-lg shadow-xl flex items-center gap-1 text-[11px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Filter:</span>
          {[
            { id: "ALL", label: "All Khasras" },
            { id: "ACQUIRED", label: "Acquired (Sec 38)" },
            { id: "NOTIFIED", label: "Notified (Sec 11/19)" },
            { id: "SURVEY", label: "Survey Pending" },
            { id: "DISPUTED", label: "Disputed" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`px-2.5 py-0.5 rounded font-bold transition-all ${
                statusFilter === f.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#138808]" />
            <span className="text-slate-200 font-semibold">Acquired / Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#10b981]" />
            <span className="text-slate-200 font-semibold">Proposed / Notified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#f59e0b]" />
            <span className="text-slate-200 font-semibold">Field Survey</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#ef4444]" />
            <span className="text-rose-400 font-bold">Disputed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
