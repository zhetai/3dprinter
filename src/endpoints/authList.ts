import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { AppContext } from "../types";

export class AuthList extends OpenAPIRoute {
	schema = {
		tags: ["Admin"],
		summary: "List Pending Enterprise Verifications",
		responses: {
			"200": {
				description: "List of pending requests",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							requests: z.array(
								z.object({
									id: z.number(),
									user_id: z.string(),
									company_name: z.string(),
									credit_code: z.string(),
									license_image_url: z.string(),
									created_at: z.string(),
								})
							),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const results = await c.env.DB.prepare(
			"SELECT id, user_id, company_name, credit_code, license_image_url, created_at FROM enterprise_auth WHERE status = 'pending' ORDER BY created_at DESC"
		).all();

		return c.json({
			success: true,
			requests: results.results
		});
	}
}
