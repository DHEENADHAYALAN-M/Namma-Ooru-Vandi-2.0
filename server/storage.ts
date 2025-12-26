import { Bus, User, Route, RouteWithStops, BusSchema, UserSchema, ROLE, BUS_STATUS, CROWD_LEVEL } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllBuses(): Promise<Bus[]>;
  getBus(id: number): Promise<Bus | undefined>;
  getRoute(id: number): Promise<RouteWithStops | undefined>;
  updateBusStatus(id: number, status: string): Promise<Bus>;
  updateBusEsp(id: number, lat?: number, lng?: number, count?: number): Promise<void>;
  simulateMovement(): void; // Trigger simulation step
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private buses: Map<number, Bus>;
  private routes: Route[];

  constructor() {
    this.users = new Map();
    this.buses = new Map();
    this.routes = this.initializeRoutes();
    this.initializeUsers();
    this.initializeBuses();

    // Start simulation loop
    setInterval(() => this.simulateMovement(), 2000); // Update every 2 seconds
  }

  private initializeRoutes(): Route[] {
    // Trichy-based routes for Demo GPS Mode
    return [
      {
        id: 1,
        name: "Route 1: Central Bus Stand → Thillai Nagar",
        stops: ["Central Bus Stand", "Main Guard Gate", "Thillai Nagar"],
        path: [
          [10.8160, 78.6820], // Central Bus Stand
          [10.8220, 78.6880],
          [10.8280, 78.6920],
          [10.8320, 78.6850], // Thillai Nagar
          [10.8280, 78.6920], // Loop back
          [10.8220, 78.6880],
        ]
      },
      {
        id: 2,
        name: "Route 2: Central Bus Stand → Srirangam",
        stops: ["Central Bus Stand", "Chatram", "Srirangam"],
        path: [
          [10.8160, 78.6820], // Central
          [10.8250, 78.6900],
          [10.8420, 78.7020], // Chatram
          [10.8580, 78.6950],
          [10.8650, 78.6920], // Srirangam
          [10.8580, 78.6950], // Loop back
          [10.8420, 78.7020],
        ]
      },
      {
        id: 3,
        name: "Route 3: Chatram Bus Stand → Woraiyur",
        stops: ["Chatram Bus Stand", "Cauvery Bridge", "Woraiyur"],
        path: [
          [10.8420, 78.7020], // Chatram
          [10.8450, 78.7080],
          [10.8380, 78.6850], // Woraiyur
          [10.8420, 78.7020], // Loop back
        ]
      }
    ];
  }

  private initializeUsers() {
    this.users.set(1, { id: 1, username: "passenger", password: "123", role: ROLE.PASSENGER, name: "Ravi Passenger" });
    this.users.set(2, { id: 2, username: "driver", password: "123", role: ROLE.DRIVER, name: "Kumar Driver" });
    this.users.set(3, { id: 3, username: "admin", password: "123", role: ROLE.ADMIN, name: "Admin Officer" });
  }

  private initializeBuses() {
    const route1 = this.routes[0];
    const route2 = this.routes[1];
    const route3 = this.routes[2];

    // LIVE Bus (Bus 1)
    this.buses.set(1, {
      id: 1,
      busNumber: "TN-45-AB-1234",
      routeId: 1,
      routeName: route1.name,
      lat: route1.path[0][0],
      lng: route1.path[0][1],
      passengerCount: 15,
      crowdLevel: CROWD_LEVEL.LOW,
      status: BUS_STATUS.RUNNING,
      isLive: true,
      nextStop: route1.stops[1],
      eta: "5 mins",
      lastUpdated: new Date().toISOString()
    });

    // Simulated Buses
    for (let i = 2; i <= 5; i++) {
      const route = i === 2 ? route2 : i === 3 ? route3 : route1;
      const startIdx = Math.floor(Math.random() * route.path.length);
      this.buses.set(i, {
        id: i,
        busNumber: `TN-45-XY-${1000 + i}`,
        routeId: route.id,
        routeName: route.name,
        lat: route.path[startIdx][0],
        lng: route.path[startIdx][1],
        passengerCount: Math.floor(Math.random() * 50),
        crowdLevel: CROWD_LEVEL.MEDIUM,
        status: BUS_STATUS.RUNNING,
        isLive: false,
        nextStop: route.stops[Math.floor(Math.random() * route.stops.length)],
        eta: `${Math.floor(Math.random() * 10) + 2} mins`,
        lastUpdated: new Date().toISOString()
      });
    }
  }

  // Simulation State Helpers
  private busIndices: Map<number, number> = new Map(); // Track path index for each bus

  simulateMovement() {
    for (const bus of this.buses.values()) {
      // Don't simulate the LIVE bus if it has recent updates? 
      // For MVP, we'll simulate all EXCEPT the live one, UNLESS live hasn't updated in a while.
      // But user said "If ESP is not connected, fallback to simulated movement."
      // Let's implement simple constant movement for simulated buses.

      if (bus.isLive) {
         // Logic to check if live bus has stale data could go here
         // For now, assume live bus is updated via API only.
         // Un-comment below to auto-simulate live bus for testing without ESP
         // this.moveBusAlongRoute(bus);
         continue; 
      }

      if (bus.status === BUS_STATUS.RUNNING) {
        this.moveBusAlongRoute(bus);
        this.simulatePassengers(bus);
      }
    }
  }

  private moveBusAlongRoute(bus: Bus) {
    const route = this.routes.find(r => r.id === bus.routeId);
    if (!route) return;

    let currentIndex = this.busIndices.get(bus.id) || 0;
    
    // Find closest point on path if not tracked (simple approach)
    // Here we just advance index
    let nextIndex = (currentIndex + 1) % route.path.length;
    this.busIndices.set(bus.id, nextIndex);

    const [newLat, newLng] = route.path[nextIndex];
    
    // Smooth interpolation happens on frontend, backend just jumps for simple MVP
    bus.lat = newLat;
    bus.lng = newLng;
    bus.lastUpdated = new Date().toISOString();

    // Update next stop and ETA based on position
    const stopCount = route.stops.length;
    const pathSegmentSize = Math.floor(route.path.length / stopCount);
    const stopIndex = Math.min(Math.floor(nextIndex / pathSegmentSize), stopCount - 1);
    bus.nextStop = route.stops[(stopIndex + 1) % stopCount];
    bus.eta = `${Math.max(1, 5 - (nextIndex % pathSegmentSize))} mins`;
  }

  private simulatePassengers(bus: Bus) {
    // Randomly fluctuate passengers
    if (Math.random() > 0.7) {
      const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
      bus.passengerCount = Math.max(0, bus.passengerCount + change);
      
      // Update crowd level
      if (bus.passengerCount < 20) bus.crowdLevel = CROWD_LEVEL.LOW;
      else if (bus.passengerCount < 45) bus.crowdLevel = CROWD_LEVEL.MEDIUM;
      else bus.crowdLevel = CROWD_LEVEL.HIGH;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async getAllBuses(): Promise<Bus[]> {
    return Array.from(this.buses.values());
  }

  async getBus(id: number): Promise<Bus | undefined> {
    return this.buses.get(id);
  }

  async getRoute(id: number): Promise<RouteWithStops | undefined> {
    const route = this.routes.find(r => r.id === id);
    if (!route) return undefined;
    
    // Convert stops array to objects with positions
    const stopsWithPositions = route.stops.map((stopName, index) => {
      // Map stop name to approximate position on the route
      const stopIndex = Math.floor((index / route.stops.length) * route.path.length);
      const position = route.path[Math.min(stopIndex, route.path.length - 1)];
      return { name: stopName, position };
    });

    return {
      id: route.id,
      name: route.name,
      path: route.path,
      stops: stopsWithPositions,
    };
  }

  async updateBusStatus(id: number, status: string): Promise<Bus> {
    const bus = this.buses.get(id);
    if (!bus) throw new Error("Bus not found");
    // @ts-ignore
    bus.status = status;
    
    // If starting trip, reset to start of route
    if (status === BUS_STATUS.RUNNING) {
      const route = this.routes.find(r => r.id === bus.routeId);
      if (route) {
        this.busIndices.set(bus.id, 0);
        bus.lat = route.path[0][0];
        bus.lng = route.path[0][1];
      }
    }
    
    return bus;
  }

  async updateBusEsp(id: number, lat?: number, lng?: number, count?: number): Promise<void> {
    const bus = this.buses.get(id);
    if (!bus) return;

    if (lat !== undefined) bus.lat = lat;
    if (lng !== undefined) bus.lng = lng;
    if (count !== undefined) {
      bus.passengerCount = count;
      if (bus.passengerCount < 20) bus.crowdLevel = CROWD_LEVEL.LOW;
      else if (bus.passengerCount < 45) bus.crowdLevel = CROWD_LEVEL.MEDIUM;
      else bus.crowdLevel = CROWD_LEVEL.HIGH;
    }
    bus.lastUpdated = new Date().toISOString();
    
    // If we receive data, ensure status is running?
    // bus.status = BUS_STATUS.RUNNING;
  }
}

export const storage = new MemStorage();
