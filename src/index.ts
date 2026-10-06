import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { paymentRoutes } from "./features/payments/routes";
import { productRoutes } from "./features/products/routes";
import { transactionRoutes } from "./features/transactions/routes";
import { userRoutes } from "./features/users/routes";

const app = new Elysia({ prefix: "/api" })
	.use(
		swagger({
			path: "/swagger",
			documentation: {
				info: {
					title: "Spezicount API",
					description: "API for Spezicount application",
					version: "0.1.0",
				},
			},
		}),
	)
	.use(paymentRoutes)
	.use(productRoutes)
	.use(transactionRoutes)
	.use(userRoutes)
	.listen(1609);

console.log(`Spezicount API is listening on port ${app.server?.port}`);
