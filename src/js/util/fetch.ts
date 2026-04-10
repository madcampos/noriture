export async function get(url: string) {
	const response = await fetch(`/proxy?url=${encodeURIComponent(url)}`, {
		method: 'GET',
		credentials: 'omit',
		redirect: 'follow'
	});

	return response;
}
