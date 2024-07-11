export interface CreateObjects {
	id: string;
	name: ioBroker.StringOrTranslated;
	type: ioBroker.CommonType;
	role: string;
	unit?: string;
	def?: any;
	states?: string;
	write?: boolean;
}
