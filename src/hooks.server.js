// import { redirect } from '@sveltejs/kit';

// export function handle({ event, resolve }) {
//     // const host = event.request.headers.get('host');

//     // if (host === 'glisterbyte.com') {
//     //     return resolve(event, { transformPageChunk: ({ html }) => html }).then(() => {
//     //         throw redirect(307, 'https://anime.glisterbyte.com');
//     //     });
//     // }

//     // const req = new Request(event.request, {
//     //     headers: new Headers(event.request.headers)
//     // });
//     // req.headers.set('origin', event.url.origin);
//     // event.request = req;
//     // console.log('origin');
//     // console.log(event.url.origin);

// 	return resolve(event);
// }