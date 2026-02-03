import { DateTime, Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type AppContext = Context<{ Bindings: Env }>;

export const Task = z.object({
	name: Str({ example: "lorem" }),
	slug: Str(),
	description: Str({ required: false }),
	completed: z.boolean().default(false),
	due_date: DateTime(),
});

// User Schema (Simplified)
export const User = z.object({
	id: Str(),
	email: Str(),
	balance: z.number().int().default(0),
});

// Enterprise Auth Submission Schema
export const EnterpriseAuthSubmit = z.object({
	user_id: Str(), // In a real app, this comes from auth context, here passed explicitly for MVP
	company_name: Str(),
	credit_code: z.string().min(18).max(18),
	license_image_url: z.string().url(),
});

// Enterprise Auth Review Schema
export const EnterpriseAuthReview = z.object({
	auth_id: z.number().int(),
	action: z.enum(['approve', 'reject']),
	reason: Str({ required: false }),
});

// Optimize Request Schema (Business Logic)
export const OptimizeRequest = z.object({
	user_id: Str(),
	stl_file_url: z.string().url(),
	// Other optimization parameters...
});

export const OptimizeResponse = z.object({
	job_id: Str(),
	cost: z.number(),
	paid_with: z.enum(['balance', 'payment']),
	remaining_balance: z.number(),
	status: Str(),
});
