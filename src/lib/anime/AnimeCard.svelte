<script>
    let { anime } = $props();
</script>

<div class="card card-{anime.status ? 'finished' : 'dropped'}">
    <div>
        <img
            src={`/uploads/${anime.image}`}
            alt="portrait"
            class="portrait"
        />
        <div>
            <h1 class="card-title">
                {anime.title} 
            </h1>
            <div>
                {#if anime.watchStr}
                    Watched <b>{anime.watchStr}</b>
                {/if}
            </div>
            <div class="score">
                <div>{anime.score}</div>
                <div>
                    <div>enjoyment</div>
                    <div>{anime.enjoyment}</div>
                </div>
                <div>
                    <div>plot</div>
                    <div>{anime.plot}</div>
                </div>
                <div>
                    <div>quality</div>
                    <div>{anime.quality}</div>
                </div>
            </div>
            {#if anime.notes !== null}
                <div class="notes-label">Notes</div>
                <div class="notes">{anime.notes}</div>
            {/if}
        </div>
    </div>
</div>