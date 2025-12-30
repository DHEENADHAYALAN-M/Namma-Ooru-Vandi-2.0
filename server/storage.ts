import { Bus, User, RouteWithStops, ROLE, BUS_STATUS, CROWD_LEVEL, Route } from "@shared/schema";

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
  private busInterpolation: Map<number, number> = new Map(); // Track smooth progress between waypoints (0-1)
  private busStopPauseTimer: Map<number, number> = new Map(); // Track stop pause remaining time in ms
  private busLastStopIndex: Map<number, number> = new Map(); // Track last stop index reached

  constructor() {
    this.users = new Map();
    this.buses = new Map();
    this.routes = this.initializeRoutes();
    this.initializeUsers();
    this.initializeBuses();
    this.initializeInterpolation();

    // Update every 500ms for smooth frontend rendering
    setInterval(() => this.simulateMovement(), 500);
  }

  private initializeInterpolation() {
    for (let i = 1; i <= 3; i++) {
      this.busInterpolation.set(i, 0);
      this.busStopPauseTimer.set(i, 0);
      this.busLastStopIndex.set(i, -1);
    }
  }

  private initializeRoutes(): Route[] {
    return [
      {
        id: 1,
        name: "Route 1: Central Bus Stand → Thillai Nagar",
        stops: ["Central Bus Stand", "Main Guard Gate", "Periyar Park", "Race Course", "Hospital Junction", "Thillai Nagar"],
        path: [
          // Central Bus Stand to Main Guard Gate (4 waypoints)
          [10.8160, 78.6820], [10.8180, 78.6840], [10.8200, 78.6860], [10.8220, 78.6880],
          // Main Guard Gate to Periyar Park (3 waypoints)
          [10.8240, 78.6900], [10.8250, 78.6910], [10.8260, 78.6920],
          // Periyar Park to Race Course (3 waypoints)
          [10.8280, 78.6920], [10.8290, 78.6915], [10.8300, 78.6900],
          // Race Course to Hospital Junction (3 waypoints)
          [10.8310, 78.6880], [10.8315, 78.6870], [10.8320, 78.6850],
          // Hospital Junction to Thillai Nagar (3 waypoints)
          [10.8310, 78.6870], [10.8300, 78.6890], [10.8290, 78.6910]
        ]
      },
      {
        id: 2,
        name: "Route 2: Central Bus Stand → Srirangam",
        stops: ["Central Bus Stand", "Market Street", "Chatram", "Temple Junction", "Riverside Road", "Srirangam"],
        path: [
          // Central Bus Stand to Market Street (3 waypoints)
          [10.8160, 78.6820], [10.8180, 78.6840], [10.8200, 78.6850],
          // Market Street to Chatram (3 waypoints)
          [10.8250, 78.6900], [10.8300, 78.6950], [10.8350, 78.7000],
          // Chatram to Temple Junction (3 waypoints)
          [10.8380, 78.7010], [10.8410, 78.7015], [10.8420, 78.7020],
          // Temple Junction to Riverside Road (3 waypoints)
          [10.8450, 78.7000], [10.8500, 78.6980], [10.8580, 78.6950],
          // Riverside Road to Srirangam (2 waypoints)
          [10.8620, 78.6930], [10.8650, 78.6920]
        ]
      },
      {
        id: 3,
        name: "Route 3: Chatram Bus Stand → Woraiyur",
        stops: ["Chatram Bus Stand", "Bridge Corner", "Cauvery Bridge", "Central Depot", "Woraiyur"],
        path: [
          // Chatram Bus Stand to Bridge Corner (2 waypoints)
          [10.8420, 78.7020], [10.8430, 78.7035],
          // Bridge Corner to Cauvery Bridge (2 waypoints)
          [10.8440, 78.7050], [10.8450, 78.7060],
          // Cauvery Bridge to Central Depot (2 waypoints)
          [10.8460, 78.7080], [10.8450, 78.7070],
          // Central Depot to Woraiyur (3 waypoints)
          [10.8430, 78.7050], [10.8410, 78.7020], [10.8420, 78.7020]
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
        eta: "6 mins",
        lastUpdated: new Date().toISOString(),
        boardedCount: 0,
        alightedCount: 0,
        atStop: false
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

    // Check if bus is paused at a stop (2-3 seconds pause)
    let stopPauseTime = this.busStopPauseTimer.get(bus.id) || 0;
    if (stopPauseTime > 0) {
      // Decrement pause timer by 500ms
      stopPauseTime -= 500;
      this.busStopPauseTimer.set(bus.id, Math.max(0, stopPauseTime));
      
      bus.atStop = stopPauseTime > 0;
      bus.lastUpdated = new Date().toISOString();
      return; // Don't move while paused
    }

    // Get current position tracking
    let currentIndex = this.busIndices.get(bus.id) || 0;
    let interpolation = this.busInterpolation.get(bus.id) || 0;
    let lastStopIndex = this.busLastStopIndex.get(bus.id) || -1;

    // Smooth movement: increment by 12% each 500ms update
    interpolation += 0.12;

    // When we've reached the next waypoint, advance to it
    if (interpolation >= 1.0) {
      currentIndex = (currentIndex + 1) % route.path.length;
      interpolation = interpolation - 1.0; // Carry over excess to next segment
      this.busIndices.set(bus.id, currentIndex);

      // Check if we've reached a stop (every waypoint is a potential stop marker)
      const stopIndexMarkers = Math.ceil(route.path.length / (route.stops.length - 1));
      const currentStopIndex = Math.floor(currentIndex / stopIndexMarkers);
      if (currentStopIndex !== lastStopIndex && currentStopIndex < route.stops.length) {
        // Pause at this stop for 2-3 seconds (2500-3500ms)
        const pauseTime = 2500 + Math.random() * 1000;
        this.busStopPauseTimer.set(bus.id, pauseTime);
        bus.atStop = true;
        this.busLastStopIndex.set(bus.id, currentStopIndex);

        // Simulate passenger boarding/alighting
        const boarded = Math.floor(Math.random() * 6) + 2; // 2-7 passengers board
        const alighted = Math.floor(Math.random() * 5) + 1; // 1-5 passengers alight
        bus.boardedCount = boarded;
        bus.alightedCount = alighted;
        bus.passengerCount = Math.max(0, Math.min(60, bus.passengerCount - alighted + boarded));
      }
    }

    this.busInterpolation.set(bus.id, interpolation);
    bus.atStop = false;

    // Smooth interpolation between current and next waypoint
    const nextIndex = (currentIndex + 1) % route.path.length;
    const currentPos = route.path[currentIndex];
    const nextPos = route.path[nextIndex];
    const [currLat, currLng] = currentPos;
    const [nextLat, nextLng] = nextPos;

    // Linear interpolation for smooth movement
    bus.lat = currLat + (nextLat - currLat) * interpolation;
    bus.lng = currLng + (nextLng - currLng) * interpolation;
    bus.lastUpdated = new Date().toISOString();

    // Update stop information based on progress through route
    const stopCount = route.stops.length;
    const pathSegmentSize = Math.max(1, Math.floor(route.path.length / stopCount));
    const progressIndex = Math.floor((currentIndex + interpolation) / pathSegmentSize);
    const stopIndex = Math.min(progressIndex, stopCount - 1);
    bus.nextStop = route.stops[(stopIndex + 1) % stopCount];
    
    // Calculate more accurate ETA
    const nextStopWaypoints = Math.ceil((stopIndex + 1) * pathSegmentSize);
    const remainingWaypoints = Math.max(1, nextStopWaypoints - currentIndex);
    bus.eta = `${Math.ceil(remainingWaypoints * 0.35)} mins`;

    // Update crowd level based on passenger count
    if (bus.passengerCount < 20) bus.crowdLevel = CROWD_LEVEL.LOW;
    else if (bus.passengerCount < 45) bus.crowdLevel = CROWD_LEVEL.MEDIUM;
    else bus.crowdLevel = CROWD_LEVEL.HIGH;
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

  async getUser(id: number) { return this.users.get(id); }
  async getAllBuses() { return Array.from(this.buses.values()); }
  async getBus(id: number) { return this.buses.get(id); }

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
