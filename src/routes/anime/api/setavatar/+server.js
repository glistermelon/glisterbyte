import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { error, json } from '@sveltejs/kit';
import { getUserByCookies } from '$lib/server/auth.js';
import { db } from '$lib/server/db/index.js';
import { userTable } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { saveImage } from '$lib/server/images';

export async function POST({ request, cookies }) {

    const user = await getUserByCookies(cookies);
    if (!user) return error(401, 'Unauthorized');

    const data = await request.formData();
    const file = data.get('file');

    if (!(file instanceof File)) {
        return error(400, 'Bad Upload');
    }

    const filename = await saveImage(Buffer.from(await file.arrayBuffer()), path.extname(file.name));

    const url = `/uploads/${filename}`;

    await db.update(userTable)
        .set({ avatar: url })
        .where(eq(userTable.id, user.id));

    return json({ url });
};