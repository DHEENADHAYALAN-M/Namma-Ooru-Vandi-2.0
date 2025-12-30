import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Bus, BUS_STATUS } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Fetch all buses with polling for real-time updates
export function useBuses() {
  return useQuery({
    queryKey: [api.buses.list.path],
    queryFn: async () => {
      const res = await fetch(api.buses.list.path);
      if (!res.ok) throw new Error("Failed to fetch buses");
      return api.buses.list.responses[200].parse(await res.json());
    },
    refetchInterval: 500, // Poll every 500ms for smooth movement
  });
}

// Fetch single bus details
export function useBus(id: number) {
  return useQuery({
    queryKey: [api.buses.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.buses.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch bus details");
      return api.buses.get.responses[200].parse(await res.json());
    },
    refetchInterval: 500,
    enabled: !!id,
  });
}

// Driver: Update bus status (Start/Stop)
export function useUpdateBusStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: typeof BUS_STATUS[keyof typeof BUS_STATUS] }) => {
      const url = buildUrl(api.buses.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.buses.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update status");
      }
      return api.buses.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.buses.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.buses.get.path, data.id] });
      toast({
        title: "Status Updated",
        description: `Bus is now ${data.status}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
