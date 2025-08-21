// +page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { getSessionToken, getUserByName, logInUser, verifyPassword } from '$lib/server/auth.js';

function error(msg) {
    return { error: msg }
}

export const actions = {
    default: async ({ request, cookies }) => {

        const formData = await request.formData();

        const username = formData.get('username');
        if (typeof username !== 'string') {
            return error('invalid username');
        }

        const password = formData.get('password');
        if (typeof password !== 'string') {
            return error('invalid password');
        }

        const user = await getUserByName(username);

        if (!user || !verifyPassword(username, password)) {
            return error('incorrect username or password');
        }

        let token = await getSessionToken(user.id);
        logInUser(token, cookies);

        return redirect(303, `/profile/${username}`);
    }
};