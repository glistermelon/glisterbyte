import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import { animeTable } from './server/db/schema';
import { json } from 'stream/consumers';
import { db } from './server/db';
import { downloadImage } from './server/images';
import { eq } from 'drizzle-orm';

let lastCall = 0;
let waitCounter = 0;
const rateLimitMs = 1000;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitIfNecessary() {

    if (waitCounter > 4) {
        return true;
    }
    else if (waitCounter !== 0) {
        waitCounter++;
        await sleep(waitCounter * rateLimitMs);
        waitCounter--;
    }
    else if (Date.now() - lastCall < rateLimitMs) {
        waitCounter = 1;
        await sleep(rateLimitMs - (Date.now() - lastCall));
        waitCounter--;
    }

    lastCall = Date.now();

}

export async function searchAnime(query) {

    if (await waitIfNecessary()) {
        throw error(429, 'Too Many Requests');
    }

    const searchById = query.split('').every(c => "0123456789".indexOf(c) != -1);

    const res = await fetch(
        searchById
        ? `https://api.myanimelist.net/v2/anime/${query}`
        : `https://api.myanimelist.net/v2/anime?q=${encodeURIComponent(query)}&fields=alternative_titles`,
        {
            method: 'GET',
            headers: {
                'X-MAL-CLIENT-ID': env.MAL_CLIENT_ID
            }
        }
    );

    if (!res.ok) {
        throw error(500, 'Upstream Server Error');
    }

    try {
        let data = await res.json();
        data = searchById ? [{ node: data }] : data.data;

        let rows = [];
        for (let datum of data) {
            datum = datum.node;

            let [row] = await db.select().from(animeTable)
                .where(eq(animeTable.malId, datum.id));
            
            if (!row) {
                [row] = await db.insert(animeTable)
                    .values({
                        title: datum.alternative_titles?.en || datum.title,
                        image: await downloadImage(datum.main_picture.large),
                        malId: datum.id
                    })
                    .onConflictDoNothing({ target: animeTable.malId })
                    .returning({
                        id: animeTable.id,
                        title: animeTable.title,
                        image: animeTable.image
                    });
            }

            rows.push(row);
        }
        return rows;
    }
    catch (e) {
        console.log(e);
        throw error(500, 'Internal Server Error');
    }
    
};

export async function getAnime(id) {

    if (await waitIfNecessary()) {
        throw error(429, 'Too Many Requests');
    }

    const res = await fetch(
        `https://api.myanimelist.net/v2/anime/${id}?fields=alternative_titles`,
        {
            method: 'GET',
            headers: {
                'X-MAL-CLIENT-ID': env.MAL_CLIENT_ID
            }
        }
    )

    if (!res.ok) {
        throw error(500, 'Upstream Server Error');
    }

    try {
        return await res.json();
    }
    catch {
        throw error(500, 'Internal Server Error');
    }
    
};