<script>
    import GapDot from "$lib/GapDot.svelte";
    import AnimeCard from "$lib/anime/AnimeCard.svelte";
    import AnimeCardList from "$lib/anime/AnimeCardList.svelte";
    import { error } from "@sveltejs/kit";
    import { enhance } from '$app/forms';
    import { onMount, tick } from "svelte";
    import LongTextInput from "$lib/LongTextInput.svelte";
    import { inputLongText } from "$lib/LongTextInput.js";
    import { showWindowCover, hideWindowCover } from '$lib/windowCover.js';
    import FileUpload from "$lib/FileUpload.svelte";
    import { animeSearch } from "$lib/AnimeSelector";
    import { displayError, hideError } from "$lib/displayError.js";
    import { reorder } from "../profile.js";

    const { data } = $props();
    let user = $state(data.user);
    let animeList = $state(reorder(data.animeList, 'chrono', 'desc', true, true));

    let changeCounter = $state(0);
    let changedAnimeIds = new Set();
    let removedAnimeIds = new Set();

    let dragElm = null;
    let clientY = null;

    let animeElmById = {};

    let saveBufferElm;
    let saveChangesElm;
    let avatarCropAlertElm;

    onMount(() => {
        saveBufferElm = document.getElementById("save-changes-loading");
        saveChangesElm = document.getElementById("save-changes");
        avatarCropAlertElm = document.getElementById("avatar-crop-alert");
    })

    function getAnimeIdByElm(elm) {
        for (const entry of Object.entries(animeElmById)) {
            if (entry[1] == elm) {
                return entry[0];
            }
        }
        return null;
    }

    function startDrag(e, elm) {
        e.stopPropagation();
        dragElm = elm;
        window.addEventListener("click", finishDrag, { once: true });
        window.addEventListener("mousemove", dragUpdate);
        window.addEventListener("scroll", scrollUpdate);
        indicateDragTarget(e.clientY);
        showWindowCover(true);
    }

    function finishDrag(e) {
        window.removeEventListener("mousemove", dragUpdate);
        window.removeEventListener("scroll", scrollUpdate);
        stopIndicatingDragTarget();

        let { dropElm, dropBefore } = getDragTarget(e.clientY);

        if (dropElm !== null && dropBefore !== null) {
            let dragId = getAnimeIdByElm(dragElm);
            let dropId = getAnimeIdByElm(dropElm);

            let dragIndex = null;
            let dropIndex = null;
            for (let i = 0; i < animeList.length; i++) {
                if (animeList[i].animeId == dragId) {
                    dragIndex = i;
                }
                if (animeList[i].animeId == dropId) {
                    dropIndex = i;
                }
            }

            if (
                dragIndex !== null &&
                dropIndex !== null &&
                dragIndex != dropIndex
            ) {
                let [dragItem] = animeList.splice(dragIndex, 1);
                if (dragIndex > dropIndex) {
                    if (!dropBefore) dropIndex++;
                } else {
                    if (dropBefore) dropIndex--;
                }
                animeList.splice(dropIndex, 0, dragItem);
            }
        }

        hideWindowCover();

        setOrderLinks();
    }

    function getDragTarget(curY) {
        let dropElm = null;
        let dropBefore = null;

        const elements = [
            ...document.getElementById("anime-edit-list").children,
        ];
        let minDist = 99999999999;
        elements.forEach((elm) => {
            const rect = elm.getBoundingClientRect();
            const dist = Math.abs(rect.top - curY);
            if (dist < minDist) {
                minDist = dist;
                dropElm = elm;
                dropBefore = true;
            }
        });
        const endY =
            elements[elements.length - 1].getBoundingClientRect().bottom;
        const dist = Math.abs(endY - curY);
        if (dist < minDist) {
            dropElm = elements[elements.length - 1];
            dropBefore = false;
        }

        return { dropElm, dropBefore };
    }

    function dragUpdate(e) {
        indicateDragTarget(e.clientY);
    }

    function scrollUpdate() {
        indicateDragTarget(clientY);
    }

    function stopIndicatingDragTarget() {
        for (const elm of document.getElementsByClassName(
            "anime-listing-highlight",
        )) {
            elm.classList.remove("anime-listing-highlight");
        }
        for (const elm of document.getElementsByClassName(
            "anime-listing-highlight-after",
        )) {
            elm.classList.remove("anime-listing-highlight-after");
        }
    }

    function indicateDragTarget(curY) {
        clientY = curY;
        stopIndicatingDragTarget();
        let { dropElm, dropBefore } = getDragTarget(curY);
        if (dropElm) {
            dropElm.classList.add("anime-listing-highlight");
        }
        if (!dropBefore) {
            dropElm.classList.add("anime-listing-highlight-after");
        }
    }

    function markChange(animeId, removed) {

        if (!removed) changedAnimeIds.add(animeId);

        changeCounter = changedAnimeIds.size + removedAnimeIds.size;

        if (changeCounter > 0) {
            saveChangesElm.classList.remove("save-changes-disabled");
        }
        
    }

    function resetChangeCounter() {

        changedAnimeIds.clear();
        removedAnimeIds.clear();
        changeCounter = 0;

        saveChangesElm.classList.add("save-changes-disabled");

    }

    function setOrderLinks() {
        if (animeList.length == 0) return;
        if (animeList[animeList.length - 1].afterAnimeId !== null) {
            markChange(animeList[animeList.length - 1].animeId);
            animeList[animeList.length - 1].afterAnimeId = null;
        }
        for (let i = animeList.length - 2; i >= 0; i--) {
            let prevId = animeList[i + 1].animeId;
            if (animeList[i].afterAnimeId != prevId) {
                markChange(animeList[i].animeId);
                animeList[i].afterAnimeId = prevId;
            }
        }
    }

    function removeAnime(animeId) {
        for (let i = 0; i < animeList.length; i++) {
            if (animeList[i].animeId == animeId) {
                animeList.splice(i, 1);
                break;
            }
        }
        removedAnimeIds.add(animeId);
        markChange(animeId, true);
    }

    function showSaveChangesLoading() {
        saveBufferElm.style.visibility = 'visible';
    }

    function hideSaveChangesLoading() {
        saveBufferElm.style.visibility = 'hidden';
    }

    async function saveChanges({ formData, cancel }) {

        showWindowCover(false);
        showSaveChangesLoading();
        hideError();

        let updates = [];
        for (const animeId of changedAnimeIds) {

            const updated = animeList.find((a) => a.animeId == animeId);

            if (!updated) {
                displayError(`Error: code 1-${animeId}`);
                cancel();
                hideSaveChangesLoading();
                return;
            }

            updates.push({
                enjoyment: parseInt(updated.enjoyment),
                plot: parseInt(updated.plot),
                quality: parseInt(updated.quality),
                status: updated.status ? 0 : 1,
                notes: updated.notes,
                watchDay: parseInt(updated.watchDay),
                watchMonth: parseInt(updated.watchMonth),
                watchYear: parseInt(updated.watchYear),
                afterAnimeId: updated.afterAnimeId,
                animeId: updated.animeId,
                reviewId: updated.reviewId
            });

        }
        formData.append('updateData', JSON.stringify(updates));

        formData.append('removeData', JSON.stringify(Array.from(removedAnimeIds)));

        return async ({ result }) => {
            if (result.type == 'error') {
                displayError(result.error.message);
            }
            else {
                resetChangeCounter();
            }
            hideWindowCover();
            hideSaveChangesLoading();
        };

    }

    async function updateNotes(animeId, initValue) {
        const anime = animeList.find(a => a.animeId == animeId);
        if (!anime) {
            displayError("Something went wrong.");
            return;
        }
        anime.notes = await inputLongText("Edit Notes", initValue);
        if (anime.notes === '') anime.notes = null;
        markChange(animeId);
    }

    function showAvatarChangePrompt() {
        avatarCropAlertElm.style.visibility = 'visible';
        showWindowCover(false, true);
    }

    function hideAvatarChangePrompt() {
        avatarCropAlertElm.style.visibility = 'hidden';
        hideWindowCover();
    }

    async function avatarChangePrehandle() {
        showAvatarChangePrompt();
        return await new Promise(resolve => {

            let cancelButton = document.getElementById('avatar-change-cancel');
            let continueButton = document.getElementById('avatar-change-continue');

            function removeEventListeners() {
                cancelButton.removeEventListener('click', onCancel);
                continueButton.removeEventListener('click', onContinue);
                hideAvatarChangePrompt();
            }

            function onCancel() {
                removeEventListeners();
                resolve(false);
            }
            function onContinue() {
                removeEventListeners();
                resolve(true);
            }

            cancelButton.addEventListener('click', onCancel);
            continueButton.addEventListener('click', onContinue);

        });
    }

    function avatarChangePosthandle(url) {
        user.avatar = url;
    }

    async function addAnime() {

        let anime = await animeSearch();
        if (!anime) return;

        data.title = anime.title;
        data.image = anime.image;
        data.animeId = anime.id;
        data.status = true;
        data.afterAnimeId = animeList.length > 0 ? animeList[animeList.length - 1].animeId : null;
        data.reviewId = null;

        animeList.push(data);

        markChange(data.animeId);

        await tick();
        let elements = document.getElementById('anime-edit-list').children;
        elements[elements.length - 1].scrollIntoView({ behavior: 'smooth' });

    }

</script>

<svelte:head>
    <title>Profile Editor</title>
</svelte:head>

<div id="avatar-crop-alert">
    <h1>Read this</h1>
    This is a low budget website that does not
    provide any functionality for scaling or
    cropping your profile picture. You will have
    to do it yourself before uploading.
    I recommend
    <a
        href="https://avatarcropper.com/"
        class="hyperlink"
        target="_blank"
    >
        this tool
    </a>.
    <div>
        <button class="button" id="avatar-change-cancel">Cancel</button>
        <button class="button" id="avatar-change-continue">Continue</button>
    </div>
</div>

<div id="profile-section">
    <div id="profile-section-avatar">
        <img alt="" src={user.avatar}>
        <div id="profile-section-avatar-edit">
            <div>edit</div>
            <FileUpload endpoint="/api/setavatar" prehandle={avatarChangePrehandle} upload={avatarChangePosthandle} _class="avatar-file-upload" />
        </div>
    </div>
    <div>
        <h1>glistermelon's Anime Profile</h1>
        <div>Finished<GapDot/><b>{animeList.filter(a => a.status == 1).length}</b></div>
        <div>Dropped<GapDot/><b>{animeList.filter(a => a.status == 0).length}</b></div>
        <div>Favorite<GapDot/><b>Horimiya</b> (9.3)</div>
    </div>
</div>

<div id="add-anime-section">
    <button class="button" id="add-anime-button" onclick={addAnime}>
        Add Anime
    </button>
</div>

<form id="save-changes" class="save-changes-disabled" method="POST" use:enhance={saveChanges}>
    <button type="submit" class="button">
        Save Changes ({changeCounter})
        <div id="save-changes-loading">
            <img alt="loading" src="/loading.gif">
        </div>
    </button>
</form>

<div id="anime-edit-list">
    {#each animeList as anime (anime.animeId)}
        <div
            class="anime-listing"
            bind:this={animeElmById[anime.animeId]}
        >
            <button
                class="atypical-button drag-area"
                onclick={(e) => startDrag(e, animeElmById[anime.animeId])}
            >
                <img alt="drag" src="/drag.png" />
            </button>

            <div class="portrait-container">
                <img
                    src={`/uploads/${anime.image}`}
                    alt="portrait"
                    class="portrait"
                />
            </div>

            <div class="anime-title">{anime.title}</div>

            <table class="review-table">
                <tbody>
                    <tr>
                        <td>enjoyment</td>
                        <td
                            ><input
                                type="text"
                                name="enjoyment:{anime.animeId}"
                                bind:value={anime.enjoyment}
                                oninput={() => markChange(anime.animeId)}
                                autocomplete="off"
                            /></td
                        >
                    </tr>
                    <tr>
                        <td>plot</td>
                        <td
                            ><input
                                type="text"
                                name="plot:{anime.animeId}"
                                bind:value={anime.plot}
                                oninput={() => markChange(anime.animeId)}
                                autocomplete="off"
                            /></td
                        >
                    </tr>
                    <tr>
                        <td>quality</td>
                        <td
                            ><input
                                type="text"
                                name="quality:{anime.animeId}"
                                bind:value={anime.quality}
                                oninput={() => markChange(anime.animeId)}
                                autocomplete="off"
                            /></td
                        >
                    </tr>
                </tbody>
            </table>

            <div class="date-section">
                <div class="date-section-header">
                    <b>Date</b>
                </div>
                <table>
                    <tbody>
                        <tr>
                            <td>year</td>
                            <td
                                ><input
                                    type="text"
                                    name="year:{anime.animeId}"
                                    bind:value={anime.watchYear}
                                    oninput={() => markChange(anime.animeId)}
                                    autocomplete="off"
                                /></td
                            >
                        </tr>
                        <tr>
                            <td>month</td>
                            <td
                                ><input
                                    type="text"
                                    name="month:{anime.animeId}"
                                    bind:value={anime.watchMonth}
                                    oninput={() => markChange(anime.animeId)}
                                    autocomplete="off"
                                /></td
                            >
                        </tr>
                        <tr>
                            <td>day</td>
                            <td
                                ><input
                                    type="text"
                                    name="day:{anime.animeId}"
                                    bind:value={anime.watchDay}
                                    oninput={() => markChange(anime.animeId)}
                                    autocomplete="off"
                                /></td
                            >
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="watch-status">
                <div>
                    <input
                        type="radio"
                        bind:group={anime.status}
                        value={true}
                        oninput={() => markChange(anime.animeId)}
                        autocomplete="off"
                    />
                    <label for="finished">Finished</label>
                </div>
                <div>
                    <input
                        type="radio"
                        bind:group={anime.status}
                        value={false}
                        oninput={() => markChange(anime.animeId)}
                        autocomplete="off"
                    />
                    <label for="dropped">Dropped</label>
                </div>
            </div>

            <div class="button-container">
                <button
                    class="button"
                    onclick={() => updateNotes(anime.animeId, anime.notes)}
                >
                    Edit Notes 
                </button>
                <button
                    class="button"
                    onclick={() => removeAnime(anime.animeId)}
                >
                    Remove
                </button>
            </div>
        </div>
    {/each}
</div>

<style>
    :root {
        --max-listing-height: 8rem;
    }

    #anime-edit-list {
        padding-bottom: 150px;
    }

    .anime-listing {
        display: flex;
        border: 1px solid var(--light-border-color);
        border-bottom: none;
        max-height: var(--max-listing-height);
        box-sizing: border-box;
        position: relative;
    }

    .anime-listing:last-child {
        border-bottom: 1px solid var(--light-border-color);
    }

    :global(.anime-listing-highlight)::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: calc(100% + 10px);
        transform: translateY(-50%) translateX(-5px);
        background-color: green;
        height: 5px;
        border-radius: 2px;
    }

    :global(.anime-listing-highlight-after)::before {
        transform: translateY(50%) translateX(-5px);
        top: unset;
        bottom: 0;
    }

    .anime-listing img {
        object-fit: cover;
        height: var(--max-listing-height);
    }

    .portrait-container {
        max-width: 100px;
        overflow: hidden;
    }

    .anime-title {
        width: 20rem;
        max-height: var(--max-listing-height);
        overflow: hidden;
        text-overflow: ellipsis;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 1rem;
        text-align: center;
    }

    table {
        border-collapse: collapse;
    }

    .review-table {
        margin-right: 2rem;
    }

    td:first-child {
        padding: 0.2rem;
        padding-left: 1rem;
        padding-right: 1rem;
    }

    td,
    .date-section-header {
        border-left: 1px solid var(--dark-border-color);
        border-right: 1px solid var(--dark-border-color);
        min-width: 1.5rem;
    }

    td:last-child {
        text-align: center;
    }

    tr {
        border-bottom: 1px solid var(--dark-border-color);
    }

    tr:last-child {
        border-bottom: none;
    }

    .date-section {
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    .date-section table {
        flex: 1;
        height: 100%;
    }

    .date-section-header {
        text-align: center;
        border-bottom: 1px solid var(--dark-border-color);
    }

    .review-table input {
        width: 3rem;
        text-align: center;
        border: none;
    }

    .date-section td input {
        width: 4rem;
        height: 2rem;
        text-align: center;
        border: none;
    }

    .button-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        justify-content: center;
        padding: 3rem;
        padding-top: 0;
        padding-bottom: 0;
    }

    .button-container button {
        height: 2.1rem;
        padding-left: 0.8rem;
        padding-right: 0.8rem;
        align-self: center;
        width: 10rem;
    }

    .drag-area {
        width: 4rem;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: grab;
        background-color: inherit;
    }

    .drag-area > img {
        height: 2rem;
    }

    .watch-status {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        justify-content: center;
        margin-left: 2rem;
    }

    .watch-status > div {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    #save-changes {
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        width: 20rem;
        height: 5rem;
        background-color: black;
        border: 1px solid var(--light-border-color);
        z-index: 2;
        filter: drop-shadow(0rem 0rem 2rem black);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    #save-changes button {
        display: inline-block;
        font-size: 1.5rem;
        padding-left: 1.5rem;
        padding-right: 1.5rem;
        position: relative;
    }

    #save-changes-loading {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        visibility: hidden;
    }

    #save-changes-loading img {
        height: 1.5rem;
        filter: drop-shadow(0rem 0rem 0.3rem black);
    }

    .save-changes-disabled button {
        opacity: 50%;
        cursor: unset;
    }

    #profile-section-avatar-edit {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.5);
        opacity: 0%;
    }

    #profile-section-avatar-edit:hover {
        opacity: 100%;
    }

    #profile-section-avatar-edit > div {
        background-color: black;
        border: 1px solid white;
        border-radius: 1rem;
        padding: 1rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        width: fit-content;
        height: fit-content;
        font-weight: 800;
    }

    :global(.avatar-file-upload) {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        cursor: pointer;
    }

    #avatar-crop-alert {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
        background: black;
        border: 1px solid var(--light-border-color);
        padding: 2rem;
        z-index: 7;
        visibility: hidden;
    }

    #avatar-crop-alert h1 {
        font-size: 2rem;
        padding-bottom: 0.8rem;
    }

    #avatar-crop-alert > div {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 2rem;
        margin-top: 1.8rem;
    }

    #avatar-crop-alert button {
        padding-left: 1rem;
        padding-right: 1rem;
    }

    #add-anime-section {
        display: flex;
        justify-content: center;
        margin-bottom: 2rem;
    }

    #add-anime-button {
        font-size: 1.5rem;
        padding: 1rem;
        width: 20rem;
    }

</style>