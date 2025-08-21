import { getUserBySession } from '$lib/server/auth.js';

export async function load({ cookies }) {
    const token = cookies.get('session');
    return { signedInUser: await getUserBySession(token) };
}