<script>
    import { page } from '$app/state';
    const statusStr = page.status.toString();
</script>

<svelte:head>
    <title>{page.status} - {page.error.message}</title>
</svelte:head>

<div id="error-code">
    <span class="glisterbyte-logo-text-c1">{statusStr[0]}</span>
    <span class="glisterbyte-logo-text-c2">{statusStr[1]}</span>
    <span class="glisterbyte-logo-text-c3">{statusStr[2]}</span>
</div>
<div id="error-message">
    {page.error.message}
</div>

<style>

    #error-code {
        font-size: 4rem;   
        font-family: 'FluoGums';
        padding: 5rem;
        padding-bottom: 2rem;
        text-align: center;
    }

    #error-message {
        text-align: center;
        font-size: 2rem;
        margin-bottom: 5rem;
    }

</style>