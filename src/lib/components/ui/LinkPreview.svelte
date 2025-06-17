<script>


	
	/**
	 * @typedef {Object} Props
	 * @property {any} url
	 * @property {any} [width]
	 * @property {any} [height]
	 * @property {string} [className]
	 * @property {any} [imageHeight]
	 * @property {any} [textAlign]
	 * @property {any} [fetcher] - A custom fetcher function that fetches and provides the metadata for urls from a source of your choice.
	 */

	/** @type {Props} */
	let {
		url,
		width = null,
		height = null,
		className = '',
		imageHeight = null,
		textAlign = null,
		fetcher = null
	} = $props();

	async function getMetadata(url) {
		const data = await fetch(`${proxyUrl}?url=${url}`)
			.then((res) => res.json())
			.then((r) => r.metadata);
		return data;
	}

	function clickHandler(e) {
		window.open(url, '_blank');
	}

	const proxyUrl = 'https://rlp-proxy.herokuapp.com/v2';
	const placeholderImg = 'https://i.imgur.com/UeDNBNQ.jpeg';

	let metadata = $derived(fetcher ? fetcher(url) : getMetadata(url));
	
</script>

<div
	class={`Container ${className}`}
	onclick={clickHandler}
	style={`width:${width};height:${height};textAlign:${textAlign}`}
>
	{#await metadata then data}
		<div
			class="Image"
			style={`background-image:url(${data.image || placeholderImg});height:${imageHeight}`}
		></div>
		<div class="LowerContainer">
			<h3 class="Title">{data.title}</h3>
			<span class="Description Secondary">{data.description}</span>
			<div class="Secondary SiteDetails">
				{#if data.siteName}
					<span>{data.siteName} • </span>
				{/if}
				<span>{data.hostname}</span>
			</div>
		</div>
	{/await}
</div>

<style>
	:root {
	--primary: black;
	--secondary: rgb(100, 100, 100);
}

/* common */
.Container {
	text-align: left;
	background-color: white;
	display: flex;
	flex-direction: column;
	border-radius: 7px;
	border: 1px solid #ccc;
	color: var(--primary);
	transition: 0.3s all ease;
	height: fit-content;
}

.Container:hover {
	background-color: rgb(250, 250, 250) !important;
	cursor: pointer;
}

.Secondary {
	color: var(--secondary);
}

.LowerContainer {
	padding: 10px;
}

.Title {
	margin-top: 0;
	margin-bottom: 10px;
}

.Image {
	width: 100%;
	border-top-left-radius: 7px;
	border-top-right-radius: 7px;
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center;
	height: 30vh;
}

.SiteDetails {
	margin-top: 10px;
}

/* sm */
@media (max-width: 640px) {
	.Description {
		display: none;
	}
}
	
/* md */
@media (min-width: 641px) and (max-width: 768px) {
	.Description {
		display: none;
	}
}

</style>