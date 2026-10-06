import { t } from "elysia";
import { PublicUserSchema } from "../users/schemas";

export const PaymentSchema = t.Object({
	id: t.String(),
	user: PublicUserSchema,
	amountInCents: t.Integer(),
	createdAt: t.Date(),
});

export const UnpopulatedPaymentSchema = t.Object({
	id: t.String(),
	userId: t.String(),
	amountInCents: t.Integer(),
	createdAt: t.Date(),
});
