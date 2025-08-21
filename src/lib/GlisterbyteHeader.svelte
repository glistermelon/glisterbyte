<script>
    import GlisterbyteFullLogo from "./GlisterbyteFullLogo.svelte";
    const { user } = $props();
</script>

<header id="glisterbyte-header">

    <GlisterbyteFullLogo/>

    {#if user}
		<a id="header-pfp" href={`/profile/${user.name}`}>
            <img alt="header pfp" src={user.avatar}>
        </a>
	{:else}
		<a class="button header-button" href="/login">Log In</a>
	{/if}

</header>

<style>

    .header-button {
        height: 2.5rem;
        margin-left: auto;
        align-self: center;
        margin-right: 0.5rem;
        text-align: center;
        display: flex;
        align-items: center;
        padding: 0.8rem;
    }

    #header-pfp {
        width: fit-content;
        height: fit-content;
        align-self: center;
        cursor: pointer;
        margin-bottom: 0.5rem;
        margin-left: auto;
    }

    #header-pfp > img {
        aspect-ratio: 1;
        object-fit: cover;
        max-height: 3.5rem;
        border-radius: 100%;
        border: 1px solid var(--dark-border-color);
    }

</style>