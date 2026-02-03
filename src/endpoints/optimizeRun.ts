import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { AppContext, OptimizeRequest, OptimizeResponse } from "../types";

export class OptimizeRun extends OpenAPIRoute {
	schema = {
		tags: ["Service"],
		summary: "Run Optimization Service",
		request: {
			body: {
				content: {
					"application/json": {
						schema: OptimizeRequest,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Optimization Started/Result",
				content: {
					"application/json": {
						schema: OptimizeResponse,
					},
				},
			},
			"402": {
				description: "Payment Required",
				content: {
					"application/json": {
						schema: z.object({
							message: z.string(),
							shortfall: z.number(),
							payment_url: z.string(),
						})
					}
				}
			}
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { user_id } = data.body;

		// 1. Calculate Cost (Mock Logic)
		// Real logic would analyze STL, calculate volume saved, etc.
		// Example: Save 150 CNY, take 30% = 45 CNY.
		const MOCK_COST_CENTS = 4500; 

		// 2. Check User Balance
		const user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(user_id).first();
		if (!user) {
			return c.json({ success: false, message: "User not found. Please register/auth first." }, 404); // Or 401
		}

		const currentBalance = (user.balance as number | undefined) || 0;

		// 3. Billing Logic
		if (currentBalance >= MOCK_COST_CENTS) {
			// Pay with Credit
			const newBalance = currentBalance - MOCK_COST_CENTS;

			try {
				const updateUser = c.env.DB.prepare("UPDATE users SET balance = ? WHERE id = ?")
					.bind(newBalance, user_id);
				
				const logTrans = c.env.DB.prepare(
					"INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, 'usage', 'Optimization Service Fee')"
				).bind(user_id, -MOCK_COST_CENTS);

				await c.env.DB.batch([updateUser, logTrans]);

				return c.json({
					job_id: "job_" + Math.random().toString(36).substring(7),
					cost: MOCK_COST_CENTS / 100,
					paid_with: "balance",
					remaining_balance: newBalance / 100,
					status: "processing"
				});

			} catch (e) {
				return c.json({ success: false, message: "Transaction failed", error: String(e) }, 500);
			}

		} else {
			// Insufficient Funds -> Require Payment
			const shortfall = MOCK_COST_CENTS - currentBalance;
			
			// Generate Mock QR Code / Payment Link
			const paymentUrl = `https://pay.example.com/pay?amount=${shortfall}&order_id=ord_${Math.random().toString(36).substring(7)}`;

			return c.json({
				message: "Insufficient trial credits. Please pay for the service.",
				shortfall: shortfall / 100,
				payment_url: paymentUrl
			}, 402);
		}
	}
}
