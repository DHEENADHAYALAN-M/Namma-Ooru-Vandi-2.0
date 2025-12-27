import { Bus, User, RouteWithStops, ROLE, BUS_STATUS, CROWD_LEVEL } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getAllBuses(): Promise<Bus[]>;
  getBus(id: number): Promise<Bus | undefined>;
  getRoute(id: number): Promise<RouteWithStops | undefined>;
  updateBusStatus(id: number, status: string): Promise<Bus>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private buses: Map<number, Bus>;
  private routes: RouteWithStops[];
  private busIndices: Map<number, number> = new Map();

  constructor() {
    this.users = new Map();
    this.buses = new Map();
    this.routes = [
      {
        id: 1,
        name: "Route 1: Central → Thillai Nagar",
        path: [[10.816, 78.682], [10.820, 78.685], [10.825, 78.690], [10.830, 78.685]],
        stops: [
          { name: "Central", position: [10.816, 78.682] },
          { name: "Thillai Nagar", position: [10.830, 78.685] }
        ]
      },
      {
        id: 2,
        name: "Route 2: Central → Srirangam",
        path: [[10.816, 78.682], [10.835, 78.700], [10.858, 78.695], [10.865, 78.692]],
        stops: [
          { name: "Central", position: [10.816, 78.682] },
          { name: "Srirangam", position: [10.865, 78.692] }
        ]
      }
    ];
    this.initializeUsers();
    this.initializeBuses();
    setInterval(() => this.simulate(), 3000);
  }

  private initializeUsers() {
    this.users.set(1, { id: 1, role: ROLE.PASSENGER, name: "User" });
    this.users.set(2, { id: 2, role: ROLE.DRIVER, name: "Driver" });
  }

  private initializeBuses() {
    this.routes.forEach((r, i) => {
      this.buses.set(i + 1, {
        id: i + 1,
        busNumber: `B-${100 + i}`,
        routeId: r.id,
        routeName: r.name,
        lat: r.path[0][0],
        lng: r.path[0][1],
        passengerCount: 10,
        crowdLevel: CROWD_LEVEL.LOW,
        status: BUS_STATUS.RUNNING,
        isLive: true,
        nextStop: r.stops[1].name,
        eta: "5m",
        lastUpdated: new Date().toISOString()
      });
      this.busIndices.set(i + 1, 0);
    });
  }

  private simulate() {
    this.buses.forEach(bus => {
      const r = this.routes.find(route => route.id === bus.routeId);
      if (!r || bus.status !== BUS_STATUS.RUNNING) return;
      let idx = (this.busIndices.get(bus.id) || 0) + 1;
      if (idx >= r.path.length) idx = 0;
      this.busIndices.set(bus.id, idx);
      [bus.lat, bus.lng] = r.path[idx];
      bus.lastUpdated = new Date().toISOString();
    });
  }

  async getUser(id: number) { return this.users.get(id); }
  async getAllBuses() { return Array.from(this.buses.values()); }
  async getBus(id: number) { return this.buses.get(id); }
  async getRoute(id: number) { return this.routes.find(r => r.id === id); }
  async updateBusStatus(id: number, status: string) {
    const bus = this.buses.get(id);
    if (bus) bus.status = status as any;
    return bus!;
  }
}

export const storage = new MemStorage();
