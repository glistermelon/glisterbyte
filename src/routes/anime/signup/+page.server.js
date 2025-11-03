// +page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { getUserByName, signUpUser } from '$lib/server/auth.js';

const MAX_LENGTH = 16;
const MIN_PASSWORD_LENGTH = 8;

// shamelessly stolen from https://stackoverflow.com/questions/4434076/best-way-to-alphanumeric-check-in-javascript
function isAlphanumeric(str) {
    var code, i, len;
    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false;
        }
    }
    return true;
};

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
        if (username.length < 4) {
            return error('username must be at least 4 characters long');
        }
        if (username.length > MAX_LENGTH) {
            return error(`username must be ${MAX_LENGTH} characters or shorter`);
        }
        if (!isAlphanumeric(username)) {
            return error('username must be alphanumeric')
        }
        if (await getUserByName(username)) {
            return error('user already exists with that username');
        }

        const password = formData.get('password');
        if (typeof password !== 'string') {
            return error('invalid password');
        }
        if (password.length > MAX_LENGTH) {
            return error(`password must be ${MAX_LENGTH} characters or shorter`);
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
            return error(`password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
        }

        await signUpUser(username, password, cookies);

        redirect(303, `/profile/${username}`);
    }
};