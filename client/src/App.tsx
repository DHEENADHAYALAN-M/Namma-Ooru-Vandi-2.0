import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { SplashScreen } from "@/components/SplashScreen";
import Login from "@/pages/Login";
import PassengerDashboard from "@/pages/PassengerDashboard";
import DriverDashboard from "@/pages/DriverDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

function ProtectedRoute({ component: Component, allowedRoles }: { component: any, allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to="/dashboard" />; // Default to passenger dashboard if unauthorized
  }

  return <Component />;
}

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      {/* Public Route - Login */}
      <Route path="/">
        {user ? (
           // Redirect logged-in users to their respective dashboards
           user.role === 'driver' ? <Redirect to="/driver" /> :
           user.role === 'admin' ? <Redirect to="/admin" /> :
           <Redirect to="/dashboard" />
        ) : (
          <Login />
        )}
      </Route>

      {/* Role-based Routes */}
      <Route path="/dashboard">
        <ProtectedRoute component={PassengerDashboard} allowedRoles={['passenger', 'admin']} />
      </Route>
      
      <Route path="/driver">
        <ProtectedRoute component={DriverDashboard} allowedRoles={['driver', 'admin']} />
      </Route>
      
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} allowedRoles={['admin']} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide splash screen after 1.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SplashScreen isVisible={showSplash} />
        <Toaster />
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
