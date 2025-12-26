import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoginSchema } from "@shared/schema";
import { Bus, Shield, User } from "lucide-react";
import Layout from "@/components/Layout";

export default function Login() {
  const { login, isLoading } = useAuth();
  
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof LoginSchema>) {
    login(values);
  }

  return (
    <Layout>
      <div className="flex items-center justify-center h-full bg-gray-50/50 p-4">
        {/* Decorative Background */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Chennai_Central_Railway_Station.jpg/1200px-Chennai_Central_Railway_Station.jpg')] bg-cover bg-center filter grayscale contrast-150" />
        </div>

        <div className="w-full max-w-md z-10 grid gap-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Welcome Aboard</h1>
            <p className="text-muted-foreground">Log in to access real-time transit data</p>
          </div>

          <Card className="border-border/50 shadow-xl shadow-primary/5 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter username..." {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Authenticating..." : "Sign In"}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="text-center p-2 rounded-lg bg-gray-50 border border-gray-100">
                  <User className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <div className="text-[10px] text-muted-foreground font-medium">Passenger</div>
                  <div className="text-[10px] text-gray-400">user / pass</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50 border border-gray-100">
                  <Bus className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                  <div className="text-[10px] text-muted-foreground font-medium">Driver</div>
                  <div className="text-[10px] text-gray-400">driver / pass</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50 border border-gray-100">
                  <Shield className="w-5 h-5 mx-auto mb-1 text-red-500" />
                  <div className="text-[10px] text-muted-foreground font-medium">Admin</div>
                  <div className="text-[10px] text-gray-400">admin / pass</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
