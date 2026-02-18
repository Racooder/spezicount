const PREFIX = "spezi_";

export function generateApiKey(): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let apiKey = PREFIX;
    for (let i = 0; i < 32; i++) {
        apiKey += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return apiKey;
}

export function isValidApiKey(key: string): boolean {
    const apiKeyPattern = new RegExp(`^${PREFIX}[A-Za-z0-9]{32}$`);
    return apiKeyPattern.test(key);
}
