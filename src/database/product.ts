import type { Product } from "../generated/prisma/client";
import prisma from "../prisma";

export async function listProducts(): Promise<Product[]> {
    const products = await prisma.product.findMany();
    return products;
}

export async function getProduct(id: number): Promise<Product | null> {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid product ID");
    }

    const product = await prisma.product.findUnique({
        where: {
            id,
        },
    });
    return product;
}

export async function createProduct(name: string, price: number): Promise<void> {
    const product = await prisma.product.create({
        data: {
            name,
            price,
        },
    })
    if (!product) {
        throw new Error("Failed to create product");
    }
}

export async function deleteProduct(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid product ID");
    }

    const deletedProduct = await prisma.product.delete({
        where: {
            id: id,
        },
    });
    if (!deletedProduct) {
        throw new Error("Failed to delete product");
    }
}
