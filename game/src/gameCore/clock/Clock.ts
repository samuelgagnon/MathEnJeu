import { TimeRequestEvent, TimeResponseEvent } from "../../communication/clock/DataInterfaces";
import { CLIENT_EVENT_NAMES as CE, SERVER_EVENT_NAMES as SE } from "../../communication/clock/EventNames";
import { arithmeticMean, median, standardDeviation } from "../../utils/Utils";

export class Clock {
	private static instance: Clock;
	private static socket: SocketIOClient.Socket;
	private static clockDelta: number = 0;
	private static synchClockDeltas: number[] = [];
	private static readonly TOTAL_SYNCH_STEP = 6;
	private static readonly TIME_BETWEEN_SYNCH_STEP = 2000;
	private static isSynchronised: boolean = false;
	private static isSynchronizing: boolean = false;
	private static stopSynchronization: boolean = false;

	private constructor() {}

	public static getIsSynchronizedWithServer(): boolean {
		return Clock.isSynchronised;
	}

	public static getIsSynchronizingWithServer(): boolean {
		return Clock.isSynchronizing;
	}

	public static startSynchronizationWithServer(clientSocket: SocketIOClient.Socket): void {
		if (!Clock.getIsSynchronizingWithServer()) {
			Clock.isSynchronised = false;
			Clock.isSynchronizing = true;
			Clock.socket = clientSocket;
			Clock.handleSocketEvents();
			Clock.synchClockDeltas = [];
			Clock.sendTimeRequest();
		}
	}

	private static sendTimeRequest(): void {
		if (!Clock.stopSynchronization) {
			Clock.socket.emit(SE.TIME_REQUEST, <TimeRequestEvent>{
				clientCurrentLocalTime: Date.now(),
			});
		} else {
			Clock.stopSynchronization = false;
		}
	}

	private static handleSocketEvents(): void {
		Clock.socket.on(CE.TIME_RESPONSE, Clock.computeSynchClockDelta);
	}

	private static computeSynchClockDelta(timeResponse: TimeResponseEvent): void {
		const currentTime = Date.now();
		const latency = (currentTime - timeResponse.clientCurrentLocalTime) / 2;
		const clientServerTimeDelta = timeResponse.serverCurrentLocalTime - timeResponse.clientCurrentLocalTime;
		const clockDelta = clientServerTimeDelta + latency;
		Clock.synchClockDeltas.push(clockDelta);
		Clock.computeUsedClockDelta();
		while (Clock.synchClockDeltas.length >= Clock.TOTAL_SYNCH_STEP) {
			Clock.isSynchronised = true;
			Clock.synchClockDeltas.shift();
		}
		setTimeout(function () {
			Clock.sendTimeRequest();
		}, Clock.TIME_BETWEEN_SYNCH_STEP);
	}

	private static computeUsedClockDelta(): void {
		const clockDeltasStandardDeviation = standardDeviation(Clock.synchClockDeltas);
		const clockDeltasMedian = median(Clock.synchClockDeltas);

		const clockDeltasWithoutOutliers = Clock.synchClockDeltas.filter(
			(clockDelta) => Math.abs(clockDelta - clockDeltasMedian) <= clockDeltasStandardDeviation
		);

		Clock.clockDelta = arithmeticMean(clockDeltasWithoutOutliers);
		console.log(`Current Clock Delta : ${Clock.clockDelta}`);
	}

	public static now(): number {
		return Date.now() + Clock.clockDelta;
	}
}
