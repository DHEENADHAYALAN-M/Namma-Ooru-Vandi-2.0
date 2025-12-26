import { pgTable, text, serial, integer, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// NOTE: We are NOT using a database, but we use these schemas for type sharing and validation.

export const ROLE = {
  PASSENGER: 'passenger',
  DRIVER: 'driver',
  ADMIN: 'admin',
} as const;

export const BUS_STATUS = {
  RUNNING: 'Running',
  STOPPED: 'Stopped',
  SIGNAL_LOST: 'Signal Lost',
} as const;

export const CROWD_LEVEL = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
} as const;

// Define User Schema (In-memory) - Simplified for direct role selection
export const UserSchema = z.object({
  id: z.number(),
  role: z.enum([ROLE.PASSENGER, ROLE.DRIVER, ROLE.ADMIN]),
  name: z.string(),
});

export type User = z.infer<typeof UserSchema>;

// Define Bus Schema (In-memory)
export const BusSchema = z.object({
  id: z.number(),
  busNumber: z.string(),
  routeId: z.number(),
  routeName: z.string(),
  lat: z.number(),
  lng: z.number(),
  passengerCount: z.number(),
  crowdLevel: z.enum([CROWD_LEVEL.LOW, CROWD_LEVEL.MEDIUM, CROWD_LEVEL.HIGH]),
  status: z.enum([BUS_STATUS.RUNNING, BUS_STATUS.STOPPED, BUS_STATUS.SIGNAL_LOST]),
  isLive: z.boolean(), // True for the ESP-connected bus
  nextStop: z.string(),
  eta: z.string(), // Estimated time to next stop
  lastUpdated: z.string(), // ISO string
});

export type Bus = z.infer<typeof BusSchema>;

// Route Path Schema for Simulation
export const RouteSchema = z.object({
  id: z.number(),
  name: z.string(),
  path: z.array(z.tuple([z.number(), z.number()])), // Array of [lat, lng]
  stops: z.array(z.string()),
});

export type Route = z.infer<typeof RouteSchema>;

// Input Schemas
export const RoleSelectionSchema = z.object({
  role: z.enum([ROLE.PASSENGER, ROLE.DRIVER, ROLE.ADMIN]),
});

export const LoginSchema = RoleSelectionSchema;

export const UpdateBusStatusSchema = z.object({
  status: z.enum([BUS_STATUS.RUNNING, BUS_STATUS.STOPPED]),
});

export const EspDataSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  passengerCount: z.number().optional(),
});
