<script>
	import { base } from '$app/paths'
	console.log('Header', base)
</script>

<div>
	<header>
		<nav class=" flex home-link">
			<a class="flex" href="{base}/">Home</a>
			<nav>
				<ul>
					<li>
						<a href="{base}/posts">Archive</a>
					</li>
					<li>
						<a href="{base}/about">About</a>
					</li>
				</ul>
			</nav>
		</nav>
	</header>
</div>

<style>
</style>
