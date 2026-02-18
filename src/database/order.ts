import type { Order } from "../generated/prisma/client";
import prisma from "../prisma";

export type OrderFilter = {
    userId?: number;
    productId?: number;
    before?: Date;
    after?: Date;
}

export async function listOrders(filter?: OrderFilter): Promise<Order[]> {
    const where: any = {};
    if (filter !== undefined) {
        if (filter.userId !== undefined) {
            where.userId = filter.userId;
        }
        if (filter.productId !== undefined) {
            where.productId = filter.productId;
        }
        if (filter.before !== undefined) {
            where.createdAt = { ...where.createdAt, lte: filter.before };
        }
        if (filter.after !== undefined) {
            where.createdAt = { ...where.createdAt, gte: filter.after };
        }
    }

    const orders = await prisma.order.findMany({
        where,
    });
    return orders;
}

export async function getOrder(id: number): Promise<Order | null> {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid order ID");
    }

    const order = await prisma.order.findUnique({
        where: {
            id,
        },
    });
    return order;
}

export async function createOrder(productId: number, userId: number): Promise<void> {
    if (!Number.isInteger(productId) || productId <= 0) {
        throw new Error("Invalid product ID");
    }
    if (!Number.isInteger(userId) || userId <= 0) {
        throw new Error("Invalid user ID");
    }

    const order = await prisma.order.create({
        data: {
            productId,
            userId,
        },
    });
    if (!order) {
        throw new Error("Failed to create order");
    }
}

export async function deleteOrder(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid order ID");
    }

    const deletedOrder = await prisma.order.delete({
        where: {
            id: id,
        },
    });
    if (!deletedOrder) {
        throw new Error("Failed to delete order");
    }
}
