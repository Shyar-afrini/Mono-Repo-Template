import type { Request } from "express";

/**
 * Extracts the base domain from the host header by removing the 'primary-backend.' prefix if it exists.
 * This allows cookies to be shared between subdomains.
 * e.g., 'primary-backend.erbil.example.com' -> '.erbil.example.com'
 */
export function getSharedDomain(req: Request): string | undefined {
    const host = req.headers.host?.split(":")[0];
    if (!host) return undefined;

    if (host.startsWith("primary-backend.")) {
        return `.${host.replace("primary-backend.", "")}`;
    }

    // Fallback for development (localhost)
    if (process.env.NODE_ENV !== "production" && host === "localhost") {
        return "localhost";
    }

    return host;
}
