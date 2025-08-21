<script>
	import '../app.css';

	import GlisterbyteHeader from "$lib/GlisterbyteHeader.svelte";
    import { inputLongTextStore } from '$lib/LongTextInput';
    import LongTextInput from '$lib/LongTextInput.svelte';
	import { hideWindowCover } from '$lib/windowCover.js';
    import { animeSelectorResolver } from '$lib/AnimeSelector';
    import AnimeSelector from '$lib/AnimeSelector.svelte';
	import { hideError, visibleErrorMessage } from '$lib/displayError';
	
	let { children, data } = $props();

	let files = $state();

	let longTextInputValue;
</script>

<svelte:head>
	<title>Glisterbyte</title>
</svelte:head>


<div id="main-content-container">

    <GlisterbyteHeader user={data.signedInUser}/>

	{@render children()}

</div>

<div id="window-cover" style="display: none;"></div>

{#if $inputLongTextStore}
	<LongTextInput
		title={$inputLongTextStore.title}
		initValue={$inputLongTextStore.initValue}
		submit={(value) => {
			hideWindowCover();
			$inputLongTextStore.resolve(value);
			inputLongTextStore.set(null);
		}}
	/>
{/if}

{#if $animeSelectorResolver}
	<AnimeSelector
		submit={(value) => {
			hideWindowCover();
			$animeSelectorResolver(value);
			animeSelectorResolver.set(null);
		}}
	/>
{/if}

{#if $visibleErrorMessage}
	<div id="error-alert">
		<div id="error-alert-message">{$visibleErrorMessage}</div>
		<button id="error-alert-close" onclick={hideError}>×</button>
	</div>
{/if}

<style>

    #error-alert {
        position: fixed;
        top: 6rem;
        left: 50%;
        transform: translateX(-50%);
        background-color: #8d0000;
        font-size: 2rem;
        padding: 0.5rem;
        padding-left: 2rem;
        padding-right: 2rem;
        border-radius: 10px;
        border: 1px solid #ff5454;
        display: flex;
		z-index: 9999;
    }

    #error-alert-close {
        margin-left: 1rem;
        color: #ffa3a3;
        cursor: pointer;
    }

</style>