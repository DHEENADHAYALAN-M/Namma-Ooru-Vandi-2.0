import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bus, Shield, User } from "lucide-react";
import Layout from "@/components/Layout";
import { ROLE } from "@shared/schema";

export default function Login() {
  const { login, isLoading } = useAuth();
  
  const handleRoleSelection = (role: typeof ROLE[keyof typeof ROLE]) => {
    login({ role });
  };

  return (
    <Layout>
      <div className="flex items-center justify-center h-full bg-gray-50/50 p-4">
        {/* Decorative Background */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Chennai_Central_Railway_Station.jpg/1200px-Chennai_Central_Railway_Station.jpg')] bg-cover bg-center filter grayscale contrast-150" />
        </div>

        <div className="w-full max-w-4xl z-10 grid gap-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold font-display tracking-tight text-foreground">Namma Ooru Vandi</h1>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">Real-time public transport tracking for a smarter Chennai</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              className="border-border/50 shadow-lg hover:shadow-primary/10 transition-all cursor-pointer group hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
              onClick={() => handleRoleSelection(ROLE.PASSENGER)}
              data-testid="card-passenger-mode"
            >
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Passenger</CardTitle>
                <CardDescription>Track live buses and plan your journey</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors" disabled={isLoading} data-testid="button-passenger-mode">
                  Explore Map
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="border-border/50 shadow-lg hover:shadow-orange-500/10 transition-all cursor-pointer group hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
              onClick={() => handleRoleSelection(ROLE.DRIVER)}
              data-testid="card-driver-mode"
            >
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                  <Bus className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-2xl font-bold">Driver</CardTitle>
                <CardDescription>Update trip status and passenger count</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" className="w-full mt-4 group-hover:bg-orange-600 group-hover:text-white transition-colors" disabled={isLoading} data-testid="button-driver-mode">
                  Access Console
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="border-border/50 shadow-lg hover:shadow-red-500/10 transition-all cursor-pointer group hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
              onClick={() => handleRoleSelection(ROLE.ADMIN)}
              data-testid="card-admin-mode"
            >
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl font-bold">Admin</CardTitle>
                <CardDescription>Manage fleet and monitor operations</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" className="w-full mt-4 group-hover:bg-red-600 group-hover:text-white transition-colors" disabled={isLoading} data-testid="button-admin-mode">
                  System Overview
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
