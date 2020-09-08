export const STRING_TYPE = 'string';
export const BOOLEAN_TYPE = 'boolean';
export const OBJECT_TYPE = 'object';

export function isType(v: unknown, t: string): v is string {
	return typeof v === t;
}
