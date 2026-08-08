import Elysia, { t } from "elysia";
import { db } from "../../db";
import { ErrorResponseSchema } from "../shared/schemas";
import { TransactionSchema, UpopulatedTransactionSchema } from "./schemas";

export const transactionRoutes = new Elysia({ prefix: "/transactions" })
	.get(
		"/",
		async () => {
			return await db.transaction.findMany({
				include: {
					user: true,
					product: true,
				},
				orderBy: { createdAt: "desc" },
			});
		},
		{
			detail: {
				summary: "Get all transactions",
				description:
					"Returns a list of all transactions with user and product details.",
				tags: ["Transactions"],
			},
			response: t.Array(TransactionSchema),
		},
	)
	.post(
		"/",
		async ({ body, set }) => {
			const user = await db.user.findUnique({ where: { id: body.userId } });
			const product = await db.product.findUnique({
				where: { id: body.productId },
			});

			if (!user || !product) {
				set.status = 404;
				return { error: "User or Product not found" };
			}

			return await db.transaction.create({
				data: {
					userId: body.userId,
					productId: body.productId,
					quantity: body.quantity ?? 1,
				},
			});
		},
		{
			detail: {
				summary: "Create a new transaction",
				description:
					"Creates a new transaction with the provided user and product IDs.",
				tags: ["Transactions"],
			},
			body: t.Object({
				userId: t.String(),
				productId: t.String(),
				quantity: t.Optional(t.Number()),
			}),
			response: {
				200: UpopulatedTransactionSchema,
				404: ErrorResponseSchema,
			},
		},
	);
