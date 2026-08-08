import Elysia, { t } from "elysia";
import { db } from "../../db";
import { ProductSchema } from "./schemas";

export const productRoutes = new Elysia({ prefix: "/products" })
	.get(
		"/",
		async () => {
			return await db.product.findMany();
		},
		{
			detail: {
				summary: "Get all products",
				description: "Returns a list of all products.",
				tags: ["Products"],
			},
			response: t.Array(ProductSchema),
		},
	)
	.post(
		"/",
		async ({ body }) => {
			return await db.product.create({
				data: body,
			});
		},
		{
			detail: {
				summary: "Create a new product",
				description: "Creates a new product with the provided name and price.",
				tags: ["Products"],
			},
			body: t.Object({
				name: t.String(),
				priceInCents: t.Integer(),
			}),
			response: ProductSchema,
		},
	);
