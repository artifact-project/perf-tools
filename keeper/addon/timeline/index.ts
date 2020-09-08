import type { Addon } from '../../core/core';
import { performance } from '../../util/global';

export type TimelineAddon = {
	badge: string;
}

export const create = (options: TimelineAddon): Addon => ({
	start(entry, autoMeasurable) {
		autoMeasurable && performance.mark(`${entry.id}-mark`);
	},

	end(entry, autoMeasurable) {
		if (autoMeasurable) {
			const mark = `${entry.id}-mark`;
			const label = options.badge + entry.name;

			performance.measure(label, mark);
			performance.clearMarks(mark);
			performance.clearMeasures(label);
		}
	},
});
