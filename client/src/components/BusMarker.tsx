import { Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import { Bus } from "@shared/schema";
import { Bus as BusIcon } from "lucide-react";
import { renderToString } from "react-dom/server";
import { useState, useEffect } from "react";

export function BusMarker({ bus, onClick }: { bus: Bus; onClick?: () => void }) {
  const [pos, setPos] = useState<[number, number]>([bus.lat, bus.lng]);

  useEffect(() => {
    setPos([bus.lat, bus.lng]);
  }, [bus.lat, bus.lng]);

  const icon = divIcon({
    html: renderToString(
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white shadow-md border-2 border-white transition-all duration-1000">
        <BusIcon size={16} />
      </div>
    ),
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <Marker position={pos} icon={icon} eventHandlers={{ click: onClick }}>
      <Popup>
        <div className="p-1 font-sans">
          <p className="font-bold">{bus.busNumber}</p>
          <p className="text-xs">{bus.routeName}</p>
        </div>
      </Popup>
    </Marker>
  );
}
