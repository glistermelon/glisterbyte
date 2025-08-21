<script>
    import AnimeCard from "./AnimeCard.svelte";

    let { animeList } = $props();
</script>

<div class="cards">
    {#each animeList as anime}
        <AnimeCard anime={anime} />
    {/each}
</div>