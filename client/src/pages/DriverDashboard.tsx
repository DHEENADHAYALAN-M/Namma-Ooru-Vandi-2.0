import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateBusStatus, useBus } from "@/hooks/use-buses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BUS_STATUS } from "@shared/schema";
import { Play, Square, Users, Navigation, MapPin, Wifi, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DriverDashboard() {
  const { user } = useAuth();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateBusStatus();
  
  // Mock: Assign bus ID 1 to the driver for demo purposes
  const assignedBusId = 1;
  const { data: bus, isLoading } = useBus(assignedBusId);

  const isRunning = bus?.status === BUS_STATUS.RUNNING;

  const handleStatusToggle = () => {
    if (!bus) return;
    const newStatus = isRunning ? BUS_STATUS.STOPPED : BUS_STATUS.RUNNING;
    updateStatus({ id: bus.id, status: newStatus });
  };

  if (isLoading) return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    </Layout>
  );

  if (!bus) return <div>Bus not found</div>;

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">Driver Dashboard</h1>
            <p className="text-muted-foreground">Route: <span className="font-semibold text-primary">{bus.routeName}</span></p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
            {bus.isLive ? <Wifi className="animate-pulse" size={18} /> : <AlertTriangle size={18} />}
            <span className="font-bold text-sm">
              {bus.isLive ? "ESP Connected" : "Simulation Mode"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Controls */}
          <Card className="border-t-4 border-t-primary shadow-lg">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Trip Controls</span>
                <span className={`px-3 py-1 rounded-full text-sm ${isRunning ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {bus.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex flex-col">
                  <span className="font-bold text-lg">Bus Status</span>
                  <span className="text-sm text-muted-foreground">Toggle to start/stop trip</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${!isRunning ? 'text-muted-foreground' : 'text-green-600'}`}>
                    {isRunning ? "RUNNING" : "STOPPED"}
                  </span>
                  <Switch 
                    checked={isRunning}
                    onCheckedChange={handleStatusToggle}
                    disabled={isUpdating}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  size="lg" 
                  className={`h-24 text-xl flex flex-col gap-2 ${isRunning ? 'opacity-50' : ''}`}
                  variant="outline"
                  onClick={() => updateStatus({ id: bus.id, status: BUS_STATUS.RUNNING })}
                  disabled={isRunning || isUpdating}
                >
                  <Play size={32} className="text-green-600" fill="currentColor" />
                  Start Trip
                </Button>
                <Button 
                  size="lg" 
                  className={`h-24 text-xl flex flex-col gap-2 ${!isRunning ? 'opacity-50' : ''}`}
                  variant="outline"
                  onClick={() => updateStatus({ id: bus.id, status: BUS_STATUS.STOPPED })}
                  disabled={!isRunning || isUpdating}
                >
                  <Square size={32} className="text-red-600" fill="currentColor" />
                  Stop Trip
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Live Metrics */}
          <div className="space-y-6">
            <Card className="shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="text-primary" />
                  Live Passenger Count
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-6">
                  <div className="text-center">
                    <span className="text-6xl font-display font-bold text-foreground block">
                      {bus.passengerCount}
                    </span>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-bold ${
                      bus.crowdLevel === 'High' ? 'bg-red-100 text-red-700' :
                      bus.crowdLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {bus.crowdLevel} Density
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Navigation size={20} />
                    <span className="font-bold text-sm uppercase">Next Stop</span>
                  </div>
                  <span className="text-primary font-bold">{bus.eta}</span>
                </div>
                <div className="text-2xl font-bold">{bus.nextStop}</div>
                <div className="mt-4 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-full w-2/3 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
