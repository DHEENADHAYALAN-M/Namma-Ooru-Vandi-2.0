import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { ReactNode } from "react";

// Chennai coordinates
const CHENNAI_CENTER: LatLngExpression = [13.0827, 80.2707];

interface MapWrapperProps {
  children: ReactNode;
  center?: LatLngExpression;
  zoom?: number;
  className?: string;
}

export default function MapWrapper({ 
  children, 
  center = CHENNAI_CENTER, 
  zoom = 13,
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
