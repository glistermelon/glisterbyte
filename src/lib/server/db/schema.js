import { pgTable, serial, integer, text } from 'drizzle-orm/pg-core';

export const reviewsTable = pgTable(
	'REVIEWS', {
		id: serial('ID').primaryKey(),
		animeId: integer('ANIME_ID')
			.notNull()
			.references(() => animeTable.id),
		userId: integer('USER_ID')
			.notNull()
			.references(() => userTable.id),
		enjoyment: integer('ENJOYMENT'),
		plot: integer('PLOT'),
		quality: integer('QUALITY'),
		status: integer('STATUS'),
		notes: text('NOTES'),
		watchDay: integer('WATCH_DAY'),
		watchMonth : integer('WATCH_MONTH'),
		watchYear: integer('WATCH_YEAR'),
		afterAnimeId: integer('AFTER_ANIME_ID')
	}
);

export const animeTable = pgTable(
	'ANIME', {
		id: serial('ID').primaryKey(),
		title: text('TITLE'),
		image: text('IMAGE'),
		malId: integer('MAL_ID')
	}
);

export const userTable = pgTable(
	'USERS', {
		id: serial('ID').primaryKey(),
		name: text('NAME'),
		passwordHash: text('PASSWORD_HASH'),
		avatar: text('AVATAR')
	}
);

export const sessionTable = pgTable(
	'SESSIONS', {
		userId: integer('USER_ID').references(userTable.id),
		token: text('TOKEN')
	}
);