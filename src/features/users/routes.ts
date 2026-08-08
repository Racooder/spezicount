import { Elysia, t } from "elysia";
import { db } from "../../db";
import { ErrorResponseSchema } from "../shared/schemas";
import { PublicUserSchema, UserWithTransactionsSchema } from "./schemas";

export const userRoutes = new Elysia({ prefix: "/users" })
	.get(
		"/",
		async () => {
			return await db.user.findMany({
				orderBy: { createdAt: "desc" },
			});
		},
		{
			detail: {
				summary: "Get all users",
				description: "Returns a list of all users.",
				tags: ["Users"],
			},
			response: t.Array(PublicUserSchema),
		},
	)

	.post(
		"/",
		async ({ body }) => {
			return await db.user.create({
				data: body,
			});
		},
		{
			detail: {
				summary: "Create a new user",
				description:
					"Creates a new user with the provided name and optional admin status.",
				tags: ["Users"],
			},
			body: t.Object({
				name: t.String(),
				isAdmin: t.Optional(t.Boolean()),
			}),
			response: PublicUserSchema,
		},
	)

	.get(
		"/:id",
		async ({ params, set }) => {
			const user = await db.user.findUnique({
				where: { id: params.id },
			});

			if (!user) {
				set.status = 404;
				return { error: "User not found" };
			}

			return user;
		},
		{
			detail: {
				summary: "Get a user details",
				description: "Returns details of the user with the specified UUID.",
				tags: ["Users"],
			},
			params: t.Object({
				id: t.String({ summary: "User UUID" }),
			}),
			response: {
				200: PublicUserSchema,
				404: ErrorResponseSchema,
			},
		},
	)

	.get(
		"/:id/transactions",
		async ({ params, set }) => {
			const user = await db.user.findUnique({
				where: { id: params.id },
				select: {
					id: true,
					name: true,
					isAdmin: true,
					createdAt: true,
					transactions: {
						include: {
							product: true,
						},
					},
				},
			});

			if (!user) {
				set.status = 404;
				return { error: "User not found" };
			}

			return user;
		},
		{
			detail: {
				summary: "Get a user transactions",
				description:
					"Returns the transactions of the user with the specified UUID.",
				tags: ["Users"],
			},
			params: t.Object({
				id: t.String({ summary: "User UUID" }),
			}),
			response: {
				200: UserWithTransactionsSchema,
				404: ErrorResponseSchema,
			},
		},
	);
