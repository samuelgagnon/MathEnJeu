export interface TimeRequestEvent {
	clientCurrentLocalTime: number;
}

export interface TimeResponseEvent {
	clientCurrentLocalTime: number;
	serverCurrentLocalTime: number;
}
