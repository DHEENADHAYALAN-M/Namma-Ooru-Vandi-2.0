import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Session Setup for Auth
  app.use(session({
    secret: 'namma-ooru-vandi-secret',
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({ checkPeriod: 86400000 }),
    cookie: { secure: false } // Set to true if HTTPS
  }));

  // Auth Routes
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { role } = api.auth.login.input.parse(req.body);
      
      // Create or get a default user for the role
      const username = `${role}_user`;
      let user = await storage.getUserByUsername(username);
      
      if (!user) {
        // Fallback: If createUser doesn't exist or we can't create, use a mock
        user = {
          id: role === 'passenger' ? 1 : role === 'driver' ? 2 : 3,
          username,
          role,
          name: `${role.charAt(0).toUpperCase() + role.slice(1)} Mode`
        };
      }

      // @ts-ignore
      req.session.userId = user.id;
      res.json(user);
    } catch (e) {
      console.error('Login error:', e);
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    // @ts-ignore
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.json(user);
  });

  // Bus Routes
  app.get(api.buses.list.path, async (req, res) => {
    const buses = await storage.getAllBuses();
    res.json(buses);
  });

  app.get(api.buses.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const bus = await storage.getBus(id);
    if (!bus) return res.status(404).json({ message: "Bus not found" });
    res.json(bus);
  });

  app.patch(api.buses.updateStatus.path, async (req, res) => {
    // @ts-ignore
    if (!req.session.userId) return res.status(403).json({ message: "Unauthorized" });
    
    const id = parseInt(req.params.id);
    const { status } = api.buses.updateStatus.input.parse(req.body);
    try {
      const bus = await storage.updateBusStatus(id, status);
      res.json(bus);
    } catch (e) {
      res.status(404).json({ message: "Bus not found" });
    }
  });

  app.post(api.buses.espUpdate.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const { lat, lng, passengerCount } = api.buses.espUpdate.input.parse(req.body);
    
    await storage.updateBusEsp(id, lat, lng, passengerCount);
    res.json({ success: true });
  });

  return httpServer;
}
