import { Bus, User, Route, BusSchema, UserSchema, ROLE, BUS_STATUS, CROWD_LEVEL } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllBuses(): Promise<Bus[]>;
  getBus(id: number): Promise<Bus | undefined>;
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
    // Chennai-like routes
    return [
      {
        id: 1,
        name: "Route 1: Central to T. Nagar",
        stops: ["Central Station", "Mount Road", "T. Nagar"],
        path: [
          [13.0827, 80.2707], // Central
          [13.0724, 80.2690],
          [13.0604, 80.2644],
          [13.0500, 80.2500],
          [13.0418, 80.2341], // T. Nagar
          [13.0500, 80.2500], // Loop back
          [13.0604, 80.2644],
          [13.0724, 80.2690],
        ]
      },
      {
        id: 2,
        name: "Route 2: Guindy to Adyar",
        stops: ["Guindy", "Little Mount", "Adyar"],
        path: [
          [13.0067, 80.2206], // Guindy
          [13.0120, 80.2290],
          [13.0060, 80.2450],
          [13.0012, 80.2565], // Adyar
          [13.0060, 80.2450], // Loop back
          [13.0120, 80.2290],
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

    // LIVE Bus (Bus 1)
    this.buses.set(1, {
      id: 1,
      busNumber: "TN-01-AB-1234",
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
      const route = i % 2 === 0 ? route2 : route1;
      const startIdx = Math.floor(Math.random() * route.path.length);
      this.buses.set(i, {
        id: i,
        busNumber: `TN-0${i}-XY-${1000 + i}`,
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
    
    // Smooth interpolation could happen on frontend, backend just jumps for simple MVP
    bus.lat = newLat;
    bus.lng = newLng;
    bus.lastUpdated = new Date().toISOString();
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
