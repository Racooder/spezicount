import { t } from "elysia";
import { UserTransactionSchema } from "../transactions/schemas";

export const PublicUserSchema = t.Object({
	id: t.String(),
	name: t.String(),
});

export const UserSchema = t.Object({
	id: t.String(),
	name: t.String(),
	isAdmin: t.Boolean(),
	createdAt: t.Date(),
});

export const UserWithTransactionsSchema = t.Object({
	id: t.String(),
	name: t.String(),
	isAdmin: t.Boolean(),
	transactions: t.Array(UserTransactionSchema),
	createdAt: t.Date(),
});
