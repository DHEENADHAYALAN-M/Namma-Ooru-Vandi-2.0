import Layout from "@/components/Layout";
import MapWrapper from "@/components/MapWrapper";
import { BusMarker } from "@/components/BusMarker";
import { useBuses } from "@/hooks/use-buses";
import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PassengerDashboard() {
  const { data: buses } = useBuses();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <Layout>
      <div className="flex h-full bg-slate-50 overflow-hidden">
        <div className="w-72 flex flex-col bg-white border-r border-slate-200">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Available Buses</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {buses?.map(bus => (
                <button
                  key={bus.id}
                  onClick={() => setSelectedId(bus.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedId === bus.id 
                      ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' 
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="font-bold text-sm">{bus.busNumber}</div>
                  <div className="text-[11px] opacity-70">{bus.routeName}</div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        <div className="flex-1 relative bg-slate-100">
          <MapWrapper>
            {buses?.map(bus => (
              <BusMarker 
                key={bus.id} 
                bus={bus} 
                onClick={() => setSelectedId(bus.id)} 
              />
            ))}
          </MapWrapper>
        </div>
      </div>
    </Layout>
  );
}
