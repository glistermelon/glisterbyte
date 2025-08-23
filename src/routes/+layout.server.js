import { getUserBySession } from '$lib/server/auth.js';

export async function load({ cookies }) {
    const token = cookies.get('session');
    const theme = cookies.get('theme') || false;
    return { signedInUser: await getUserBySession(token), theme };
}