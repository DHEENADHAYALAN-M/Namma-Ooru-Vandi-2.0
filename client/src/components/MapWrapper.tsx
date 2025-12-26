import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { ReactNode } from "react";

// Trichy coordinates for Demo GPS Mode
const TRICHY_CENTER: LatLngExpression = [10.8160, 78.6820];

interface MapWrapperProps {
  children: ReactNode;
  center?: LatLngExpression;
  zoom?: number;
  className?: string;
}

export default function MapWrapper({ 
  children, 
  center = TRICHY_CENTER, 
  zoom = 14,
  className = "w-full h-full" 
}: MapWrapperProps) {
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      scrollWheelZoom={true} 
      className={className}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      {children}
    </MapContainer>
  );
}
