import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

/**
 * Force all DNS lookups to resolve only IPv4 addresses.
 * Workaround for Node.js v24 bug where net.connect() times out on hostnames
 * with mixed IPv4/IPv6 records in Crostini/Crouton Linux containers.
 */
const originalDns = require("node:dns");
const origLookup = originalDns.lookup;
// biome-ignore lint/suspicious/noExplicitAny: DNS lookup callback types are complex
originalDns.lookup = (host: string, opts: any, cb?: any) => {
	if (typeof opts === "function") {
		cb = opts;
		opts = { family: 4 };
	} else if (typeof opts === "number") {
		opts = { family: opts || 4 };
	} else {
		opts = { ...opts, family: opts?.family || 4 };
	}
	return origLookup(host, opts, cb);
};

dotenv.config({ path: ".env" });

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!dbUrl) {
	throw new Error(
		"Database target URL is missing from your .env environment block!",
	);
}

const connectionUrl = new URL(dbUrl);

if (!connectionUrl.searchParams.has("sslmode")) {
	connectionUrl.searchParams.set("sslmode", "verify-full");
}
if (!connectionUrl.searchParams.has("channel_binding")) {
	connectionUrl.searchParams.set("channel_binding", "require");
}

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/lib/server/db/schema.ts",
	out: "./drizzle",
	dbCredentials: {
		url: connectionUrl.toString(),
	},
	verbose: true,
	strict: true,
});
