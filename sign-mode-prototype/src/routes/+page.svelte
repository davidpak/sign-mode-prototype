<script lang="ts">
	import { onDestroy } from 'svelte';

	export let data;
	const { stopIds, title, refresh } = data;

	let arrivals: Record<string, any[]> = {};
	let stops: Record<string, string> = {};

	async function fetchArrivals() {
		for (const stopId of stopIds) {
			const res = await fetch(
				`https://api.pugetsound.onebusaway.org/api/where/arrivals-and-departures-for-stop/${stopId}.json?key=TEST`
			);
			const json = await res.json();
			arrivals[stopId] = json.data.entry.arrivalsAndDepartures;

			const stopRef = json.data.references.stops?.[stopId];
			if (stopRef) {
				stops[stopId] = stopRef.name;
			}
		}
	}

	fetchArrivals();
	const interval = setInterval(fetchArrivals, refresh * 1000);
	onDestroy(() => clearInterval(interval));

	function formatTimeUntil(timestamp: number) {
		const now = Date.now();
		const delta = Math.floor((timestamp - now) / 60000); // ms to min
		return delta > 0 ? `${delta} min` : 'Now';
	}

	function groupByRoute(arrivals: any[]) {
		const grouped = new Map();
		for (const a of arrivals) {
			const key = a.routeShortName + '|' + a.tripHeadsign;
			if (!grouped.has(key)) grouped.set(key, []);
			grouped.get(key).push(a);
		}
		return grouped;
	}
</script>

<main class="min-h-screen bg-black text-white font-sans px-4 py-6">
	<h1 class="text-center text-3xl font-bold tracking-wide mb-8">{title}</h1>

	{#each stopIds as stopId}
		<section class="mb-16">
			<div class="bg-white text-black p-4 rounded-lg shadow-lg mb-6">
				<h2 class="text-xl font-semibold text-center">{stops[stopId] ?? `Stop ${stopId}`}</h2>
			</div>

			{#if arrivals[stopId]?.length}
				<div class="space-y-4">
					{#each Array.from(groupByRoute(arrivals[stopId])) as [routeKey, group]}
						<div class="flex items-center justify-between bg-white text-black p-6 rounded-lg shadow-md">
							<!-- Route Number -->
							<div class="text-5xl font-bold text-blue-800 w-20 text-center">
								{group[0].routeShortName}
							</div>

							<!-- Destination -->
							<div class="flex-1 px-4 text-left">
								<div class="text-xl font-semibold">{group[0].tripHeadsign}</div>
							</div>

							<!-- Times -->
							<div class="text-right space-y-1 font-mono">
                                <!-- First (earliest) arrival -->
                                <div class="text-4xl text-blue-800 font-bold">
                                    {formatTimeUntil(group[0].predictedArrivalTime)}
                                </div>
                            
                                <!-- Next 2 arrivals -->
                                {#each group.slice(1, 3) as trip}
                                    <div class="text-xl text-blue-600">
                                        {formatTimeUntil(trip.predictedArrivalTime)}
                                    </div>
                                {/each}
                            </div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-center text-gray-400">Loading...</p>
			{/if}
		</section>
	{/each}
</main>
