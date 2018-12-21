import { TimeKeeper } from '../../src/timekeeper/timekeeper';

export function paintTimings(kepper: TimeKeeper) {
	window.addEventListener('DOMContentLoaded', function check() {
		try {
			const entries = performance.getEntriesByType('paint');

			if (entries.length > 1) {
				kepper.group('tk-paint');

				entries.forEach(entry => {
					kepper.add(entry.name, entry.startTime, entry.startTime + entry.duration);
				});

				kepper.groupEnd();
			} else {
				setTimeout(check, 250);
			}
		} catch (_) {}
	});
}