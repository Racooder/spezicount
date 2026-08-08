import { t } from "elysia";
import { ProductSchema } from "../products/schemas";

export const TransactionSchema = t.Object({
	id: t.String(),
	product: ProductSchema,
	quantity: t.Number(),
	createdAt: t.Date(),
});

export const UpopulatedTransactionSchema = t.Object({
	id: t.String(),
	productId: t.String(),
	quantity: t.Optional(t.Integer()),
});
