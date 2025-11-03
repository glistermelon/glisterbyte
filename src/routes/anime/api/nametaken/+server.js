import { getUserByName } from '$lib/server/auth.js';
import { json } from '@sveltejs/kit';

export async function GET({url}) {
    const name = url.searchParams.get('name');
    const taken = await getUserByName(name) != null;
    return json({ taken });
}