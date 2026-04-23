export async function checkImageExists(imageUrl: string) {
	return new Promise<boolean>((resolve) => {
		const image = new Image();

		image.src = imageUrl;
		image.addEventListener('load', () => {
			resolve(true);
		});

		image.addEventListener('error', () => {
			resolve(false);
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
		throw new Error(`Could not fetch feed: ${response.status} ${await response.text()}`);
	}

	return response;
}
