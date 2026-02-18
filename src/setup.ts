import { createApiUser, listApiUsers } from "./database/apiUser";
import { generateApiKey } from "./key";

async function isSetup(): Promise<boolean> {
    const apiAdmins = await listApiUsers({ isAdmin: true });
    return apiAdmins.length > 0;
}

export default async function setup() {
    if (await isSetup()) {
        return;
    }

    const key = generateApiKey();
    try {
        await createApiUser(key, true);
    } catch (error) {
        console.error("Failed to create API user:", error);
        throw error;
    }
    console.log("Setup complete. Initial API key:", key);
}
