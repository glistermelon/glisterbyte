function getWindowCover() {
    return document.getElementById("window-cover");
}

export function showWindowCover(grabbing, dim) {
    const elm = getWindowCover();
    elm.style.display = '';
    if (grabbing) elm.style.cursor = 'grabbing';
    if (dim) {
        elm.style.background = 'black';
        elm.style.opacity = '50%';
    }
}

export function hideWindowCover() {
    const elm = getWindowCover();
    elm.style.display = 'none';
    elm.style.cursor = '';
    elm.style.background = '';
    elm.style.opacity = '';
}