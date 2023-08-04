export interface NavigatorExtended extends Omit<Navigator, 'connection'> {
	deviceMemory?: number;
	connection?: NetworkInformationExtended;
	mozConnection?: NetworkInformationExtended;
	webkitConnection?: NetworkInformationExtended;
}

export type NetworkInformationEffectiveConnectionType = (
	| '5g'
	| '4g'
	| '3g'
	| '2g'
	| 'slow-2g'
	| 'unk'
)

export type NetworkInformationConnectionType =
	| 'bluetooth'
	| 'cellular'
	| 'ethernet'
	| 'mixed'
	| 'none'
	| 'other'
	| 'unknown'
	| 'wifi'

export interface NetworkInformationExtended extends EventTarget {
	type: NetworkInformationConnectionType;
	effectiveType: NetworkInformationEffectiveConnectionType;
	downlinkMax: number
	downlink: number;
	rtt: number;
	saveData: boolean;
}
