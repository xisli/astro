import { extname } from 'path';
import sharp from './sharp.js';
import type { APIRoute } from 'astro';

const MimeTypes: Record<string, string> = {
	'avif': 'image/avif',
	'jpeg': 'image/jpeg',
	'png': 'image/png',
	'webp': 'image/webp'
};

export const get: APIRoute = async ({ request }) => {
	try {
		const url = new URL(request.url);
		const imageService = sharp;

		const props = imageService.parseImageSrc(request.url);

		if (!props) {
			console.log('Bad Request', request.url);
			return new Response('Bad Request', { status: 400 });
		}

		const href = !props.src.startsWith('http') ? new URL(props.src, url.origin) : new URL(props.src);

		const inputRes = await fetch(href.toString());

		if (!inputRes.ok) {
			return new Response(`"${props.src} not found`, { status: 404 });
		}

		const inputBuffer = Buffer.from(await inputRes.arrayBuffer());

		const { data, format } = await imageService.toBuffer(inputBuffer, props);

		return new Response(data, {
			status: 200,
			headers: {
				'content-type': MimeTypes[format],
			}
		});
	} catch (err: unknown) {
		return new Response(`Server Error: ${err}`, { status: 500 });
	}
}
