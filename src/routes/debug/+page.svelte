<script>
	// @ts-nocheck

	import { Carta, MarkdownEditor } from 'carta-md'
	import 'carta-md/default.css' /* Default theme */

	const carta = new Carta({
		// Remember to use a sanitizer to prevent XSS attacks!
		// More on that below
		// sanitizer: ...
	})

	let _text = `---
title: Testing media in content
description: Something...
date: 2024-05-22
---

This is a test of pictures and embeds located directly in /static/

![Trash panda icon](/img/trash_panda.png)

This is a test of a picture located on a relative path?

This is a twitter / x link:

https://x.com/SaltagreppoD2/status/1793330694459912247

This is a youtube link:

https://www.youtube.com/watch?v=MTpyHB8KIy4`

	let value = $state(_text)
</script>

<div class="debug-wrapper">
	<div>
		<h2>Code</h2>

		<MarkdownEditor {carta} bind:value />
	</div>
</div>

<style>
	.debug-wrapper > div {
		border: 2px solid #bcbcbc;
		border-radius: 5px;
		padding: 12px;
	}
	:global(.carta-font-code) {
		font-family: '...', monospace;
		font-size: 1.1rem;
		line-height: 1.1rem;
		letter-spacing: normal;
	}
</style>
