import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { AppContext, EnterpriseAuthSubmit } from "../types";

export class AuthSubmit extends OpenAPIRoute {
	schema = {
		tags: ["Authentication"],
		summary: "Submit Enterprise Verification",
		request: {
			body: {
				content: {
					"application/json": {
						schema: EnterpriseAuthSubmit,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Submission successful",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							message: z.string(),
							auth_id: z.number(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { user_id, company_name, credit_code, license_image_url } = data.body;

		// 1. Ensure user exists (Mock check or simple insert ignore)
		// For MVP, we assume user_id is valid or we auto-create user entry if missing
		// In a real app, middleware handles auth.
		
		// Check if user exists, if not create (for MVP simplicity)
		const user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(user_id).first();
		if (!user) {
			await c.env.DB.prepare("INSERT INTO users (id, email) VALUES (?, ?)")
				.bind(user_id, `${user_id}@example.com`)
				.run();
		}

		// 2. Check if already submitted/approved
		const existing = await c.env.DB.prepare("SELECT * FROM enterprise_auth WHERE user_id = ? AND status != 'rejected'")
			.bind(user_id).first();
		
		if (existing) {
			return c.json({
				success: false,
				message: "Authentication already pending or approved",
				auth_id: existing.id
			}, 400);
		}

		// 3. Insert auth request
		const result = await c.env.DB.prepare(
			"INSERT INTO enterprise_auth (user_id, company_name, credit_code, license_image_url) VALUES (?, ?, ?, ?)"
		).bind(user_id, company_name, credit_code, license_image_url).run();

		return c.json({
			success: true,
			message: "Enterprise verification submitted. Waiting for review.",
			auth_id: result.meta.last_row_id
		});
	}
}
