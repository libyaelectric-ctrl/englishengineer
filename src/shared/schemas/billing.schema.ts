import { z } from 'zod';

/**
 * Zod schemas for billing-related API requests.
 * These can be used client-side (form validation) and server-side (request validation).
 */

export const billingPlanIdSchema = z.enum([
  'free',
  'junior',
  'senior',
  'specialist',
  'master',
  'team',
]);

export const billingIntervalSchema = z.enum(['month', 'year']);

export const checkoutSessionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  email: z.string().email('Valid email is required'),
  planId: billingPlanIdSchema,
  billingInterval: billingIntervalSchema.default('month'),
  successUrl: z.string().url('Success URL must be a valid URL'),
  cancelUrl: z.string().url('Cancel URL must be a valid URL'),
});

export const customerPortalSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  returnUrl: z.string().url('Return URL must be a valid URL'),
});

export const topupCheckoutSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  email: z.string().email('Valid email is required'),
  successUrl: z.string().url('Success URL must be a valid URL'),
  cancelUrl: z.string().url('Cancel URL must be a valid URL'),
});

export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>;
export type CustomerPortalInput = z.infer<typeof customerPortalSchema>;
export type TopupCheckoutInput = z.infer<typeof topupCheckoutSchema>;
