import { Bus, User, Route, RouteWithStops, ROLE, BUS_STATUS, CROWD_LEVEL } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getAllBuses(): Promise<Bus[]>;
  getBus(id: number): Promise<Bus | undefined>;
  getRoute(id: number): Promise<RouteWithStops | undefined>;
  updateBusStatus(id: number, status: string): Promise<Bus>;
  updateBusEsp(id: number, lat?: number, lng?: number, count?: number): Promise<void>;
  simulateMovement(): void;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private buses: Map<number, Bus>;
  private routes: Route[];
  private busIndices: Map<number, number> = new Map();

  constructor() {
    this.users = new Map();
    this.buses = new Map();
    this.routes = this.initializeRoutes();
    this.initializeUsers();
    this.initializeBuses();

    setInterval(() => this.simulateMovement(), 2000);
  }

  private initializeRoutes(): Route[] {
    return [
      {
        id: 1,
        name: "Route 1: Central Bus Stand → Thillai Nagar",
        stops: ["Central Bus Stand", "Main Guard Gate", "Thillai Nagar"],
        path: [
          [10.8160, 78.6820], [10.8180, 78.6840], [10.8200, 78.6860], [10.8220, 78.6880],
          [10.8240, 78.6900], [10.8260, 78.6920], [10.8280, 78.6920], [10.8300, 78.6900],
          [10.8320, 78.6850], [10.8300, 78.6870], [10.8280, 78.6920], [10.8250, 78.6900],
          [10.8220, 78.6880], [10.8190, 78.6850]
        ]
      },
      {
        id: 2,
        name: "Route 2: Central Bus Stand → Srirangam",
        stops: ["Central Bus Stand", "Chatram", "Srirangam"],
        path: [
          [10.8160, 78.6820], [10.8200, 78.6850], [10.8250, 78.6900], [10.8300, 78.6950],
          [10.8350, 78.7000], [10.8420, 78.7020], [10.8450, 78.7000], [10.8500, 78.6980],
          [10.8580, 78.6950], [10.8620, 78.6930], [10.8650, 78.6920], [10.8620, 78.6930],
          [10.8580, 78.6950], [10.8500, 78.6980], [10.8420, 78.7020], [10.8350, 78.7000]
        ]
      }
    ];
  }

  private initializeUsers() {
    this.users.set(1, { id: 1, role: ROLE.PASSENGER, name: "Ravi Passenger" });
    this.users.set(2, { id: 2, role: ROLE.DRIVER, name: "Kumar Driver" });
    this.users.set(3, { id: 3, role: ROLE.ADMIN, name: "Admin Officer" });
  }

  private initializeBuses() {
    this.routes.forEach((route, idx) => {
      this.buses.set(idx + 1, {
        id: idx + 1,
        busNumber: `TN-45-XY-${1000 + idx}`,
        routeId: route.id,
        routeName: route.name,
        lat: route.path[0][0],
        lng: route.path[0][1],
        passengerCount: 15,
        crowdLevel: CROWD_LEVEL.LOW,
        status: BUS_STATUS.RUNNING,
        isLive: idx === 0,
        nextStop: route.stops[1],
        eta: "5 mins",
        lastUpdated: new Date().toISOString()
      });
      this.busIndices.set(idx + 1, 0);
    });
  }

  simulateMovement() {
    this.buses.forEach((bus) => {
      if (bus.status === BUS_STATUS.RUNNING) {
        this.moveBusAlongRoute(bus);
        this.simulatePassengers(bus);
      }
    });
  }

  private moveBusAlongRoute(bus: Bus) {
    const route = this.routes.find(r => r.id === bus.routeId);
    if (!route) return;

    let currentIndex = this.busIndices.get(bus.id) || 0;
    let nextIndex = (currentIndex + 1) % route.path.length;
    this.busIndices.set(bus.id, nextIndex);

    const [newLat, newLng] = route.path[nextIndex];
    bus.lat = newLat;
    bus.lng = newLng;
    bus.lastUpdated = new Date().toISOString();

    const stopCount = route.stops.length;
    const pathSegmentSize = Math.max(1, Math.floor(route.path.length / stopCount));
    const stopIndex = Math.min(Math.floor(nextIndex / pathSegmentSize), stopCount - 1);
    bus.nextStop = route.stops[(stopIndex + 1) % stopCount];
    bus.eta = `${Math.max(1, pathSegmentSize - (nextIndex % pathSegmentSize))} mins`;
  }

  private simulatePassengers(bus: Bus) {
    if (Math.random() > 0.7) {
      const change = Math.floor(Math.random() * 5) - 2;
      bus.passengerCount = Math.max(0, bus.passengerCount + change);
      if (bus.passengerCount < 20) bus.crowdLevel = CROWD_LEVEL.LOW;
      else if (bus.passengerCount < 45) bus.crowdLevel = CROWD_LEVEL.MEDIUM;
      else bus.crowdLevel = CROWD_LEVEL.HIGH;
    }
  }

  async getUser(id: number): Promise<User | undefined> { return this.users.get(id); }
  async getAllBuses(): Promise<Bus[]> { return Array.from(this.buses.values()); }
  async getBus(id: number): Promise<Bus | undefined> { return this.buses.get(id); }

  async getRoute(id: number): Promise<RouteWithStops | undefined> {
    const route = this.routes.find(r => r.id === id);
    if (!route) return undefined;
    return {
      id: route.id,
      name: route.name,
      path: route.path,
      stops: route.stops.map((name, i) => ({
        name,
        position: route.path[Math.floor((i / route.stops.length) * route.path.length)]
      }))
    };
  }

  async updateBusStatus(id: number, status: string): Promise<Bus> {
    const bus = this.buses.get(id);
    if (!bus) throw new Error("Bus not found");
    // @ts-ignore
    bus.status = status;
    return bus;
  }

  async updateBusEsp(id: number, lat?: number, lng?: number, count?: number): Promise<void> {
    const bus = this.buses.get(id);
    if (!bus) return;
    if (lat !== undefined) bus.lat = lat;
    if (lng !== undefined) bus.lng = lng;
    if (count !== undefined) bus.passengerCount = count;
    bus.lastUpdated = new Date().toISOString();
  }
}

export const storage = new MemStorage();
