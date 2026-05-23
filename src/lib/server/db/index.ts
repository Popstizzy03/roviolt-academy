import { createRequire } from "node:module";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "$env/dynamic/private";
import * as schema from "./schema";

/**
 * Force all DNS lookups to resolve only IPv4 addresses.
 * Workaround for Node.js v24 bug where net.connect() and fetch() time out
 * on hostnames with mixed IPv4/IPv6 records in Crostini/Crouton Linux containers.
 */
const require = createRequire(import.meta.url);
const originalDns = require("node:dns");
const origLookup = originalDns.lookup;
originalDns.lookup = ((host: string, opts: unknown, cb: unknown) => {
	if (typeof opts === "function") {
		cb = opts;
		opts = { family: 4 };
	} else if (typeof opts === "number") {
		opts = { family: opts || 4 };
	} else if (opts && typeof opts === "object") {
		(opts as { family?: number }).family ??= 4;
	}
	return (origLookup as (...args: unknown[]) => void)(host, opts, cb);
}) as unknown as typeof originalDns.lookup;

if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

const client = neon(env.DATABASE_URL);

export const db = drizzle(client, { schema });
