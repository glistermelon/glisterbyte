<script>

    let { upload, content, children, _class, endpoint, prehandle } = $props();
    if (!content) content = '';

    let fileInput;

    async function handleFileChange(e) {

        const target = e.target;
        if (!target.files || target.files.length === 0) return;

        const file = target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(endpoint, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) return;

        const { url } = await res.json();
        upload(url);

    }

    async function openFileDialog() {
        if (await prehandle()) {
            fileInput.click();
        }
    }

</script>

<button onclick={openFileDialog} class={_class}>
    {#if children}
        {@render children()}
    {/if}
</button>

<input
    type="file"
    accept="image/*"
    bind:this={fileInput}
    onchange={handleFileChange}
    style="display: none;"
/>
