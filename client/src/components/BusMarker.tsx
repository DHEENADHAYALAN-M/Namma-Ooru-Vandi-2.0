import { Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import { Bus, CROWD_LEVEL, BUS_STATUS } from "@shared/schema";
import { Bus as BusIcon, Users, Navigation, Wifi } from "lucide-react";
import { renderToString } from "react-dom/server";
import { useState, useEffect } from "react";

interface BusMarkerProps {
  bus: Bus;
  onClick?: () => void;
}

export function BusMarker({ bus, onClick }: BusMarkerProps) {
  const [displayPos, setDisplayPos] = useState<[number, number]>([bus.lat, bus.lng]);
  const [prevPos, setPrevPos] = useState<[number, number]>([bus.lat, bus.lng]);
  const [startTime, setStartTime] = useState<number>(0);
  const [bearing, setBearing] = useState<number>(0);

  useEffect(() => {
    if (prevPos[0] !== bus.lat || prevPos[1] !== bus.lng) {
      const lat1 = displayPos[0];
      const lon1 = displayPos[1];
      const lat2 = bus.lat;
      const lon2 = bus.lng;
      
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const lat1Rad = lat1 * Math.PI / 180;
      const lat2Rad = lat2 * Math.PI / 180;

      const y = Math.sin(dLon) * Math.cos(lat2Rad);
      const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
                Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
      const newBearing = Math.atan2(y, x) * 180 / Math.PI;
      setBearing((newBearing + 360) % 360);
      
      setPrevPos(displayPos);
      setStartTime(Date.now());
    }
  }, [bus.lat, bus.lng, displayPos, prevPos]);

  useEffect(() => {
    if (startTime === 0) return;

    const animationDuration = 2000;
    let animationFrameId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      const newLat = prevPos[0] + (bus.lat - prevPos[0]) * progress;
      const newLng = prevPos[1] + (bus.lng - prevPos[1]) * progress;
      
      setDisplayPos([newLat, newLng]);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayPos([bus.lat, bus.lng]);
        setStartTime(0);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [startTime, bus.lat, bus.lng, prevPos]);

  const isCrowded = bus.crowdLevel === CROWD_LEVEL.HIGH;
  const isMedium = bus.crowdLevel === CROWD_LEVEL.MEDIUM;
  const isRunning = bus.status === BUS_STATUS.RUNNING;
  
  let colorClass = "text-green-600 bg-green-100 border-green-600";
  if (isCrowded) colorClass = "text-red-600 bg-red-100 border-red-600";
  else if (isMedium) colorClass = "text-yellow-600 bg-yellow-100 border-yellow-600";

  const iconHtml = renderToString(
    <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-lg hover:scale-110 transition-transform ${colorClass}`}>
      <div style={ { transform: `rotate(${isRunning ? bearing : 0}deg)`, transition: 'transform 0.3s ease-out' } }>
        <BusIcon size={20} strokeWidth={2.5} />
      </div>
      {bus.isLive && (
        <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 ring-2 ring-white">
          <Wifi size={10} className="text-white" />
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
    <Marker position={displayPos} icon={customIcon} eventHandlers={{ click: onClick }}>
      <Popup className="font-sans">
        <div className="min-w-[200px] p-2">
          <h3 className="font-bold text-lg">{bus.busNumber}</h3>
          <p className="text-sm text-muted-foreground">{bus.routeName}</p>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Users size={14} />
              <span>Passengers: {bus.passengerCount} ({bus.crowdLevel})</span>
            </div>
            <div className="flex items-center gap-2">
              <Navigation size={14} />
              <span>Next: {bus.nextStop} (ETA: {bus.eta})</span>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
