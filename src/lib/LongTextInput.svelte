<script>
    const { title, initValue, submit } = $props();
    
    let value = $state(null);

    function onSubmit() {
        submit(value);
    }
</script>

<div class="long-text-input">
    <h1>{title}</h1>
    <textarea bind:value={value}>{initValue}</textarea>
    <div>
        <button class="button" onclick={onSubmit}>Submit</button>
    </div>
</div>

<style>

    .long-text-input {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
        padding: 2rem;
        width: fit-content;
        height: fit-content;
        z-index: 5;
        background-color: var(--bg-color-0);
        border: 1px solid var(--light-border-color)
    }

    .long-text-input h1 {
        font-size: 2rem;
        margin-bottom: 1rem;
    }

    .long-text-input textarea {
        width: 50rem;
        height: 20rem;
        max-width: calc(100vw - 10rem);
        min-width: 10rem;
        background-color: var(--textarea-bg-color);
        border: 1px solid var(--dark-border-color);
        resize: none;
    }

    .long-text-input div {
        display: flex;
        justify-content: center;
    }

    .long-text-input button {
        font-size: 1.5rem;
        padding: 0.5rem;
        padding-left: 1.5rem;
        padding-right: 1.5rem;
        margin-top: 1.5rem;
    }

</style>