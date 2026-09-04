"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { GisGeoJsonFeatureCollection, GisGeoJsonFeature } from "@/lib/types/parcel";
import { MapPin, Layers, ExternalLink, ShieldAlert } from "lucide-react";

export interface LeafletParcelMapProps {
  geojsonData?: GisGeoJsonFeatureCollection;
  geoJson?: GisGeoJsonFeatureCollection;
  selectedParcelId?: string;
  onSelectParcel?: (parcelId: string) => void;
  onParcelClick?: (parcelId: string) => void;
  height?: string;
}

export function LeafletParcelMap({
  geojsonData,
  geoJson,
  selectedParcelId,
  onSelectParcel,
  onParcelClick,
  height = "460px",
}: LeafletParcelMapProps) {
  const effectiveData = geojsonData || geoJson;
  const effectiveSelect = onSelectParcel || onParcelClick;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const geojsonLayerRef = useRef<any>(null);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    // Dynamically require leaflet to prevent SSR window issues
    const L = require("leaflet");

    // Fix default marker icon assets in Leaflet with webpack/next
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    if (!mapInstanceRef.current) {
      const center = effectiveData?.metadata?.center || [27.7050, 76.2050];
      const map = L.map(mapContainerRef.current, {
        center,
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Standard OpenStreetMap base layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | NLAMS GIS Engine',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove existing GeoJSON layer if any
    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }

    if (effectiveData && effectiveData.features && effectiveData.features.length > 0) {
      const geojsonLayer = L.geoJSON(effectiveData as any, {
        style: (feature: any) => {
          const props = feature.properties || {};
          const isSelected = selectedParcelId && props.parcel_id === selectedParcelId;

          return {
            fillColor: props.fillColor || "#10b981",
            color: isSelected ? "#000000" : (props.color || "#059669"),
            weight: isSelected ? 3 : 2,
            opacity: 1,
            fillOpacity: isSelected ? 0.85 : 0.6,
          };
        },
        onEachFeature: (feature: any, layer: any) => {
          const props = feature.properties || {};

          // Popup HTML content
          const popupContent = `
            <div style="font-family: inherit; min-width: 180px; padding: 2px;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
                <span style="font-weight: 700; font-size: 13px; color: #0f172a;">Khasra ${props.khasra_number}</span>
                <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: #f1f5f9; color: #334155;">
                  ${props.village_name || "Village"}
                </span>
              </div>
              <div style="font-size: 11px; color: #475569; line-height: 1.5; margin-bottom: 8px;">
                <div><strong>Total Area:</strong> ${props.total_area_acres} Acres</div>
                <div><strong>Acquired:</strong> ${props.acquired_area_acres} Acres</div>
                <div><strong>Status:</strong> <span style="font-weight: 600; color: ${props.color || '#0f172a'};">${props.status_label || props.acquisition_status}</span></div>
                <div><strong>Survey:</strong> ${props.verification_status}</div>
                ${props.is_disputed ? '<div style="color: #b91c1c; font-weight: 700; margin-top: 2px;">⚠️ Title Disputed</div>' : ''}
              </div>
              <a href="/land-parcels/${props.parcel_id}" style="display: block; text-align: center; background: #138808; color: #ffffff; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-decoration: none;">
                Open Parcel 360° →
              </a>
            </div>
          `;

          layer.bindPopup(popupContent);

          layer.on({
            click: () => {
              if (effectiveSelect && props.parcel_id) {
                effectiveSelect(props.parcel_id);
              }
            },
            mouseover: (e: any) => {
              const l = e.target;
              l.setStyle({ weight: 3, fillOpacity: 0.8 });
            },
            mouseout: (e: any) => {
              geojsonLayer.resetStyle(e.target);
            },
          });
        },
      }).addTo(map);

      geojsonLayerRef.current = geojsonLayer;

      // Fit map bounds to encompass all parcel polygons
      const bounds = geojsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    }

    return () => {
      // Clean up on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [effectiveData, selectedParcelId, effectiveSelect]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-xs border border-slate-200 px-3 py-1.5 rounded-md shadow-sm flex items-center gap-2 text-xs">
        <Layers className="h-3.5 w-3.5 text-[#138808]" />
        <span className="font-semibold text-slate-800">
          Cadastral Layer: {effectiveData?.features?.length || 0} Parcels
        </span>
        <span className="text-slate-400">|</span>
        <span className="text-[11px] text-slate-500">EPSG:4326 (PostGIS)</span>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} style={{ height, width: "100%" }} />

      {/* Bottom Status Legend */}
      <div className="absolute bottom-3 right-3 z-[400] bg-white/95 backdrop-blur-xs border border-slate-200 px-3 py-2 rounded-md shadow-md text-xs">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Acquisition Status Legend
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#138808]" />
            <span className="text-slate-700 font-medium">Acquired / Disbursed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#10b981]" />
            <span className="text-slate-700 font-medium">Notified / Proposed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#f59e0b]" />
            <span className="text-slate-700 font-medium">Field Verified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#ef4444]" />
            <span className="text-rose-700 font-medium">Disputed / Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}
