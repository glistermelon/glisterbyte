<script>

    import "../authForm.css";
    import { onMount } from "svelte";
    import GapDot from "$lib/GapDot.svelte";

    const props = $props();
    const form = props.form;

</script>

<svelte:head>
    <title>Log In</title>
</svelte:head>

<div class="auth-form">
    <h1>Log In</h1>
    <div id="sign-up-access">
        or, <a href="/signup" class="hyperlink">sign up</a>
    </div>
    {#if form?.error}
    <div class="error">
        {form.error}
    </div>
    {/if}
    <form method="POST">
        <label for="username">username</label>
        <input id="username-input" type="text" name="username">
        <label for="password">password</label>
        <input id="password-input" type="password" name="password">
        <button type="submit" class="button">submit</button>
    </form>
</div>