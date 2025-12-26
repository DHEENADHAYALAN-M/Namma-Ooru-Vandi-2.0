import Layout from "@/components/Layout";
import MapWrapper from "@/components/MapWrapper";
import { BusMarker } from "@/components/BusMarker";
import { useBuses } from "@/hooks/use-buses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Navigation, Users, MapPin } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMap } from "react-leaflet";
import { Polyline, CircleMarker, Popup } from "react-leaflet";
import { api, buildUrl } from "@shared/routes";
import { RouteWithStops } from "@shared/schema";

function MapController({ center, isTracking }: { center: [number, number] | null; isTracking: boolean }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && isTracking) {
      // Zoom in and center on bus while tracking
      map.setView(center, 16, { animate: true, duration: 0.5 });
    }
  }, [center, isTracking, map]);
  
  return null;
}

export default function PassengerDashboard() {
  const { data: buses, isLoading } = useBuses();
  const [search, setSearch] = useState("");
  const [selectedBusId, setSelectedBusId] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [route, setRoute] = useState<RouteWithStops | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const filteredBuses = useMemo(() => buses?.filter(bus => 
    bus.busNumber.toLowerCase().includes(search.toLowerCase()) || 
    bus.routeName.toLowerCase().includes(search.toLowerCase())
  ) || [], [buses, search]);

  const selectedBus = useMemo(() => buses?.find(b => b.id === selectedBusId), [buses, selectedBusId]);

  // Fetch route when bus is selected
  useEffect(() => {
    if (selectedBus && isTracking) {
      setRouteLoading(true);
      fetch(buildUrl(api.routes.get.path, { id: selectedBus.routeId }))
        .then(res => res.json())
        .then(data => {
          setRoute(data);
          setRouteLoading(false);
        })
        .catch(() => setRouteLoading(false));
    }
  }, [selectedBus?.id, isTracking, selectedBus?.routeId]);

  return (
    <Layout>
      <div className="relative h-full w-full">
        {/* Map Layer */}
        <div className="absolute inset-0 z-0">
          <MapWrapper>
            {selectedBus && <MapController center={[selectedBus.lat, selectedBus.lng]} isTracking={isTracking} />}
            
            {/* Route Polyline and Stops */}
            {isTracking && route && (
              <>
                <Polyline 
                  positions={route.path as any} 
                  color="#3b82f6" 
                  weight={4}
                  opacity={0.8}
                  className="route-line"
                />
                {/* Bus Stops */}
                {route.stops.map((stop, idx) => (
                  <CircleMarker
                    key={idx}
                    center={stop.position as any}
                    radius={6}
                    fillColor="#10b981"
                    color="#059669"
                    weight={2}
                    opacity={0.8}
                    fillOpacity={0.7}
                  >
                    <Popup>{stop.name}</Popup>
                  </CircleMarker>
                ))}
              </>
            )}
            
            {buses?.map((bus) => (
              <BusMarker 
                key={bus.id} 
                bus={bus} 
                onClick={() => setSelectedBusId(bus.id)} 
              />
            ))}
          </MapWrapper>
        </div>

        {/* Floating Sidebar / Overlay */}
        <div className="absolute top-4 left-4 w-full max-w-sm z-[500] pointer-events-none flex flex-col gap-4 max-h-[calc(100vh-8rem)]">
          {/* Search Bar */}
          <div className="pointer-events-auto bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-xl border border-white/20">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search bus number or route..." 
                className="pl-9 bg-transparent border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Results List */}
          {search && (
            <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 overflow-hidden flex-1 flex flex-col">
              <div className="p-3 border-b bg-gray-50/50">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nearby Buses</span>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                  {filteredBuses.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">No buses found</div>
                  ) : (
                    filteredBuses.map(bus => (
                      <div 
                        key={bus.id}
                        onClick={() => {
                          setSelectedBusId(bus.id);
                          setSearch("");
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-all border ${
                          selectedBusId === bus.id 
                            ? 'bg-primary/5 border-primary/20 shadow-sm' 
                            : 'hover:bg-gray-50 border-transparent hover:border-gray-100'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-foreground">{bus.busNumber}</div>
                            <div className="text-xs text-muted-foreground">{bus.routeName}</div>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            bus.crowdLevel === 'High' ? 'bg-red-100 text-red-700' :
                            bus.crowdLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {bus.crowdLevel} Crowd
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Selected Bus Detail Card */}
          {selectedBus && !search && (
            <Card className="pointer-events-auto shadow-2xl animate-in slide-in-from-left-5 border-t-4 border-t-primary">
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-primary font-display">{selectedBus.busNumber}</h2>
                    <p className="text-muted-foreground font-medium">{selectedBus.routeName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground font-bold uppercase">Next Stop</div>
                    <div className="font-semibold">{selectedBus.nextStop}</div>
                    <div className="text-sm text-green-600 font-bold">{selectedBus.eta}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Users size={14} />
                      <span className="text-xs font-bold uppercase">Load</span>
                    </div>
                    <div className={`text-lg font-bold ${
                      selectedBus.crowdLevel === 'High' ? 'text-red-600' : 
                      selectedBus.crowdLevel === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {selectedBus.crowdLevel}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                     <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Navigation size={14} />
                      <span className="text-xs font-bold uppercase">Status</span>
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {selectedBus.status}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className={`flex-1 font-bold ${isTracking ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-primary text-white hover:bg-primary/90'}`}
                    onClick={() => {
                      setIsTracking(!isTracking);
                      if (!isTracking) {
                        // Trigger re-focus
                        setSelectedBusId(null);
                        setTimeout(() => setSelectedBusId(selectedBus.id), 50);
                      }
                    }}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    {isTracking ? 'Stop Tracking' : 'Track Live'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedBusId(null);
                      setIsTracking(false);
                      setRoute(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="font-bold text-primary">Locating buses...</span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
