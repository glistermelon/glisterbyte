// src/hooks.server.js
import { redirect } from '@sveltejs/kit';

export function handle({ event, resolve }) {
    const host = event.request.headers.get('host');

    if (host === 'glisterbyte.com') {
        return resolve(event, { transformPageChunk: ({ html }) => html }).then(() => {
            throw redirect(307, 'https://anime.glisterbyte.com');
        });
    }

    return resolve(event);
}
