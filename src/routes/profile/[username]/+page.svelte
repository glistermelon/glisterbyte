<script>

    import GapDot from "$lib/GapDot.svelte";
    import AnimeCardList from "$lib/anime/AnimeCardList.svelte";
    import AnimeCompactList from "$lib/anime/AnimeCompactList.svelte";

    import { error } from "@sveltejs/kit";
    import { onMount } from "svelte";

    import { reorder } from "./profile.js";

    let { data } = $props();
    const { user, signedInUser } = data;
    let rawAnimeList = data.animeList;

    let viewMode = $state('cards');
    let orderBy = $state("score");
    let orderDir = $state("desc");
    let showFinished = $state(true);
    let showDropped = $state(true);

    let animeList = $derived(reorder([ ... rawAnimeList ], orderBy, orderDir, showFinished, showDropped));

    function viewModeIsCards() {
        return document.getElementById("card-view-mode").value === "cards";
    }

    async function resizeCardsContainer() {
        if (!viewModeIsCards()) return;

        const cardsPaddingPx = 50;

        let container = document.getElementsByClassName("cards")[0];
        let card = document.getElementsByClassName("card")[0];

        while (!card) {
            await new Promise(resolve => setTimeout(resolve, 50));
            if (!viewModeIsCards()) return;
            container = document.getElementsByClassName("cards")[0];
            card = document.getElementsByClassName("card")[0];
        }

        const cardMargin = parseInt(getComputedStyle(card).margin);
        const cardWidth = card.offsetWidth + 2 * cardMargin;
        const paddingWidth = cardsPaddingPx * 2;

        const freeWidth = window.innerWidth - paddingWidth;
        const cardsPerRow = Math.min(Math.floor(freeWidth / cardWidth), 3);

        const newWidth = cardsPerRow * cardWidth + 10 + paddingWidth;
        container.style.width = `${newWidth}px`;
    }

    onMount(async () => {
        await resizeCardsContainer();
        window.addEventListener("resize", resizeCardsContainer);

        return () => {
            window.removeEventListener("resize", resizeCardsContainer);
        };
    });

</script>

<svelte:head>
    <title>{user.name}'s Anime</title>
</svelte:head>

<div id="profile-section">
    <div id="profile-section-avatar">
        <img alt="" src={data.user.avatar} />
    </div>
    <div>
        <h1>{user.name}'s Anime Profile</h1>
        <div>
            Finished<GapDot /><b
                >{rawAnimeList.filter((a) => a.status == 1).length}</b
            >
        </div>
        <div>
            Dropped<GapDot /><b
                >{rawAnimeList.filter((a) => a.status == 0).length}</b
            >
        </div>
        <div>Favorite<GapDot /><b>Horimiya</b> (9.3/10)</div>
    </div>
</div>

{#if user.id == signedInUser?.id}
    <div id="edit-profile-section">
        <a class="button" href="/profile/{user.name}/edit">
            Edit Your Profile
        </a>
    </div>
{/if}

<div class="card-view-opt-section">
    <span>VIEW AS</span>
    <select name="card-view-mode" id="card-view-mode" bind:value={viewMode} onchange={resizeCardsContainer}>
        <option value="cards">Cards</option>
        <option value="compact">Compact</option>
    </select>
</div>

<div class="card-view-opt-section">
    <span>ORDER BY</span>
    <select name="card-order-key" id="card-order-key" bind:value={orderBy}>
        <option value="score">Score</option>
        <option value="chrono">Watch Order</option>
    </select>
    <select name="card-order-dir" id="card-order-dir" bind:value={orderDir}>
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
    </select>
    <div id="show-finished-div">
        <input type="checkbox" id="show-finished" bind:checked={showFinished} />
        <label for="show-finisAnimeCompactListhed">Finished</label><br />
    </div>
    <div>
        <input type="checkbox" id="show-dropped" bind:checked={showDropped} />
        <label for="show-dropped">Dropped</label><br />
    </div>
</div>

{#if viewMode == 'cards'}
    <AnimeCardList {animeList} />
{:else}
    <AnimeCompactList {animeList} />
{/if}

<style>
    #edit-profile-section {
        display: flex;
        justify-content: center;
    }

    #edit-profile-section a {
        padding: 4rem;
        padding-top: 1rem;
        padding-bottom: 1rem;
        font-size: 1.2rem;
        font-weight: 700;
        margin-bottom: 2rem;
    }
</style>
