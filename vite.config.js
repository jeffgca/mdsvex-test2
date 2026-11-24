/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { mdsvex } from 'mdsvex'
import { createHighlighter } from 'shiki'
import { defineConfig } from 'vite'
import svelteConfig from './svelte-options.js'

const theme = 'github-dark'
const highlighter = await createHighlighter({
	themes: [theme],
	langs: ['javascript', 'typescript'],
})

export default defineConfig({
	plugins: [
		tailwindcss(),
		mdsvex({
			extensions: ['.svx', '.md'],
			highlight: (code, { lang }) =>
				highlighter.codeToHtml(code, { lang, theme }),
		}),
		sveltekit(svelteConfig),
	],
	build: {
		target: 'es2022',
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/setupTests.js',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		// Exclude Svelte component tests for now - they need browser mode
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
			'src/lib/components/**/*.test.js',
		],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: ['node_modules/', 'src/setupTests.js'],
		},
	},
})
