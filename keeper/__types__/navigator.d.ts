interface Navigator {
	connection?: NetworkInformation;
	mozConnection?: NetworkInformation;
	webkitConnection?: NetworkInformation;
}

type NetworkInformationConnectionType = (
	| 'bluetooth'
	| 'cellular'
	| 'ethernet'
	| 'mixed'
	| 'none'
	| 'other'
	| 'unknown'
	| 'wifi'
	| 'wimax'
)

type NetworkInformationEffectiveConnectionType = (
	| '5g'
	| '4g'
	| '3g'
	| '2g'
	| 'slow-2g'
	| 'unk'
)

interface NetworkInformation extends EventTarget {
	type: NetworkInformationConnectionType;
	effectiveType: NetworkInformationEffectiveConnectionType;
	downlinkMax: number
	downlink: number;
	rtt: number;
	saveData: boolean;
}
