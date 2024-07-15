export const getPowerMode = (
	power: number,
): {
	powerOpt: number | null;
	powerMode: number | null;
} => {
	switch (power) {
		case -1:
			// aus
			return {
				powerOpt: 0,
				powerMode: -1,
			};
		case 0:
			// an und kühlen
			return {
				powerOpt: 1,
				powerMode: 0,
			};
		case 1:
			// an und heizen
			return {
				powerOpt: 1,
				powerMode: 1,
			};
		case 2:
			// an und auto
			return {
				powerOpt: 1,
				powerMode: 2,
			};
		default:
			// log("ungülter Zustand!");
			return { powerOpt: null, powerMode: null };
	}
};
