import { Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import { Bus, CROWD_LEVEL, BUS_STATUS } from "@shared/schema";
import { Bus as BusIcon, Users, Navigation, Wifi } from "lucide-react";
import { renderToString } from "react-dom/server";

interface BusMarkerProps {
  bus: Bus;
  onClick?: () => void;
}

export function BusMarker({ bus, onClick }: BusMarkerProps) {
  const isCrowded = bus.crowdLevel === CROWD_LEVEL.HIGH;
  const isMedium = bus.crowdLevel === CROWD_LEVEL.MEDIUM;
  
  // Determine color based on crowd/status
  let colorClass = "text-green-600 bg-green-100 border-green-600";
  if (isCrowded) colorClass = "text-red-600 bg-red-100 border-red-600";
  else if (isMedium) colorClass = "text-yellow-600 bg-yellow-100 border-yellow-600";

  if (bus.status === BUS_STATUS.STOPPED) {
    colorClass = "text-gray-500 bg-gray-100 border-gray-400 opacity-80";
  }

  // Create custom HTML icon
  const iconHtml = renderToString(
    <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-lg transition-transform hover:scale-110 ${colorClass}`}>
      {bus.status === BUS_STATUS.RUNNING && (
        <div className={`pulse-ring ${isCrowded ? 'text-red-500' : 'text-green-500'}`}></div>
      )}
      <BusIcon size={20} strokeWidth={2.5} />
      {bus.isLive && (
        <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white font-bold ring-2 ring-white">
          <Wifi size={10} />
        </div>
      )}
    </div>
  );

  const customIcon = divIcon({
    html: iconHtml,
    className: "custom-marker-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  return (
    <Marker 
      position={[bus.lat, bus.lng]} 
      icon={customIcon}
      eventHandlers={{ click: onClick }}
    >
      <Popup className="font-sans">
        <div className="min-w-[200px] p-2">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg leading-none">{bus.busNumber}</h3>
              <p className="text-sm text-muted-foreground font-medium">{bus.routeName}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              bus.status === 'Running' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {bus.status}
            </span>
          </div>

          <div className="space-y-2 mt-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={16} />
              <span className="flex-1">Passengers:</span>
              <span className={`font-bold ${isCrowded ? 'text-red-600' : 'text-foreground'}`}>
                {bus.passengerCount} ({bus.crowdLevel})
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Navigation size={16} />
              <span className="flex-1">Next Stop:</span>
              <span className="font-medium">{bus.nextStop}</span>
            </div>

            <div className="pt-2 border-t mt-2 flex justify-between items-center text-xs text-muted-foreground">
              <span>ETA: {bus.eta}</span>
              {bus.isLive ? (
                <span className="flex items-center text-blue-600 font-medium">
                  <Wifi size={12} className="mr-1" /> Live GPS
                </span>
              ) : (
                <span>Simulated</span>
              )}
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
