import { t } from "elysia";

export const ErrorResponseSchema = t.Object({
	error: t.String(),
});
