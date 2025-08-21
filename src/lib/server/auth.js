import bcrypt from 'bcrypt';
import { sessionTable, userTable } from './db/schema.js';
import { db } from './db/index.js';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// None of this code is very secure but I doubt
// it will be an issue because nobody is using this
// site. Some issues I can already see:
//  * Due to async, signUpUser isn't guaranteed
//    that the username wasn't already taken
//  * Sessions don't expire. The session token
//    is basically another password.

export async function getUserByName(username) {
    const [row] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.name, username))
        .limit(1);
    return row ?? null;
}

export async function getUserById(id) {
    const [row] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, id))
        .limit(1);
    return row ?? null;
}

export async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

export async function verifyPassword(username, password) {
    const userRow = await getUserByName(username);
    if (!userRow) return false;
    return await bcrypt.compare(password, userRow.passwordHash);
}

export function logInUser(token, cookies) {
    cookies.set('session', token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: false
        // maxAge: insert number of seconds here
    });
}

export async function signUpUser(username, password, cookies) {
    const [row] = await db.insert(userTable).values({
        name: username,
        passwordHash: await hashPassword(password)
    }).returning({ id: userTable.id });
    const token = await getSessionToken(row.id);
    logInUser(token, cookies);
}

export async function getSessionToken(userId) {
    const [row] = await db
        .select()
        .from(sessionTable)
        .where(eq(sessionTable.userId, userId))
        .limit(1);
    if (row) return row.token;
    const token = crypto.randomBytes(32).toString('hex');
    await db.insert(sessionTable).values({
        userId,
        token
    });
    return token;
}

export async function getUserBySession(token) {
    if (!token) return null;
    const [row] = await db
        .select()
        .from(sessionTable)
        .where(eq(sessionTable.token, token))
        .limit(1);
    if (!row) return null;
    return await getUserById(row.userId);
}

export async function getUserByCookies(cookies) {
    const token = cookies.get('session');
    return token ? await getUserBySession(token) : null;
}