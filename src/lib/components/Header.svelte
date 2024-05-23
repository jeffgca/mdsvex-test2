<script>
	import { BugOutline } from 'flowbite-svelte-icons'
</script>

<div>
	<header>
		<nav class="home-link">
			<a href="/">
					<BugOutline color="green" transform="rotate(45)" size="xl"/>
			</a>
		</nav>

		<nav>
			<ul>
				<li>
					<a href="/posts">Archive</a>
				</li>
				<li>
					<a href="/about">About</a>
				</li>
			</ul>
		</nav>
	</header>
</div>

<style>
	header {
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

	a {
		text-decoration: none;
		color: inherit;
	}

	nav.home-link > a {
		display: inline;
		border: 1px red dashed;
	}
</style>
