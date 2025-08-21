import { writable } from 'svelte/store';
import { showWindowCover } from './windowCover.js';

export const visibleErrorMessage = writable(null);

export function displayError(message) {
    visibleErrorMessage.set(message);
}

export function hideError() {
    visibleErrorMessage.set(null);
}