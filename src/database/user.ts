import type { User } from "../generated/prisma/client";
import prisma from "../prisma";

export async function listUsers(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users;
}

export async function getUser(id: number): Promise<User | null> {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid user ID");
    }

    const user = await prisma.user.findUnique({
        where: {
            id,
        },
    });
    return user;
}

export async function createUser(name: string): Promise<void> {
    const user = await prisma.user.create({
        data: {
            name,
        },
    })
    if (!user) {
        throw new Error("Failed to create user");
    }
}

export async function deleteUser(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid user ID");
    }

    const deletedUser = await prisma.user.delete({
        where: {
            id: id,
        },
    });
    if (!deletedUser) {
        throw new Error("Failed to delete user");
    }
}
