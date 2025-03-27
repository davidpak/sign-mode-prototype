import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	const stopIds = url.searchParams.get('stopIds')?.split(',') ?? [];
	const title = url.searchParams.get('title') ?? 'Sign Mode Display';
	const refresh = Number(url.searchParams.get('refresh') ?? 30);

	return {
		stopIds,
		title,
		refresh
	};
};
