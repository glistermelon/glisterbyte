import { getUserByName as getUserByName } from '$lib/server/auth.js';
import { db } from '$lib/server/db/index.js';
import { animeTable, reviewsTable } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load({ params }) {

    const user = await getUserByName(params.username);
    if (!user) {
        throw error(404, "Not Found");
    }

    const rows = await db
        .select()
        .from(reviewsTable)
        .where(eq(reviewsTable.userId, user.id))
        .innerJoin(animeTable, eq(reviewsTable.animeId, animeTable.id));
    let animeList = [];

    for (const row of rows) {

        let anime = row.ANIME;
        let review = row.REVIEWS;
        let data = {};

        data.enjoyment = review.enjoyment;
        data.plot = review.plot;
        data.quality = review.quality;
        data.notes = review.notes;
        
        data.watchYear = review.watchYear;
        data.watchMonth = review.watchMonth;
        data.watchDay = review.watchDay;

        data.watchStr = null;
        if (data.watchYear !== null) {
            if (data.watchMonth !== null) {
                if (data.watchDay !== null) {
                    data.watchStr = data.watchMonth + '/' + data.watchDay + '/' + data.watchYear;
                }
                else {
                    data.watchStr = data.watchMonth + '/' + data.watchYear;
                }
            }
            else {
                data.watchStr = data.watchYear;
            }
        }
        
        data.title = anime.title;
        data.image = anime.image;
        
        data.animeId = anime.id;

        data.score = ((review.enjoyment + review.plot + review.quality) / 3).toFixed(1);

        if (review.status == 1) {
            data.statusString = "Finished";
            data.statusColor = "var(--color-success-300)";
            data.status = true;
        }
        else {
            data.statusString = anime.status === -1
                ? "Dropped"
                : `Dropped during season ${anime.status}`;
            data.statusColor = "var(--color-error-300)";
            data.status = false;
        }

        data.afterAnimeId = review.afterAnimeId;

        animeList.push(data);

    }

    //animeList.sort((a, b) => a.title.localeCompare(b.title));
    animeList.sort((a, b) => b.score - a.score);

    return { user, animeList };

}