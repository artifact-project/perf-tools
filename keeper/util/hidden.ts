export function hidden<T extends object, P extends object>(obj: T, props: P) {
	for (const key in props) {
		Object.defineProperty(obj, key, {
			enumerable: false,
			value: props[key],
		});
	}
}
