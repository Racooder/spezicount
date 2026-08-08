import { t } from "elysia";

export const ProductSchema = t.Object({
	id: t.String(),
	name: t.String(),
	priceInCents: t.Integer(),
});
