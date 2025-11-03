import fs from 'fs';
import path from 'path';

export async function GET({ params }) {
    const filePath = path.resolve('uploads', params.filename);

    if (!fs.existsSync(filePath)) {
        return new Response('not found', { status: 404 });
    }

    const file = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1);
    const mime = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp'
    }[ext] || 'application/octet-stream';

    return new Response(file, {
        headers: {
            'Content-Type': mime
        }
    });
}