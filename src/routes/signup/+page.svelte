<script>

    import "../authForm.css";
    import { onMount } from "svelte";
    import GapDot from "$lib/GapDot.svelte";

    const props = $props();
    const form = props.form;

    let usernameInput;
    let passwordInput;
    let takenIndicator;

    let username = $state('');
    $effect(async () => {
        if (username.length == 0) return;
        const taken = (await (await fetch(`/api/nametaken?name=${username}`)).json())['taken'];
        if (taken) {
            usernameInput.style.borderColor = 'var(--error-red)';
            takenIndicator.style.display = 'inline';
        }
        else {
            usernameInput.style.borderColor = '';
            takenIndicator.style.display = '';
        }
    })

    onMount(() => {
        usernameInput = document.getElementById("username-input");
        passwordInput = document.getElementById("password-input");
        takenIndicator = document.getElementById("taken");
    })

</script>

<svelte:head>
    <title>Sign Up</title>
</svelte:head>

<div class="auth-form">
    <h1>Sign Up</h1>
    {#if form?.error}
    <div class="error">
        {form.error}
    </div>
    {/if}
    <form method="POST">
        <label for="username">username<span id="taken"><GapDot/>taken</span></label>
        <input id="username-input" type="text" name="username" bind:value={username}>
        <label for="password">password</label>
        <input id="password-input" type="password" name="password">
        <button type="submit" class="button">submit</button>
    </form>
</div>