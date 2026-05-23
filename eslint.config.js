import path from "node:path";
import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import { defineConfig } from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";
import svelteConfig from "./svelte.config.js";

const gitignorePath = path.resolve(import.meta.dirname, ".gitignore");

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	{
		ignores: [
			"**/*.ts",
			"!**/*.svelte.ts",
			"**/*.js",
			"!**/*.svelte.js",
			"**/*.cjs",
			"**/*.mjs",
			"**/*.json",
			"**/*.css",
			"**/*.md",
			"**/*.svx",
		],
	},
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			"no-undef": "off",
		},
	},
	{
		files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.json",
				extraFileExtensions: [".svelte"],
				parser: ts.parser,
				svelteConfig,
			},
		},
	},
	{
		rules: {
			// Wrapper components (Button, etc.) receive pre-resolved href props;
			// calling resolve() again would break subpath deployments.
			// ignoreLinks checks goto() calls while allowing normal <a href> links.
			"svelte/no-navigation-without-resolve": ["error", { ignoreLinks: true }],
		},
	},
);
