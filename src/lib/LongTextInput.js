import { writable } from 'svelte/store';
import { showWindowCover } from './windowCover.js';

export const inputLongTextStore = writable(null);

export function inputLongText(title, initValue) {
    showWindowCover(false, true);
    return new Promise(resolve => {
        inputLongTextStore.set({ title, initValue, resolve });
    })
};