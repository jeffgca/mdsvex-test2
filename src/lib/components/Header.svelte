<script>
	import { resolve } from '$app/paths'
</script>

<div>
	<header>
		<nav class=" flex home-link">
			<a class="flex" href={resolve('/')}>Home</a>
		</nav>
		<nav>
			<ul>
				<li>
					<a href={resolve('/posts')}>Archive</a>
				</li>
				<li>
					<a href={resolve('/about')}>About</a>
				</li>
			</ul>
		</nav>
	</header>
</div>

<style>
</style>
