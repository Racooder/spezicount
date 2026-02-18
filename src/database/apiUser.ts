import type { ApiUser } from "../generated/prisma/client";
import prisma from "../prisma";

const INITAL_API_USER_DESCRIPTION = "Initial Admin";

export type ApiUserFilter = {
    isAdmin?: boolean;
    createdBefore?: Date;
    createdAfter?: Date;
    lastLoginBefore?: Date;
    lastLoginAfter?: Date;
}

export async function listApiUsers(filter?: ApiUserFilter): Promise<ApiUser[]> {
    const where: any = {};
    if (filter !== undefined) {
        if (filter.isAdmin !== undefined) {
            where.isAdmin = filter.isAdmin;
        }
        if (filter.createdBefore) {
            where.createdAt = { ...where.createdAt, lte: filter.createdBefore };
        }
        if (filter.createdAfter) {
            where.createdAt = { ...where.createdAt, gte: filter.createdAfter };
        }
        if (filter.lastLoginBefore) {
            where.lastLoginAt = { ...where.lastLoginAt, lte: filter.lastLoginBefore };
        }
        if (filter.lastLoginAfter) {
            where.lastLoginAt = { ...where.lastLoginAt, gte: filter.lastLoginAfter };
        }
    }

    return await prisma.apiUser.findMany({
        where: where,
    });
}

export async function getApiUser(key: string): Promise<ApiUser | null> {
    return await prisma.apiUser.findUnique({
        where: {
            key,
        },
    });
}

export async function createApiUser(key: string, isAdmin: boolean): Promise<void> {
    const apiUser = await prisma.apiUser.create({
        data: {
            key,
            isAdmin,
            description: INITAL_API_USER_DESCRIPTION
        },
    });
    if (!apiUser) {
        throw new Error("Failed to create API user");
    }
}

export async function updateApiUser(key: string, updates: Partial<Omit<ApiUser, "id" | "key">>): Promise<void> {
    const updatedApiUser = await prisma.apiUser.update({
        where: {
            key,
        },
        data: updates,
    });
    if (!updatedApiUser) {
        throw new Error("Failed to update API user");
    }
}

export async function deleteApiUser(key: string): Promise<void> {
    const deletedApiUser = await prisma.apiUser.delete({
        where: {
            key,
        },
    });
    if (!deletedApiUser) {
        throw new Error("Failed to delete API user");
    }
}

export async function isRegisteredKey(key: string): Promise<boolean> {
    const apiUser = await getApiUser(key);
    return apiUser !== null;
}

export async function isAdminApiKey(key: string): Promise<boolean> {
    const apiUser = await getApiUser(key);
    return apiUser !== null && apiUser.isAdmin;
}

export async function updateLastLogin(key: string): Promise<void> {
    updateApiUser(key, { lastLoginAt: new Date() }).catch((error) => {
        console.error("Failed to update last login time:", error);
    });
}
