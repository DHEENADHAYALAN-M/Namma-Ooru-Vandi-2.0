import Layout from "@/components/Layout";
import { useBuses } from "@/hooks/use-buses";
import MapWrapper from "@/components/MapWrapper";
import { BusMarker } from "@/components/BusMarker";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertCircle, Bus as BusIcon, Users } from "lucide-react";

export default function AdminDashboard() {
  const { data: buses, isLoading } = useBuses();

  // Calculate metrics
  const totalBuses = buses?.length || 0;
  const activeBuses = buses?.filter(b => b.status === 'Running').length || 0;
  const totalPassengers = buses?.reduce((acc, b) => acc + b.passengerCount, 0) || 0;
  const alerts = buses?.filter(b => b.crowdLevel === 'High').length || 0;

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Top Metrics Bar */}
        <div className="bg-white border-b p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="p-2 bg-blue-500 text-white rounded-md">
              <BusIcon size={20} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-bold uppercase">Active Fleet</div>
              <div className="text-xl font-bold">{activeBuses} / {totalBuses}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="p-2 bg-green-500 text-white rounded-md">
              <Users size={20} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-bold uppercase">Total Pax</div>
              <div className="text-xl font-bold">{totalPassengers}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
            <div className="p-2 bg-red-500 text-white rounded-md">
              <AlertCircle size={20} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-bold uppercase">Crowd Alerts</div>
              <div className="text-xl font-bold">{alerts}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="p-2 bg-purple-500 text-white rounded-md">
              <Activity size={20} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-bold uppercase">System Status</div>
              <div className="text-xl font-bold text-purple-700">Online</div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* List View */}
          <div className="w-full md:w-1/3 border-r bg-white overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-bold mb-4 font-display">Fleet Status</h2>
              <div className="space-y-3">
                {buses?.map(bus => (
                  <Card key={bus.id} className="hover:bg-gray-50 transition-colors cursor-pointer border shadow-sm">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-lg">{bus.busNumber}</span>
                        <Badge variant={bus.status === 'Running' ? 'default' : 'secondary'}>
                          {bus.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">{bus.routeName}</div>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Users size={14} className="text-muted-foreground" />
                          <span className={bus.crowdLevel === 'High' ? 'text-red-600 font-bold' : ''}>
                            {bus.passengerCount} ({bus.crowdLevel})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600">
                          <Activity size={14} />
                          {bus.isLive ? 'Live ESP' : 'Simulated'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Map View */}
          <div className="flex-1 relative bg-gray-100">
            <MapWrapper className="w-full h-full z-0">
              {buses?.map((bus) => (
                <BusMarker key={bus.id} bus={bus} />
              ))}
            </MapWrapper>
          </div>
        </div>
      </div>
    </Layout>
  );
}
