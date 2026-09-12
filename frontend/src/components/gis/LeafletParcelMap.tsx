"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
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
  Ruler,
  Maximize,
  Download,
  Copy,
  Check,
  X,
  Tag,
  Trees,
  Home,
  Droplets,
  FileSpreadsheet,
  AlertTriangle,
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

// Built-in benchmark fallback GIS data
export const DEFAULT_FALLBACK_GIS: GisGeoJsonFeatureCollection = {
  type: "FeatureCollection",
  metadata: {
    project_id: "PRJ-NH48-PKG4",
    total_parcels: 4,
    parcel_count: 4,
    center: [26.9135, 75.7895],
  },
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
        ulpin: "RJ-08-JAI-142A-9115",
        khasra_number: "142/1",
        khata_number: "58",
        village_name: "Sundarpura",
        tehsil_name: "Amer",
        district_name: "Jaipur",
        state_name: "Rajasthan",
        total_area_acres: 3.45,
        acquired_area_acres: 3.45,
        area_sqm: 13961.6,
        land_type: "AGRICULTURAL_IRRIGATED",
        acquisition_status: "ACQUIRED",
        status_label: "Acquired / Disbursed",
        verification_status: "VERIFIED",
        is_disputed: false,
        owner_name: "Rameshwar Prasad Sharma & 2 Others",
        owner_count: 3,
        circle_rate_sqm: 1250,
        assessed_compensation_inr: 38400000,
        trees_count: 14,
        structures_count: 1,
        wells_count: 2,
        centroid: [75.7873, 26.9124],
        current_stage: "SECTION_38",
        fillColor: "#138808",
        color: "#0a5c04",
        fillOpacity: 0.65,
        weight: 2,
        layer_type: "PARCEL",
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
        ulpin: "RJ-08-JAI-142B-9135",
        khasra_number: "142/2",
        khata_number: "58",
        village_name: "Sundarpura",
        tehsil_name: "Amer",
        district_name: "Jaipur",
        state_name: "Rajasthan",
        total_area_acres: 2.80,
        acquired_area_acres: 2.80,
        area_sqm: 11331.2,
        land_type: "AGRICULTURAL_UNIRRIGATED",
        acquisition_status: "SECTION_11_NOTIFIED",
        status_label: "Sec 11 Notified",
        verification_status: "VERIFIED",
        is_disputed: false,
        owner_name: "Kailash Chand Verma",
        owner_count: 1,
        circle_rate_sqm: 950,
        assessed_compensation_inr: 23600000,
        trees_count: 6,
        structures_count: 0,
        wells_count: 1,
        centroid: [75.7892, 26.9145],
        current_stage: "SECTION_11",
        fillColor: "#10b981",
        color: "#059669",
        fillOpacity: 0.65,
        weight: 2,
        layer_type: "PARCEL",
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
        ulpin: "RJ-08-JAI-143A-9155",
        khasra_number: "143/A",
        khata_number: "62",
        village_name: "Sundarpura",
        tehsil_name: "Amer",
        district_name: "Jaipur",
        state_name: "Rajasthan",
        total_area_acres: 4.10,
        acquired_area_acres: 0.0,
        area_sqm: 16592.1,
        land_type: "RESIDENTIAL_COMMERCIAL",
        acquisition_status: "DISPUTED",
        status_label: "Disputed / Court Stay",
        verification_status: "SURVEYED",
        is_disputed: true,
        dispute_reason: "Civil Suit #281/2025: Co-heir title contention and commercial valuation appeal before High Court.",
        owner_name: "Bhawani Singh Rajput & Co-sharers",
        owner_count: 4,
        circle_rate_sqm: 2400,
        assessed_compensation_inr: 58900000,
        trees_count: 2,
        structures_count: 3,
        wells_count: 0,
        centroid: [75.7922, 26.9165],
        current_stage: "SECTION_15",
        fillColor: "#ef4444",
        color: "#b91c1c",
        fillOpacity: 0.7,
        weight: 2,
        layer_type: "PARCEL",
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
        ulpin: "RJ-08-JAI-144B-9135",
        khasra_number: "144/B",
        khata_number: "71",
        village_name: "Sundarpura",
        tehsil_name: "Amer",
        district_name: "Jaipur",
        state_name: "Rajasthan",
        total_area_acres: 1.95,
        acquired_area_acres: 1.00,
        area_sqm: 7891.3,
        land_type: "AGRICULTURAL_IRRIGATED",
        acquisition_status: "VERIFICATION_PENDING",
        status_label: "Under Ground Survey",
        verification_status: "IN_PROGRESS",
        is_disputed: false,
        owner_name: "Smt. Shanti Devi Gurjar",
        owner_count: 1,
        circle_rate_sqm: 1100,
        assessed_compensation_inr: 16800000,
        trees_count: 8,
        structures_count: 0,
        wells_count: 1,
        centroid: [75.7872, 26.9145],
        current_stage: "GROUND_SURVEY",
        fillColor: "#f59e0b",
        color: "#d97706",
        fillOpacity: 0.65,
        weight: 2,
        layer_type: "PARCEL",
      },
    },
  ],
};

type BaseMapType = "STREET" | "SATELLITE" | "TOPO" | "DARK";
type MeasureMode = "NONE" | "DISTANCE" | "AREA";

export function LeafletParcelMap({
  geojsonData,
  geoJson,
  selectedParcelId,
  onSelectParcel,
  onParcelClick,
  height = "560px",
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
  const measureLayerGroupRef = useRef<any>(null);
  const labelsLayerGroupRef = useRef<any>(null);

  // UI state
  const [activeBaseMap, setActiveBaseMap] = useState<BaseMapType>("STREET");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchKhasra, setSearchKhasra] = useState<string>("");
  const [activeParcelDetails, setActiveParcelDetails] = useState<any>(null);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showAlignments, setShowAlignments] = useState<boolean>(true);
  const [measureMode, setMeasureMode] = useState<MeasureMode>("NONE");
  const [measurePoints, setMeasurePoints] = useState<any[]>([]);
  const [measureResult, setMeasureResult] = useState<string | null>(null);
  const [isCopiedUlpin, setIsCopiedUlpin] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Calculate Geodesic distance (Haversine in meters)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Calculate approximate polygon area in sq meters (Spherical polygon area approximation)
  const calculatePolygonArea = (points: [number, number][]) => {
    if (points.length < 3) return 0;
    const R = 6378137; // WGS84 major axis
    let area = 0;

    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      const p1 = points[i];
      const p2 = points[j];
      area +=
        (((p2[1] - p1[1]) * Math.PI) / 180) *
        (2 + Math.sin((p1[0] * Math.PI) / 180) + Math.sin((p2[0] * Math.PI) / 180));
    }
    area = (Math.abs(area) * R * R) / 2.0;
    return area;
  };

  // Initialize Map and Render Layers
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

      // Add Scale Bar bottom-left
      L.control.scale({ position: "bottomleft", imperial: false, maxWidth: 120 }).addTo(map);

      // Base tile layer
      const streetLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | NLAMS GIS Spatial Engine',
          maxZoom: 19,
        }
      ).addTo(map);

      baseTileLayerRef.current = streetLayer;

      // Layer groups for annotations and measurements
      measureLayerGroupRef.current = L.layerGroup().addTo(map);
      labelsLayerGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Filter features based on status and search
    const filteredFeatures = effectiveData.features.filter((f) => {
      const p = f.properties || {};
      const layerType = p.layer_type || "PARCEL";

      // If alignments are turned off and this is an alignment feature
      if (!showAlignments && layerType !== "PARCEL") return false;

      if (layerType === "PARCEL") {
        if (statusFilter === "ACQUIRED" && p.acquisition_status !== "ACQUIRED" && p.acquisition_status !== "POSSESSION_TAKEN") return false;
        if (statusFilter === "NOTIFIED" && p.acquisition_status !== "SECTION_11_NOTIFIED" && p.acquisition_status !== "SECTION_19_DECLARED") return false;
        if (statusFilter === "DISPUTED" && !p.is_disputed) return false;
        if (statusFilter === "SURVEY" && p.acquisition_status !== "VERIFICATION_PENDING" && p.verification_status !== "IN_PROGRESS") return false;

        if (searchKhasra.trim()) {
          const q = searchKhasra.toLowerCase().trim();
          const matchKhasra = p.khasra_number?.toLowerCase().includes(q);
          const matchUlpin = p.ulpin?.toLowerCase().includes(q);
          const matchOwner = p.owner_name?.toLowerCase().includes(q);
          const matchVillage = p.village_name?.toLowerCase().includes(q);
          if (!matchKhasra && !matchUlpin && !matchOwner && !matchVillage) {
            return false;
          }
        }
      }

      return true;
    });

    // Clear previous layers
    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }
    if (labelsLayerGroupRef.current) {
      labelsLayerGroupRef.current.clearLayers();
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
          const isAlignment = props.layer_type === "ROW_CENTERLINE";

          if (isAlignment) {
            return {
              color: "#2563eb",
              weight: 4,
              dashArray: "8, 6",
              opacity: 0.9,
            };
          }

          return {
            fillColor:
              props.fillColor ||
              (props.is_disputed
                ? "#ef4444"
                : props.acquisition_status === "ACQUIRED" || props.acquisition_status === "POSSESSION_TAKEN"
                ? "#138808"
                : "#10b981"),
            color: isSelected ? "#facc15" : (props.color || "#0a5c04"),
            weight: isSelected ? 4 : 2,
            opacity: 1,
            fillOpacity: isSelected ? 0.85 : 0.65,
          };
        },
        onEachFeature: (feature: any, layer: any) => {
          const props = feature.properties || {};
          const isAlignment = props.layer_type === "ROW_CENTERLINE";

          if (isAlignment) {
            layer.bindPopup(`
              <div style="font-family: inherit; min-width: 180px; padding: 4px;">
                <div style="font-weight: 800; font-size: 13px; color: #1e3a8a; margin-bottom: 4px;">
                  ${props.status_label || "Expressway Alignment"}
                </div>
                <div style="font-size: 11px; color: #475569;">
                  <div><strong>Chainage:</strong> ${props.chainage_km || "Km 142.0 to 148.5"}</div>
                  <div><strong>Status:</strong> ${props.verification_status || "Approved PostGIS Centerline"}</div>
                </div>
              </div>
            `);
            return;
          }

          // Add Khasra Number Centroid Label if enabled
          if (showLabels && props.centroid && props.khasra_number) {
            const labelIcon = L.divIcon({
              className: "khasra-map-badge",
              html: `<div style="
                background: rgba(15, 23, 42, 0.88);
                color: #ffffff;
                font-size: 10px;
                font-weight: 800;
                padding: 1px 5px;
                border-radius: 4px;
                border: 1px solid rgba(255, 255, 255, 0.4);
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                pointer-events: none;
                transform: translate(-50%, -50%);
              ">Kh. ${props.khasra_number}</div>`,
              iconSize: [0, 0],
            });
            L.marker([props.centroid[1], props.centroid[0]], { icon: labelIcon }).addTo(
              labelsLayerGroupRef.current
            );
          }

          const popupContent = `
            <div style="font-family: inherit; min-width: 230px; padding: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
                <span style="font-weight: 800; font-size: 13px; color: #0f172a;">Khasra #${props.khasra_number}</span>
                <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;">
                  ${props.village_name || "Village"}
                </span>
              </div>
              <div style="font-size: 11px; color: #475569; line-height: 1.6; margin-bottom: 8px;">
                ${props.ulpin ? `<div><strong>Bhu-Aadhaar:</strong> <code style="font-size:10px; background:#f1f5f9; padding:1px 4px; border-radius:3px;">${props.ulpin}</code></div>` : ""}
                <div><strong>Total Area:</strong> ${props.total_area_acres} Acres (${props.area_sqm ? (props.area_sqm).toLocaleString() + " m²" : ""})</div>
                <div><strong>Classification:</strong> ${props.land_type || "Chahi / Agricultural"}</div>
                <div><strong>Primary Owner:</strong> ${props.owner_name || "Record of Rights (ROR)"}</div>
                <div><strong>Status:</strong> <span style="font-weight: 700; color: ${props.color || '#138808'};">${props.status_label || props.acquisition_status}</span></div>
                ${props.is_disputed ? `<div style="color: #b91c1c; font-weight: 700; margin-top: 2px; background: #fee2e2; padding: 2px 4px; border-radius: 4px;">⚠️ Title Disputed: ${props.dispute_reason ? props.dispute_reason.slice(0, 45) + '...' : ''}</div>` : ""}
              </div>
              <a href="/land-parcels/${props.parcel_id}" style="display: block; text-align: center; background: #138808; color: #ffffff; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-decoration: none;">
                Inspect Khasra 360° Dossier →
              </a>
            </div>
          `;

          layer.bindPopup(popupContent);

          layer.on({
            click: () => {
              setActiveParcelDetails(props);
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

    // Force map size recalculation
    const t1 = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    const t2 = setTimeout(() => {
      map.invalidateSize();
    }, 600);

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
    showLabels,
    showAlignments,
  ]);

  // Handle Measurement Click Events on Map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const L = require("leaflet");
    const map = mapInstanceRef.current;

    const handleMapClick = (e: any) => {
      if (measureMode === "NONE") return;

      const latlng = e.latlng;
      const newPoints = [...measurePoints, [latlng.lat, latlng.lng]];
      setMeasurePoints(newPoints);

      if (!measureLayerGroupRef.current) return;
      measureLayerGroupRef.current.clearLayers();

      // Draw markers on vertices
      newPoints.forEach((pt, idx) => {
        const marker = L.circleMarker(pt, {
          radius: 5,
          color: "#ea580c",
          fillColor: "#ffffff",
          fillOpacity: 1,
          weight: 2,
        }).addTo(measureLayerGroupRef.current);

        marker.bindTooltip(`Point ${idx + 1}`, { permanent: false, direction: "top" });
      });

      if (measureMode === "DISTANCE") {
        if (newPoints.length >= 2) {
          L.polyline(newPoints, {
            color: "#ea580c",
            weight: 3,
            dashArray: "6, 6",
          }).addTo(measureLayerGroupRef.current);

          let totalDist = 0;
          for (let i = 0; i < newPoints.length - 1; i++) {
            totalDist += calculateDistance(
              newPoints[i][0],
              newPoints[i][1],
              newPoints[i + 1][0],
              newPoints[i + 1][1]
            );
          }

          const distText =
            totalDist >= 1000
              ? `${(totalDist / 1000).toFixed(2)} km`
              : `${Math.round(totalDist)} meters`;
          setMeasureResult(`Measured Distance: ${distText} (${newPoints.length} vertices)`);
        } else {
          setMeasureResult("Click another point along corridor to calculate distance...");
        }
      } else if (measureMode === "AREA") {
        if (newPoints.length >= 3) {
          L.polygon(newPoints, {
            color: "#ea580c",
            fillColor: "#ea580c",
            fillOpacity: 0.25,
            weight: 2,
          }).addTo(measureLayerGroupRef.current);

          const areaSqm = calculatePolygonArea(newPoints as [number, number][]);
          const areaAcres = areaSqm * 0.000247105;
          const areaBigha = areaAcres * 1.613; // Standard Northern India benchmark

          setMeasureResult(
            `Area: ${areaSqm.toLocaleString(undefined, { maximumFractionDigits: 1 })} m² | ${areaAcres.toFixed(3)} Acres | ${areaBigha.toFixed(2)} Bigha`
          );
        } else {
          setMeasureResult(`Click at least 3 points to close polygon area (${newPoints.length}/3)...`);
        }
      }
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [measureMode, measurePoints]);

  // Clear measurement layers
  const clearMeasurement = useCallback(() => {
    setMeasureMode("NONE");
    setMeasurePoints([]);
    setMeasureResult(null);
    if (measureLayerGroupRef.current) {
      measureLayerGroupRef.current.clearLayers();
    }
  }, []);

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
      tileUrl =
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attr = "Tiles &copy; Esri &mdash; High-Resolution Satellite & Aerial Imagery";
    } else if (type === "TOPO") {
      tileUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
      attr = 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap';
    } else if (type === "DARK") {
      tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      attr = '&copy; <a href="https://carto.com/attributions">CARTO</a>';
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

  const copyUlpin = (ulpin: string) => {
    navigator.clipboard.writeText(ulpin);
    setIsCopiedUlpin(true);
    setTimeout(() => setIsCopiedUlpin(false), 2000);
  };

  // Export GeoJSON
  const handleExportGeoJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(effectiveData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `cadastre_${effectiveData?.metadata?.project_id || "spatial"}_${Date.now()}.geojson`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-slate-700 shadow-xl bg-slate-950 w-full transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-[99999] rounded-none border-none h-screen" : ""
      }`}
      style={{
        height: isFullscreen ? "100vh" : height || "560px",
        minHeight: "480px",
        position: isFullscreen ? "fixed" : "relative",
      }}
    >
      {/* Top Interactive Ribbon */}
      {showControls && (
        <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Left: Project Spatial Status & Quick Search */}
          <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2 text-xs text-white">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span className="font-bold tracking-tight">
                {title || "Cadastral Layer"}: {effectiveData?.features?.length || 0} Parcels
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                EPSG:4326 PostGIS
              </span>
            </div>

            {/* Quick Search */}
            <div className="relative hidden sm:block">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Khasra / ULPIN / Owner..."
                value={searchKhasra}
                onChange={(e) => setSearchKhasra(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900/95 backdrop-blur-md border border-slate-700 text-xs text-white placeholder-slate-400 shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 w-52"
              />
              {searchKhasra && (
                <button
                  type="button"
                  onClick={() => setSearchKhasra("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Right: GIS Measurement Tools, Basemap Switcher & Fullscreen */}
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            {/* Measurement Tools */}
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-1 rounded-lg shadow-md flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (measureMode === "DISTANCE") clearMeasurement();
                  else {
                    clearMeasurement();
                    setMeasureMode("DISTANCE");
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold text-[11px] transition-colors ${
                  measureMode === "DISTANCE"
                    ? "bg-amber-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
                title="Measure distance ruler"
              >
                <Ruler className="h-3.5 w-3.5" />
                <span>Ruler</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (measureMode === "AREA") clearMeasurement();
                  else {
                    clearMeasurement();
                    setMeasureMode("AREA");
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold text-[11px] transition-colors ${
                  measureMode === "AREA"
                    ? "bg-amber-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
                title="Measure polygon area"
              >
                <Maximize className="h-3.5 w-3.5" />
                <span>Area</span>
              </button>

              {measureMode !== "NONE" && (
                <button
                  type="button"
                  onClick={clearMeasurement}
                  className="p-1 rounded text-red-400 hover:bg-slate-800 ml-0.5"
                  title="Clear measurement"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Overlays Toggle */}
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-1 rounded-lg shadow-md flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setShowLabels(!showLabels)}
                className={`px-2 py-1 rounded font-semibold text-[11px] flex items-center gap-1 transition-colors ${
                  showLabels ? "bg-slate-700 text-white" : "text-slate-400 hover:bg-slate-800"
                }`}
                title="Toggle Khasra ID labels on map"
              >
                <Tag className="h-3 w-3" />
                <span>Labels</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAlignments(!showAlignments)}
                className={`px-2 py-1 rounded font-semibold text-[11px] flex items-center gap-1 transition-colors ${
                  showAlignments ? "bg-slate-700 text-white" : "text-slate-400 hover:bg-slate-800"
                }`}
                title="Toggle Highway / Rail corridor alignment lines"
              >
                <Navigation className="h-3 w-3" />
                <span>RoW Line</span>
              </button>
            </div>

            {/* Basemap Switcher */}
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-1 rounded-lg shadow-md flex items-center gap-1 text-xs">
              {(["STREET", "SATELLITE", "TOPO", "DARK"] as BaseMapType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => switchBaseMap(type)}
                  className={`px-2 py-1 rounded font-semibold text-[11px] transition-colors ${
                    activeBaseMap === type
                      ? "bg-emerald-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {type === "STREET"
                    ? "Street"
                    : type === "SATELLITE"
                    ? "Satellite"
                    : type === "TOPO"
                    ? "Topo"
                    : "Dark"}
                </button>
              ))}

              <div className="h-3 w-px bg-slate-700 mx-0.5" />

              <button
                type="button"
                onClick={handleRecenter}
                className="p-1 rounded text-slate-300 hover:bg-slate-800"
                title="Fit to project corridor bounds"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={handleExportGeoJson}
                className="p-1 rounded text-slate-300 hover:bg-slate-800"
                title="Download GeoJSON Spatial file"
              >
                <Download className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1 rounded text-slate-300 hover:bg-slate-800"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-3.5 w-3.5 text-amber-400" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Measurement Banner */}
      {measureMode !== "NONE" && (
        <div className="absolute top-16 left-3 right-3 z-[400] pointer-events-none flex justify-center">
          <div className="pointer-events-auto bg-amber-950/90 border border-amber-600/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-xl flex items-center gap-3 text-xs text-amber-100 animate-fadeIn">
            <Ruler className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-white uppercase text-[10px] tracking-wider block">
                {measureMode === "DISTANCE" ? "Corridor Distance Ruler" : "Polygon Area Calculator"}
              </span>
              <p className="font-medium text-xs">
                {measureResult || "Click points on the map to start measuring..."}
              </p>
            </div>
            <button
              type="button"
              onClick={clearMeasurement}
              className="ml-2 px-2 py-1 rounded bg-amber-800 hover:bg-amber-700 text-[10px] font-bold text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Map Canvas */}
      <div ref={mapContainerRef} style={{ height: "100%", width: "100%", minHeight: "480px" }} />

      {/* In-Map 360° Inspector Flyout Drawer */}
      {activeParcelDetails && (
        <div className="absolute top-16 right-3 z-[450] w-80 max-w-[calc(100vw-24px)] bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 rounded-xl shadow-2xl p-4 text-white animate-fadeIn max-h-[calc(100%-80px)] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">
                  Khasra #{activeParcelDetails.khasra_number}
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: activeParcelDetails.is_disputed
                      ? "#7f1d1d"
                      : activeParcelDetails.acquisition_status === "ACQUIRED"
                      ? "#14532d"
                      : "#065f46",
                    color: "#ffffff",
                  }}
                >
                  {activeParcelDetails.status_label || activeParcelDetails.acquisition_status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeParcelDetails.village_name}
                {activeParcelDetails.tehsil_name ? `, Tehsil ${activeParcelDetails.tehsil_name}` : ""}
                {activeParcelDetails.district_name ? `, ${activeParcelDetails.district_name}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveParcelDetails(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ULPIN (Bhu-Aadhaar) */}
          {activeParcelDetails.ulpin && (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                  Bhu-Aadhaar (ULPIN)
                </span>
                <button
                  type="button"
                  onClick={() => copyUlpin(activeParcelDetails.ulpin)}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors"
                >
                  {isCopiedUlpin ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <code className="text-xs font-mono font-bold text-white block mt-1">
                {activeParcelDetails.ulpin}
              </code>
            </div>
          )}

          {/* Dispute Warning if any */}
          {activeParcelDetails.is_disputed && (
            <div className="bg-red-950/70 border border-red-800/80 rounded-lg p-2.5 mb-3 text-xs text-red-200 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-red-300 font-bold">Legal Dispute Flagged</strong>
                <p className="text-[11px] text-red-200 mt-0.5">
                  {activeParcelDetails.dispute_reason || "Title contention pending resolution."}
                </p>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="space-y-2 text-xs text-slate-300 mb-4">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Total Area:</span>
              <span className="font-semibold text-white">
                {activeParcelDetails.total_area_acres} Acres (
                {activeParcelDetails.area_sqm
                  ? `${activeParcelDetails.area_sqm.toLocaleString()} m²`
                  : `${Math.round(activeParcelDetails.total_area_acres * 4046.86).toLocaleString()} m²`}
                )
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Acquired Portion:</span>
              <span className="font-semibold text-white">
                {activeParcelDetails.acquired_area_acres || activeParcelDetails.total_area_acres} Acres
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Classification:</span>
              <span className="font-semibold text-white">
                {activeParcelDetails.land_type?.replace("_", " ") || "Chahi Agricultural"}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Primary Owner:</span>
              <span className="font-semibold text-white truncate max-w-[140px]" title={activeParcelDetails.owner_name}>
                {activeParcelDetails.owner_name || "Revenue Record (ROR)"}
              </span>
            </div>

            {/* Asset Enumeration */}
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Asset Inventory (Field Panchnama)
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="bg-slate-950/80 border border-slate-800 p-1.5 rounded-lg">
                  <Trees className="h-3.5 w-3.5 text-emerald-400 mx-auto mb-0.5" />
                  <span className="text-[10px] text-slate-400 block">Trees</span>
                  <span className="font-bold text-white text-xs">
                    {activeParcelDetails.trees_count ?? 0}
                  </span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-1.5 rounded-lg">
                  <Home className="h-3.5 w-3.5 text-amber-400 mx-auto mb-0.5" />
                  <span className="text-[10px] text-slate-400 block">Structures</span>
                  <span className="font-bold text-white text-xs">
                    {activeParcelDetails.structures_count ?? 0}
                  </span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-1.5 rounded-lg">
                  <Droplets className="h-3.5 w-3.5 text-blue-400 mx-auto mb-0.5" />
                  <span className="text-[10px] text-slate-400 block">Tube-wells</span>
                  <span className="font-bold text-white text-xs">
                    {activeParcelDetails.wells_count ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Assessed Compensation */}
            {activeParcelDetails.assessed_compensation_inr && (
              <div className="pt-2 bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-2.5 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-400 font-medium">Assessed Compensation:</span>
                  <span className="font-mono font-bold text-emerald-300 text-sm">
                    ₹{(activeParcelDetails.assessed_compensation_inr / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Includes 100% Solatium + Assets Valuation
                </div>
              </div>
            )}
          </div>

          {/* Action Link */}
          <Link
            href={`/land-parcels/${activeParcelDetails.parcel_id}`}
            className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-3 rounded-lg text-xs font-bold transition-colors shadow-md shadow-emerald-900/30"
          >
            <span>Open 360° Parcel Dossier</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Bottom Status Filter & Legend */}
      <div className="absolute bottom-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Filter Pills */}
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700/90 p-1 rounded-lg shadow-lg flex items-center gap-1 text-[11px]">
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
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700/90 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-3 text-[11px] text-white">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#138808]" />
            <span className="text-slate-300 font-semibold">Acquired</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#10b981]" />
            <span className="text-slate-300 font-semibold">Notified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#f59e0b]" />
            <span className="text-slate-300 font-semibold">Survey Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#ef4444]" />
            <span className="text-rose-400 font-bold">Disputed</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-slate-700 pl-2">
            <span className="h-0.5 w-4 bg-blue-500 inline-block" />
            <span className="text-blue-300 font-medium text-[10px]">RoW Alignment</span>
          </div>
        </div>
      </div>
    </div>
  );
}
