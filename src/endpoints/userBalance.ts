import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { AppContext } from "../types";

export class UserBalance extends OpenAPIRoute {
	schema = {
		tags: ["User"],
		summary: "Get User Balance",
		request: {
			params: z.object({
				user_id: z.string(),
			}),
		},
		responses: {
			"200": {
				description: "User Balance",
				content: {
					"application/json": {
						schema: z.object({
							balance_cny: z.number(),
							balance_cents: z.number(),
							currency: z.string(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { user_id } = data.params;

		const user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(user_id).first();

		if (!user) {
			return c.json({ success: false, message: "User not found" }, 404);
		}

		const balance = (user.balance as number | undefined) || 0;

		return c.json({
			balance_cny: balance / 100,
			balance_cents: balance,
			currency: "CNY"
		});
	}
}
