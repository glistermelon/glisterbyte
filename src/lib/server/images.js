import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.resolve('uploads');

async function fileExists(filepath) {
    try {
        await fs.access(filepath);
        return true;
    }
    catch {
        return false;
    }
}

export async function saveImage(buffer, ext) {
    let filename = `${randomUUID()}${ext}`;
    let filepath = path.join(UPLOAD_DIR, filename);
    while (await fileExists(filepath)) {
        filename = `${randomUUID()}${ext}`;
        filepath = path.join(UPLOAD_DIR, filename);
    }
    await fs.writeFile(filepath, buffer);
    return filename;
}

export async function downloadImage(imageUrl) {

    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || '';
    const ext = '.' + (contentType.split('/')[1]?.split(';')[0] || 'jpg');
    const buffer = Buffer.from(await response.arrayBuffer());

    return saveImage(buffer, ext);

}