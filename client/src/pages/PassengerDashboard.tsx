import Layout from "@/components/Layout";
import MapWrapper from "@/components/MapWrapper";
import { BusMarker } from "@/components/BusMarker";
import { useBuses } from "@/hooks/use-buses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Navigation, Users, MapPin, Wifi } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMap, Polyline, CircleMarker, Popup } from "react-leaflet";
import { api, buildUrl } from "@shared/routes";
import { RouteWithStops } from "@shared/schema";

function MapController({ selectedBus, isTracking }: { selectedBus: any; isTracking: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (selectedBus && isTracking) {
      map.setView([selectedBus.lat, selectedBus.lng], 16, { animate: true, duration: 1 });
    }
  }, [selectedBus?.lat, selectedBus?.lng, isTracking, map]);
  return null;
}

export default function PassengerDashboard() {
  const { data: buses, isLoading } = useBuses();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [route, setRoute] = useState<RouteWithStops | null>(null);

  // Auto-play: Select first bus and start tracking on mount
  useEffect(() => {
    if (buses && buses.length > 0 && !selectedId) {
      setSelectedId(buses[0].id);
      setIsTracking(true);
    }
  }, [buses, selectedId]);

  const filteredBuses = useMemo(() => buses?.filter(bus => 
    bus.busNumber.toLowerCase().includes(search.toLowerCase()) || 
    bus.routeName.toLowerCase().includes(search.toLowerCase())
  ) || [], [buses, search]);

  const selectedBus = useMemo(() => buses?.find(b => b.id === selectedId), [buses, selectedId]);

  useEffect(() => {
    if (selectedBus && isTracking) {
      fetch(buildUrl(api.routes.get.path, { id: selectedBus.routeId }))
        .then(res => res.json())
        .then(data => setRoute(data))
        .catch(() => setRoute(null));
    } else {
      setRoute(null);
    }
  }, [selectedId, isTracking]);

  return (
    <Layout>
      <div className="relative h-full w-full">
        <div className="absolute inset-0 z-0">
          <MapWrapper>
            <MapController selectedBus={selectedBus} isTracking={isTracking} />
            {isTracking && route && (
              <>
                <Polyline positions={route.path as any} color="#3b82f6" weight={4} opacity={0.6} />
                {route.stops.map((stop, idx) => (
                  <CircleMarker key={idx} center={stop.position as any} radius={6} fillColor="#10b981" color="#059669" weight={2}>
                    <Popup>{stop.name}</Popup>
                  </CircleMarker>
                ))}
              </>
            )}
            {buses?.map((bus) => (
              <BusMarker key={bus.id} bus={bus} onClick={() => setSelectedId(bus.id)} />
            ))}
          </MapWrapper>
        </div>

        <div className="absolute top-4 left-4 w-full max-w-sm z-[500] pointer-events-none flex flex-col gap-4 max-h-[calc(100vh-8rem)]">
          <div className="pointer-events-auto bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-xl border border-white/20">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search bus or route..." 
                className="pl-9 bg-transparent border-transparent focus-visible:ring-0 h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {(search || selectedBus) && (
            <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 overflow-hidden flex flex-col">
              <div className="p-3 border-b bg-gray-50/50">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {search ? 'Nearby Buses' : 'Bus Details'}
                </span>
              </div>
              <ScrollArea className="max-h-[60vh]">
                {search ? (
                  <div className="p-2 space-y-2">
                    {filteredBuses.map(bus => (
                      <div key={bus.id} onClick={() => { setSelectedId(bus.id); setSearch(""); }} className="p-3 rounded-lg cursor-pointer hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-slate-800">{bus.busNumber}</div>
                            <div className="text-xs text-muted-foreground">{bus.routeName}</div>
                          </div>
                          {bus.isLive && <Wifi size={14} className="text-blue-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedBus && (
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-blue-600 tracking-tight">{selectedBus.busNumber}</h2>
                        <p className="text-sm text-muted-foreground font-medium">{selectedBus.routeName}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Next Stop</div>
                        <div className="font-semibold text-slate-700">{selectedBus.nextStop}</div>
                        <div className="text-sm text-green-600 font-bold">{selectedBus.eta}</div>
                      </div>
                    </div>

                    {/* Stop Status Indicator */}
                    {selectedBus.atStop && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-amber-800">Bus stopped at {selectedBus.nextStop}</span>
                      </div>
                    )}

                    {/* Passenger Movement Data */}
                    {(selectedBus.boardedCount || selectedBus.boardedCount === 0) && selectedBus.atStop && (
                      <div className="grid grid-cols-2 gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <div>
                          <div className="text-[9px] font-bold uppercase text-blue-600 mb-1">Passengers In</div>
                          <div className="text-2xl font-bold text-blue-700">{selectedBus.boardedCount}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold uppercase text-red-600 mb-1">Passengers Out</div>
                          <div className="text-2xl font-bold text-red-700">{selectedBus.alightedCount}</div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 mb-1"><Users size={14} /><span className="text-[10px] font-bold uppercase">Load</span></div>
                        <div className="font-bold text-slate-700">{selectedBus.crowdLevel}</div>
                        <div className="text-xs text-slate-500 mt-1">{selectedBus.passengerCount} passengers</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 mb-1"><Navigation size={14} /><span className="text-[10px] font-bold uppercase">Status</span></div>
                        <div className="font-bold text-slate-700">{selectedBus.status}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 font-bold h-10" 
                        variant={isTracking ? "destructive" : "default"} 
                        onClick={() => setIsTracking(!isTracking)}
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        {isTracking ? 'Stop Tracking' : 'Track Live'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-10 px-4"
                        onClick={() => { setSelectedId(null); setIsTracking(false); }}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>
    </Layout>
  );
}
