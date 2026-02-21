import express from "express";
import { generateApiKey, isValidApiKey } from "./key";
import { createUser, deleteUser, getUser, listUsers } from "./database/user";
import setup from "./setup";
import { createApiUser, deleteApiUser, isAdminApiKey, isRegisteredKey, listApiUsers, updateApiUser, updateLastLogin, type ApiUserFilter } from "./database/apiUser";
import { createProduct, deleteProduct, getProduct, listProducts } from "./database/product";
import { createOrder, deleteOrder, getOrder, listOrders, type OrderFilter } from "./database/order";
import type { ApiUser } from "./generated/prisma/browser";

const WWW_AUTHENTICATE_HEADER_VALUE = 'Basic realm="api"';

const app = express();
app.use(express.json());

// * Authentication

async function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const apiKey = req.query.api_key || req.headers["x-api-key"];
    if (typeof apiKey !== "string" || !await isAdminApiKey(apiKey)) {
        console.warn(`Unauthorized access attempt to ${req.method} ${req.path} with API key:`, apiKey);
        return res.status(403).send("Admin API key required");
    }
    next();
}

async function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
    const apiKey = req.query.api_key || req.headers["x-api-key"];

    if (typeof apiKey !== "string") {
        res.set("WWW-Authenticate", WWW_AUTHENTICATE_HEADER_VALUE);
        return res.status(401).send("No API key provided");
    }
    if (!isValidApiKey(apiKey)) {
        return res.status(400).send("Invalid API key format");
    }
    if (!await isRegisteredKey(apiKey)) {
        res.set("WWW-Authenticate", WWW_AUTHENTICATE_HEADER_VALUE);
        return res.status(403).send("Invalid API key");
    }

    updateLastLogin(apiKey);
    next(); // API key is valid and registered
}

app.use(auth);

// * Routes

app.get("/", async (req, res) => {
    res.send({
        "api-users": {
            "GET (isAdmin: boolean, )": "List API users (admin only)",
            "POST (isAdmin: boolean)": "Create API user (admin only)",
        },
        "api-users/:key": {
            "GET ()": "Get API user by key (admin only)",
            "PATCH ()": "Update API user by key (admin only)",
            "DELETE ()": "Delete API user by key (admin only)",
        },
        "users": {
            "GET ()": "List users",
            "POST ()": "Create user (admin only)",
        },
        "users/:id": {
            "GET ()": "Get user by ID",
            "DELETE ()": "Delete user by ID (admin only)",
        },
        "products": {
            "GET ()": "List products",
            "POST ()": "Create product (admin only)",
        },
        "products/:id": {
            "GET ()": "Get product by ID",
            "DELETE ()": "Delete product by ID (admin only)",
        },
        "orders": {
            "GET ()": "List orders",
            "POST ()": "Create order",
        },
        "orders/:id": {
            "GET ()": "Get order by ID",
            "DELETE ()": "Delete order by ID",
        },
    });
});

// * API Users

app.get("/api-users", requireAdmin, async (req, res) => {
    const filter: ApiUserFilter = {
        isAdmin: typeof req.query.isAdmin === "boolean" ? req.query.isAdmin : undefined,
        createdBefore: req.query.createdBefore ? new Date(req.query.createdBefore as string) : undefined,
        createdAfter: req.query.createdAfter ? new Date(req.query.createdAfter as string) : undefined,
        lastLoginBefore: req.query.lastLoginBefore ? new Date(req.query.lastLoginBefore as string) : undefined,
        lastLoginAfter: req.query.lastLoginAfter ? new Date(req.query.lastLoginAfter as string) : undefined,
    };

    const apiUsers = await listApiUsers(filter);
    res.json(apiUsers);
});

app.get("/api-users/:key", requireAdmin, async (req, res) => {
    const key = req.params.key;
    if (typeof key !== "string") {
        return res.status(400).send("Invalid API key");
    }

    const apiUser = await listApiUsers({ isAdmin: true, createdBefore: new Date(), createdAfter: new Date(0) });
    if (!apiUser) {
        return res.status(404).send("API user not found");
    }
    res.json(apiUser);
});

app.post("/api-users", requireAdmin, async (req, res) => {
    console.log(req.body);
    if (typeof req.body !== "object") {
        return res.status(400).send("Invalid request body");
    }

    const isAdmin = req.body.isAdmin;
    console.log("isAdmin:", isAdmin, "type:", typeof isAdmin);

    if (typeof isAdmin !== "boolean") {
        return res.status(400).send("Invalid isAdmin value");
    }

    const key = generateApiKey();

    try {
        await createApiUser(key, isAdmin);
        res.status(201).json({ key });
    } catch (error) {
        console.error("Failed to create API user:", error);
        res.status(500).send("Failed to create API user");
    }
});

app.patch("/api-users/:key", requireAdmin, async (req, res) => {
    const key = req.params.key;
    if (typeof key !== "string") {
        return res.status(400).send("Invalid API key");
    }

    console.log(req.body);
    if (typeof req.body !== "object") {
        return res.status(400).send("Invalid request body");
    }

    const updates: Partial<Omit<ApiUser, "id" | "key">> = {};
    if (req.body.isAdmin !== undefined) {
        if (typeof req.body.isAdmin !== "boolean") {
            return res.status(400).send("Invalid isAdmin value");
        }
        updates.isAdmin = req.body.isAdmin;
    }
    if (req.body.description !== undefined) {
        if (typeof req.body.description !== "string") {
            return res.status(400).send("Invalid description value");
        }
        updates.description = req.body.description;
    }

    try {
        await updateApiUser(key, updates);
        res.send("API user updated");
    } catch (error) {
        console.error("Failed to update API user:", error);
        res.status(500).send("Failed to update API user");
    }
});

app.delete("/api-users/:key", requireAdmin, async (req, res) => {
    const key = req.params.key;
    if (typeof key !== "string") {
        return res.status(400).send("Invalid API key");
    }
    if (key === req.query.api_key || key === req.headers["x-api-key"]) {
        return res.status(400).send("Cannot delete own API user");
    }

    try {
        await deleteApiUser(key);
        res.send("API user deleted");
    } catch (error) {
        console.warn("Failed to delete API user:", error);
        res.status(500).send("Failed to delete API user");
    }
});

// * Users

app.get("/users", async (req, res) => {
    const users = await listUsers();
    res.json(users);
});

app.get("/users/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
        return res.status(400).send("Invalid user ID");
    }

    const user = await getUser(id);
    if (!user) {
        return res.status(404).send("User not found");
    }
    res.json(user);
});

app.post("/users", requireAdmin, async (req, res) => {
    console.log(req.body);
    if (typeof req.body !== "object") {
        return res.status(400).send("Invalid request body");
    }

    const name = req.body.name;
    if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).send("Invalid user name");
    }

    try {
        await createUser(name);
        res.status(201).send("User created");
    } catch (error) {
        console.error("Failed to create user:", error);
        res.status(500).send("Failed to create user");
    }
});

app.delete("/users/:id", requireAdmin, async (req, res) => {
    if (typeof req.params.id !== "string") {
        return res.status(400).send("Invalid user ID");
    }
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
        return res.status(400).send("Invalid user ID");
    }

    try {
        await deleteUser(id);
        res.send("User deleted");
    } catch (error) {
        console.warn("Failed to delete user:", error);
        res.status(500).send("Failed to delete user");
    }
});

// * Products

app.get("/products", async (req, res) => {
    const products = await listProducts();
    res.json(products);
});

app.get("/products/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
        return res.status(400).send("Invalid product ID");
    }

    const product = await getProduct(id);
    if (!product) {
        return res.status(404).send("Product not found");
    }
    res.json(product);
});

app.post("/products", requireAdmin, async (req, res) => {
    console.log(req.body);
    if (typeof req.body !== "object") {
        return res.status(400).send("Invalid request body");
    }

    const name = req.body.name;
    const price = req.body.price;

    if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).send("Invalid product name");
    }
    if (typeof price !== "number") {
        return res.status(400).send("Invalid product price");
    }

    try {
        await createProduct(name, price);
        res.status(201).send("Product created");
    } catch (error) {
        console.error("Failed to create product:", error);
        res.status(500).send("Failed to create product");
    }
});

app.delete("/products/:id", requireAdmin, async (req, res) => {
    if (typeof req.params.id !== "string") {
        return res.status(400).send("Invalid product ID");
    }
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
        return res.status(400).send("Invalid product ID");
    }

    try {
        await deleteProduct(id);
        res.send("Product deleted");
    } catch (error) {
        console.warn("Failed to delete product:", error);
        res.status(500).send("Failed to delete product");
    }
});

// * Orders

app.get("/orders", async (req, res) => {
    const filter: OrderFilter = {
        userId: req.query.userId ? parseInt(req.query.userId as string, 10) : undefined,
        productId: req.query.productId ? parseInt(req.query.productId as string, 10) : undefined,
        before: req.query.before ? new Date(req.query.before as string) : undefined,
        after: req.query.after ? new Date(req.query.after as string) : undefined,
    };

    const orders = await listOrders(filter);
    res.json(orders);
});

app.get("/orders/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
        return res.status(400).send("Invalid order ID");
    }

    const order = await getOrder(id);
    if (!order) {
        return res.status(404).send("Order not found");
    }
    res.json(order);
});

app.post("/orders", async (req, res) => {
    console.log(req.body);
    if (typeof req.body !== "object") {
        return res.status(400).send("Invalid request body");
    }

    const productId = req.body.productId;
    const userId = req.body.userId;

    if (typeof productId !== "number" || !Number.isInteger(productId) || productId <= 0) {
        return res.status(400).send("Invalid product ID");
    }
    if (typeof userId !== "number" || !Number.isInteger(userId) || userId <= 0) {
        return res.status(400).send("Invalid user ID");
    }

    try {
        await createOrder(productId, userId);
        res.status(201).send("Order created");
    } catch (error) {
        console.error("Failed to create order:", error);
        res.status(500).send("Failed to create order");
    }
});

app.delete("/orders/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
        return res.status(400).send("Invalid order ID");
    }

    try {
        await deleteOrder(id);
        res.send("Order deleted");
    } catch (error) {
        console.warn("Failed to delete order:", error);
        res.status(500).send("Failed to delete order");
    }
});

// * Setup

const PORT = process.env.PORT || 3000;
setup().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
