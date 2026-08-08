import { t } from "elysia";
import { TransactionSchema } from "../transactions/schemas";

export const PublicUserSchema = t.Object({
	id: t.String(),
	name: t.String(),
	isAdmin: t.Boolean(),
	createdAt: t.Date(),
});

export const UserWithTransactionsSchema = t.Object({
	id: t.String(),
	name: t.String(),
	isAdmin: t.Boolean(),
	createdAt: t.Date(),
	transactions: t.Array(TransactionSchema),
});
