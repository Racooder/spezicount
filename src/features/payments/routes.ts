import Elysia, { t } from "elysia";
import { db } from "../../db";
import { PaymentSchema, UnpopulatedPaymentSchema } from "./schemas";

export const paymentRoutes = new Elysia({ prefix: "/payments" })
	.get(
		"/",
		async () => {
			return await db.payment.findMany({
				select: {
					id: true,
					amountInCents: true,
					createdAt: true,
					user: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});
		},
		{
			detail: {
				summary: "Get all payments",
				description: "Returns a list of all payments.",
				tags: ["Payments"],
			},
			response: t.Array(PaymentSchema),
		},
	)
	.post(
		"/",
		async ({ body }) => {
			return await db.payment.create({
				data: body,
			});
		},
		{
			detail: {
				summary: "Create a new payment",
				description: "Creates a new payment",
				tags: ["Payments"],
			},
			body: t.Object({
				userId: t.String(),
				amountInCents: t.Integer(),
			}),
			response: UnpopulatedPaymentSchema,
		},
	);
