<style>

    #content-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    h1 {
        font-size: 2rem;
        margin: 2rem;
        margin-bottom: 0;
    }

    table, .pseudo-yuri-list {
        margin: 2rem;
    }

    tr > * {
        border: 1px solid var(--light-border-color);
        padding: 1rem;
        text-align: center;
    }

    ul {
        list-style: disc;
    }

</style>

<svelte:head>
    <title>Yuri Ranking</title>
</svelte:head>

<div id="content-container">

    <h1>Yuri Ranking</h1>

    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Type (that I viewed)</th>
                <th>Score</th>
                <th>Notes</th>
            </tr>
        </thead>
        <tbody>

            <tr>
                <td>
                    Adachi & Shimamura
                </td>
                <td>
                    manga
                </td>
                <td>
                    good
                </td>
                <td>
                    <a class="hyperlink" href="https://en.wikipedia.org/wiki/Adachi_and_Shimamura#Manga">
                        There are two manga adaptations.
                    </a>
                    I've been reading the 2019 one, but it's incomplete so
                    I'm considering reading the 2016 one.
                    The newer one has a better art style though.
                </td>
            </tr>

            <tr>
                <td>
                    I'm in Love with the Villainess
                </td>
                <td>
                    anime
                </td>
                <td>
                    very good
                </td>
            </tr>

            <tr>
                <td>
                    Destroy It All and Love Me in Hell!
                </td>
                <td>
                    <a class="hyperlink" href="https://dynasty-scans.com/series/destroy_it_all_and_love_me_in_hell">
                        manga
                    </a>
                </td>
                <td>
                    very good
                </td>
            </tr>

        </tbody>
    </table>

    <h1>Kinda yuri?</h1>

    <div class="pseudo-yuri-list">
        <ul>
            <li>Lycoris Recoil</li>
        </ul>
    </div>

    <h1>Fanon yuri</h1>

    <div class="pseudo-yuri-list">
        <ul>
            <li>BanG Dream! It's MyGO!!!!!</li>
        </ul>
    </div>

</div>