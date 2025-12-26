import { z } from 'zod';
import { UserSchema, BusSchema, RoleSelectionSchema, UpdateBusStatusSchema, EspDataSchema, RouteWithStopsSchema } from './schema';

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: RoleSelectionSchema,
      responses: {
        200: UserSchema,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: { // Check current session
      method: 'GET' as const,
      path: '/api/me',
      responses: {
        200: UserSchema,
        401: z.object({ message: z.string() }),
      },
    },
  },
  buses: {
    list: {
      method: 'GET' as const,
      path: '/api/buses',
      responses: {
        200: z.array(BusSchema),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/buses/:id',
      responses: {
        200: BusSchema,
        404: z.object({ message: z.string() }),
      },
    },
    updateStatus: { // For Driver
      method: 'PATCH' as const,
      path: '/api/buses/:id/status',
      input: UpdateBusStatusSchema,
      responses: {
        200: BusSchema,
        403: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
    },
    espUpdate: { // For ESP/Simulation updates
      method: 'POST' as const,
      path: '/api/buses/:id/esp',
      input: EspDataSchema,
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
  },
  routes: {
    get: {
      method: 'GET' as const,
      path: '/api/routes/:id',
      responses: {
        200: RouteWithStopsSchema,
        404: z.object({ message: z.string() }),
      },
    },
  },
};

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
