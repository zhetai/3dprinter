import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { AppContext, EnterpriseAuthReview } from "../types";

export class AuthReview extends OpenAPIRoute {
	schema = {
		tags: ["Admin"],
		summary: "Review Enterprise Verification",
		request: {
			body: {
				content: {
					"application/json": {
						schema: EnterpriseAuthReview,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Review processed",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							message: z.string(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { auth_id, action, reason } = data.body;

		// 1. Get Auth Request
		const authRequest = await c.env.DB.prepare("SELECT * FROM enterprise_auth WHERE id = ?").bind(auth_id).first();
		
		if (!authRequest) {
			return c.json({ success: false, message: "Auth request not found" }, 404);
		}

		if (authRequest.status !== 'pending') {
			return c.json({ success: false, message: "Auth request already processed" }, 400);
		}

		if (action === 'reject') {
			await c.env.DB.prepare("UPDATE enterprise_auth SET status = 'rejected', rejection_reason = ? WHERE id = ?")
				.bind(reason || "Rejected by admin", auth_id).run();
			return c.json({ success: true, message: "Application rejected" });
		}

		// 2. Approve logic
		// Transaction: Update Auth Status + Grant Credit + Log Transaction
		const TRIAL_AMOUNT = 20000; // 200.00 CNY

		try {
			// D1 doesn't support full transactions in standard API easily via prepare/bind/run sequence if not batched,
			// but we can use batch() for atomicity.
			
			const updateAuth = c.env.DB.prepare(
				"UPDATE enterprise_auth SET status = 'approved' WHERE id = ?"
			).bind(auth_id);

			const updateUser = c.env.DB.prepare(
				"UPDATE users SET balance = balance + ? WHERE id = ?"
			).bind(TRIAL_AMOUNT, authRequest.user_id);

			const logTrans = c.env.DB.prepare(
				"INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, 'trial_grant', 'Enterprise Verification Approved')"
			).bind(authRequest.user_id, TRIAL_AMOUNT);

			await c.env.DB.batch([updateAuth, updateUser, logTrans]);

			return c.json({ success: true, message: "Approved and 200 CNY trial credit granted" });

		} catch (e) {
			return c.json({ success: false, message: "Database error during approval", error: String(e) }, 500);
		}
	}
}
