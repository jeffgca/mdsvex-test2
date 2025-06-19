import html from 'remark-html'
import { remark } from 'remark'
import imgLinks from '@pondorasti/remark-img-links'

// console.log('what', typeof remark, remark)

const _md = `---
title: Testing media in content
description: Something...
date: 2024-05-22
---

This is a test of pictures and embeds located directly in /static/

![Trash panda icon](/img/trash_panda.png)

This is a test of a picture located on a relative path?

![Flaming skull icon](./img/skull.png)

This is a twitter / x link:

https://x.com/SaltagreppoD2/status/1793330694459912247

This is a youtube link:

https://www.youtube.com/watch?v=MTpyHB8KIy4
`

console.log('got here')

remark()
	.use(imgLinks, { absolutePath: 'https://cdn.domain.com/' })
	.use(html)
	.process(_md, (err, file) => {
		if (err) throw err
		console.log(String(file))
	})
