import { pgTable, text, serial, integer, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const ROLE = {
  PASSENGER: 'passenger',
  DRIVER: 'driver',
  ADMIN: 'admin',
} as const;

export const BUS_STATUS = {
  RUNNING: 'Running',
  STOPPED: 'Stopped',
} as const;

export const CROWD_LEVEL = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
} as const;

export const UserSchema = z.object({
  id: z.number(),
  role: z.enum([ROLE.PASSENGER, ROLE.DRIVER, ROLE.ADMIN]),
  name: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const BusSchema = z.object({
  id: z.number(),
  busNumber: z.string(),
  routeId: z.number(),
  routeName: z.string(),
  lat: z.number(),
  lng: z.number(),
  passengerCount: z.number(),
  crowdLevel: z.enum([CROWD_LEVEL.LOW, CROWD_LEVEL.MEDIUM, CROWD_LEVEL.HIGH]),
  status: z.enum([BUS_STATUS.RUNNING, BUS_STATUS.STOPPED]),
  isLive: z.boolean(),
  nextStop: z.string(),
  eta: z.string(),
  lastUpdated: z.string(),
});

export type Bus = z.infer<typeof BusSchema>;

export const RouteWithStopsSchema = z.object({
  id: z.number(),
  name: z.string(),
  path: z.array(z.tuple([z.number(), z.number()])),
  stops: z.array(z.object({
    name: z.string(),
    position: z.tuple([z.number(), z.number()]),
  })),
});

export type RouteWithStops = z.infer<typeof RouteWithStopsSchema>;

export const EspDataSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  passengerCount: z.number().optional(),
});

export const RoleSelectionSchema = z.object({
  role: z.enum([ROLE.PASSENGER, ROLE.DRIVER, ROLE.ADMIN]),
});

export const LoginSchema = RoleSelectionSchema;

export const UpdateBusStatusSchema = z.object({
  status: z.enum([BUS_STATUS.RUNNING, BUS_STATUS.STOPPED]),
});
