import { searchAnime } from '$lib/MyAnimeList';
import { error, json } from '@sveltejs/kit';

let lastCall = 0;
let waitCounter = 0;
const rateLimitMs = 1000;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function GET({ url }) {
    
    const query = url.searchParams.get('query');

    if (!query || query.length > 40) {
        return error(400, 'Bad Request');
    }

    return json(await searchAnime(query));

};