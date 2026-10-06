import { t } from "elysia";
import { ProductSchema } from "../products/schemas";
import { PublicUserSchema } from "../users/schemas";

export const TransactionSchema = t.Object({
	id: t.String(),
	user: PublicUserSchema,
	product: ProductSchema,
	quantity: t.Integer(),
	createdAt: t.Date(),
});

export const UpopulatedTransactionSchema = t.Object({
	id: t.String(),
	userId: t.String(),
	productId: t.String(),
	quantity: t.Integer(),
});

export const UserTransactionSchema = t.Object({
	id: t.String(),
	product: ProductSchema,
	quantity: t.Integer(),
	createdAt: t.Date(),
});
