<script>
    let { animeList } = $props();
</script>

<div class="compact-list">
    <div></div>
    <div></div>
    <div>Title</div>
    <div></div>
    <div></div>
    <div></div>
    <div>Score</div>
    <div>Watch Date</div>
    <div>Status</div>
    {#each animeList as anime, index}
        <div class="listing-index">
            {index + 1}
        </div>
        <img
            src={`/uploads/${anime.image}`}
            alt="portrait"
        />
        <div class="listing-title">
            {anime.title}
        </div>
        <div class="listing-rating">
            e. {anime.enjoyment}
        </div>
        <div class="listing-rating">
            p. {anime.plot}
        </div>
        <div class="listing-rating">
            q. {anime.quality}
        </div>
        <div class="listing-rating">
            <b>{anime.score}</b>
        </div>
        <div>
            {anime.watchStr || ''}
        </div>
        <div class="listing-status {anime.status ? "finished" : "dropped"}">
            {anime.status ? "finished" : "dropped"}
        </div>
    {/each}
</div>

<style>

    .compact-list {
        display: grid;
        grid-template-columns: 4rem 100px 15rem 1.5rem 1.5rem 1.5rem 4rem 10rem 10rem;
        grid-template-rows: auto;
        justify-items: center;
        align-items: center;
        margin-top: 2.7rem;
    }
    
    .compact-list img {
        max-height: 7rem;
        object-fit: cover;
    }

    .listing-index {
        text-align: center;
        font-size: 1.3rem;
        font-weight: 500;
        color: #919191;
    }

    .listing-title {
        padding-left: 1rem;
        padding-right: 1rem;
    }

    .listing-status {
        font-weight: 800;
        font-size: 0.85rem;
        padding: 0.2rem;
        padding-left: 0.4rem;
        padding-right: 0.4rem;
        border-radius: 5px;
    }

    .finished {
        background-color: #09751d;
    }
    
    .dropped {
        background-color: #9b0e0e;
    }

</style>