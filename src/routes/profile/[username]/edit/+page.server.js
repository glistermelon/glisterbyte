import { getUserByCookies, getUserByName } from '$lib/server/auth.js';
import { db } from '$lib/server/db/index.js';
import { animeTable, reviewsTable } from '$lib/server/db/schema.js';
import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load({ params, parent }) {

    const user = await getUserByName(params.username);
    if (!user) {
        throw error(404, "Not Found");
    }
    const { signedInUser } = await parent();
    if (!signedInUser) {
        throw error(401, "Unauthorized");
    }
    if (signedInUser?.id != user.id) {
        throw error(403, "Forbidden");
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

        data.reviewId = review.id;

        animeList.push(data);

    }

    //animeList.sort((a, b) => a.title.localeCompare(b.title));
    animeList.sort((a, b) => b.score - a.score);

    return { user, animeList };

}

export const actions = {
    default: async ({ request, cookies, params }) => {

        const user = await getUserByCookies(cookies);
        if (!user) return error(401, 'Unauthorized');
        if (user.name != params.username) return error(403, 'Forbidden');

        const data = await request.formData();

        let updateData;
        let removeData;
        try {
            updateData = JSON.parse(data.get('updateData'));
            removeData = JSON.parse(data.get('removeData'));
        }
        catch {
            return error(400, "Invalid JSON");
        }

        let sanitizedUpdates = [];
        let sanitizedInserts = [];
        for (const update of updateData) {

            if (!update.notes) update.notes = null;

            if (typeof(update.enjoyment) !== 'number' || update.enjoyment < 0 || update.enjoyment > 10) {
                return error(400, "Invalid enjoyment update request");
            }
            if (typeof(update.plot) !== 'number' || update.plot < 0 || update.plot > 10) {
                return error(400, "Invalid update update request");
            }
            if (typeof(update.quality) !== 'number' || update.quality < 0 || update.quality > 10) {
                return error(400, "Invalid quality update request");
            }
            if (typeof(update.status) !== 'number' || (update.status !== 0 && update.status !== 1)) {
                return error(400, "Invalid status update request");
            }
            if (update.notes !== null && (typeof(update.notes) !== 'string' || update.notes.length > 5000)) {
                return error(400, "Invalid notes update request");
            }
            if (update.watchYear !== null && typeof(update.watchYear) !== 'number') {
                return error(400, "Invalid watch year update request");
            }
            if (update.watchMonth !== null && (typeof(update.watchMonth) !== 'number' || update.watchYear === null)) {
                return error(400, "Invalid watch month update request");
            }
            if (update.watchDay !== null && (typeof(update.watchDay) !== 'number' || update.watchYear === null || update.watchMonth === null)) {
                return error(400, "Invalid watch day update request");
            }
            if (update.afterAnimeId !== null && typeof(update.afterAnimeId) !== 'number') {
                return error(400, "Invalid order update request");
            }
            if (update.reviewId !== null && typeof(update.reviewId) !== 'number') {
                return error(400, "Invalid review ID in update request");
            }
            let data = {
                enjoyment: update.enjoyment,
                plot: update.plot,
                quality: update.quality,
                status: update.status ? 0 : 1,
                notes: update.notes,
                watchDay: update.watchDay,
                watchMonth: update.watchMonth,
                watchYear: update.watchYear,
                afterAnimeId: update.afterAnimeId,
                reviewId: update.reviewId
            };
            if (update.reviewId !== null) {
                sanitizedUpdates.push(data);
            }
            else {
                data.animeId = update.animeId;
                data.userId = user.id;
                sanitizedInserts.push(data);
            }
        }
        
        let sanitizedRemovals = [];
        for (const removal of removeData) {
            if (typeof(removal) !== 'number') {
                return error(400, "Invalid removal request");
            }
            sanitizedRemovals.push(removal);
        }

        try {
            await db.transaction(
                async (ctx) => {
                    for (const insert of sanitizedInserts) {
                        await ctx
                            .insert(reviewsTable)
                            .values(insert);
                    }
                    for (const update of sanitizedUpdates) {
                        await ctx
                            .update(reviewsTable)
                            .set(update)
                            .where(eq(reviewsTable.id, update.reviewId));
                    }
                    for (const removal of sanitizedRemovals) {
                        await ctx
                            .delete(reviewsTable)
                            .where(eq(reviewsTable.animeId, removal));
                    }
                }
            )
        }
        catch (e) {
            console.log(e);
            return error(400, "Database update failed");
        }

        return { type: 'success' }

    }
}