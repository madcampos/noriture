interface ImageSize {
	width: number;
	height: number;
}

export async function getImageSizes(imageUrl: string) {
	return new Promise<ImageSize | undefined>((resolve) => {
		const image = new Image();

		image.src = imageUrl;
		image.addEventListener('load', () => {
			resolve({
				width: image.naturalWidth ? image.naturalWidth : -Infinity,
				height: image.naturalHeight ? image.naturalHeight : -Infinity
			});
		});

		image.addEventListener('error', () => {
			resolve(undefined);
		});
	});
}

export async function fetchProxied(url: string) {
	const response = await fetch(`/proxy?url=${encodeURIComponent(url)}`, {
		method: 'GET',
		credentials: 'omit',
		redirect: 'follow'
	});

	if (!response.ok) {
		throw new Error(`Could not fetch: ${response.status} ${await response.text()}`);
	}

	return response;
}
