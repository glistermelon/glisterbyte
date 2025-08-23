import { getUserBySession } from '$lib/server/auth.js';

export async function load({ cookies }) {
    const token = cookies.get('session');
    const theme = cookies.get('theme') || 'dark';
    return { signedInUser: await getUserBySession(token), theme };
}