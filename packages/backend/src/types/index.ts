export * from "./query-pagination";
export * from "./query-sort";

import { z } from "zod";

export const PusherEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  audience: z.object({
    type: z.string(),
    userId: z.string(),
  }),
  senderId: z.string(),
  content: z.object({
    en: z.object({
      title: z.string(),
      description: z.string(),
    }),
    ar: z.object({
      title: z.string(),
      description: z.string(),
    }),
    ku: z.object({
      title: z.string(),
      description: z.string(),
    }),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PusherEvent = z.infer<typeof PusherEventSchema>;


export type TError = {
  source: string;
  code: string;
  message: string;
  details?: unknown;
};

export type TResult<T> = {
  success: boolean;
  message?: string;
  statusCode: number;
  data?: T;
  error?: TError;
};

