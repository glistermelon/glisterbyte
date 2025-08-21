<script>
    import { displayError } from "./displayError";

    let { submit } = $props();

    let searchResults = $state([]);

    function showError() {
        displayError("Something went wrong.");
    }

    async function doSearch(query) {

        const res = await fetch(`/api/searchanime?query=${encodeURIComponent(query)}`);

        if (!res.ok) {
            showError();
            return;
        }

        try {
            let data = await res.json();
            searchResults = data;
        }
        catch (e) {
            console.log(e);
            showError();
        }

    }
</script>

<div id="anime-selector">
    <div id="anime-selector-header">
        <h1>Select Anime</h1>
        <button class="button" onclick={() => submit(null)}>Cancel</button>
    </div>
    <div class="search-section">
        <input id="search-input" type="text">
        <button class="button" onclick={() => doSearch(document.getElementById('search-input').value)}>
            <img alt="search" src="/search.png">
        </button>
    </div>
    <div class="anime-list">
        {#each searchResults as result}
            <button class="anime-row" onclick={() => submit(result)}>
                <div class="portrait-container">
                    <img alt="portrait" src="/uploads/{result.image}">
                </div>
                <div class="anime-title">{result.title}</div>
            </button>
        {/each}
    </div>
</div>

<style>

    #anime-selector {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
        background-color: black;
        border: 1px solid var(--light-border-color);
        padding: 2rem;
        z-index: 7;
    }

    #anime-selector-header {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
    }

    h1 {
        font-size: 2rem;
    }

    #anime-selector-header button {
        padding: 0.6rem;
        padding-top: 0.3rem;
        padding-bottom: 0.3rem;
        margin-left: auto;
    }
    
    .search-section {
        display: flex;
        align-items: center;
        gap: 2rem;
        margin-bottom: 2rem;
    }

    .search-section input {
        width: 30rem;
    }

    .search-section button {
        padding: 0.5rem;
    }

    .search-section img {
        max-height: 1.6rem;
        aspect-ratio: 1;
        filter: invert();
    }

    .anime-list {
        height: 30rem;
        border-top: 1px solid var(--dark-border-color);
        overflow: scroll;
        display: flex;
        flex-direction: column;
        font-size: 1.3rem;
    }

    .anime-row {
        display: flex;
        align-items: center;
        gap: 2rem;
        border-bottom: 1px solid var(--dark-border-color);
    }

    .anime-row:hover {
        background-color: var(--dark-border-color);
        cursor: pointer;
    }

    .portrait-container {
        width: 5.2rem;
        display: flex;
        justify-content: center;
    }
    
    .anime-list img {
        max-height: 7rem;
    }

</style>