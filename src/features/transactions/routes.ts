import Elysia, { t } from "elysia";
import type {
	DateTimeFilter,
	TransactionWhereInput,
} from "../../../generated/prisma/models";
import { db } from "../../db";
import { ErrorResponseSchema } from "../shared/schemas";
import { TransactionSchema, UpopulatedTransactionSchema } from "./schemas";

export const transactionRoutes = new Elysia({ prefix: "/transactions" })
	.get(
		"/",
		async ({ query }) => {
			const where: TransactionWhereInput = {};
			const dateFilter: DateTimeFilter = {};
			if (query.quantity) where.quantity = query.quantity;
			if (query.userId) where.userId = query.userId;
			if (query.productId) where.productId = query.productId;
			if (query.createdBefore) dateFilter.lte = query.createdBefore;
			if (query.createdAfter) dateFilter.gte = query.createdAfter;
			if (Object.keys(dateFilter).length > 0) where.createdAt = dateFilter;

			return await db.transaction.findMany({
				where,
				select: {
					id: true,
					quantity: true,
					createdAt: true,
					user: {
						select: {
							id: true,
							name: true,
						},
					},
					product: true,
				},
				orderBy: { createdAt: "desc" },
			});
		},
		{
			query: t.Object({
				quantity: t.Optional(t.Integer()),
				userId: t.Optional(t.String()),
				productId: t.Optional(t.String()),
				createdBefore: t.Optional(t.Date()),
				createdAfter: t.Optional(t.Date()),
			}),
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
				quantity: t.Optional(t.Integer()),
			}),
			response: {
				200: UpopulatedTransactionSchema,
				404: ErrorResponseSchema,
			},
		},
	);
