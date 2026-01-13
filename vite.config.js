/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
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
