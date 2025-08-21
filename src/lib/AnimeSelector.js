import { writable } from 'svelte/store';
import { showWindowCover } from './windowCover.js';

export const animeSelectorResolver = writable(null);

export function animeSearch() {
    showWindowCover(false, true);
    return new Promise(resolve => {
        animeSelectorResolver.set(resolve);
    })
};