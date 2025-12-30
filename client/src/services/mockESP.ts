// Mock ESP streaming service - emits realistic GPS, speed, and passenger data
// All frontend, no backend dependency

export interface ESPData {
  lat: number;
  lng: number;
  speed: number; // km/h
  passengerCount: number;
  crowdLevel: 'Low' | 'Medium' | 'High';
  timestamp: number;
}

export interface ESPSubscription {
  unsubscribe: () => void;
}

type ESPListener = (data: ESPData) => void;

class MockESPService {
  private listeners: Map<number, ESPListener[]> = new Map();
  private intervals: Map<number, NodeJS.Timeout> = new Map();

  subscribe(busId: number, callback: ESPListener): ESPSubscription {
    if (!this.listeners.has(busId)) {
      this.listeners.set(busId, []);
    }
    this.listeners.get(busId)!.push(callback);

    // Start emitting if not already started
    if (!this.intervals.has(busId)) {
      this.startEmitting(busId);
    }

    return {
      unsubscribe: () => {
        const callbacks = this.listeners.get(busId);
        if (callbacks) {
          const idx = callbacks.indexOf(callback);
          if (idx > -1) callbacks.splice(idx, 1);
        }
        if (!callbacks || callbacks.length === 0) {
          this.stopEmitting(busId);
        }
      }
    };
  }

  private startEmitting(busId: number) {
    let speed = 30; // km/h
    let passengerCount = 15;

    const interval = setInterval(() => {
      // Simulate realistic speed variations
      speed = 20 + Math.random() * 40;
      
      // Simulate passenger count changes (slower)
      if (Math.random() > 0.85) {
        const change = Math.floor(Math.random() * 5) - 2;
        passengerCount = Math.max(0, Math.min(60, passengerCount + change));
      }

      const crowdLevel = 
        passengerCount < 20 ? 'Low' :
        passengerCount < 45 ? 'Medium' : 'High';

      const data: ESPData = {
        lat: 0, // Will be set by storage
        lng: 0, // Will be set by storage
        speed: Math.round(speed * 10) / 10,
        passengerCount,
        crowdLevel,
        timestamp: Date.now()
      };

      const callbacks = this.listeners.get(busId) || [];
      callbacks.forEach(cb => cb(data));
    }, 1500); // Update every 1.5 seconds

    this.intervals.set(busId, interval);
  }

  private stopEmitting(busId: number) {
    const interval = this.intervals.get(busId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(busId);
    }
  }

  // Manual update for position (called by storage)
  updatePosition(busId: number, lat: number, lng: number) {
    const callbacks = this.listeners.get(busId) || [];
    callbacks.forEach(cb => {
      // Get last emitted data and update position
      const lastData = this.getLastData(busId);
      if (lastData) {
        cb({ ...lastData, lat, lng });
      }
    });
  }

  private lastData: Map<number, ESPData> = new Map();

  getLastData(busId: number): ESPData | null {
    return this.lastData.get(busId) || null;
  }
}

export const mockESP = new MockESPService();
