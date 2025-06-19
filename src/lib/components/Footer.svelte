<script>
	import { base } from '$app/paths'
</script>

<footer>
	<nav>
		<ul>
			<li>
				<a href="/posts">Archive</a>
			</li>
			<li>
				<a href="/about">About</a>
			</li>
			<li>
				<a href="/feed" target="_blank">
					<span>Feed</span>
				</a>
			</li>
		</ul>
	</nav>
</footer>

<style>
	footer {
		padding: 1rem;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		background-color: #232323;
		color: #dedede;
	}

	ul {
		margin: 0;
		list-style-type: none;
		display: flex;
		gap: 1rem;
	}

	ul {
		/* line-height: 3em; */
		align-items: center;
	}

	ul li a span {
		vertical-align: baseline;
	}
</style>
