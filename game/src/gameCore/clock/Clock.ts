import { TimeRequestEvent, TimeResponseEvent } from "../../communication/clock/EventInterfaces";
import { CLIENT_EVENT_NAMES as CE, SERVER_EVENT_NAMES as SE } from "../../communication/clock/EventNames";
import { arithmeticMean, median, standardDeviation } from "../../utils/Utils";

//When the client clock is not synchronised with server clock, many glitches can occur. Clock.now() returns the current server time.
//Client Clock.now() should replaces Date.now() so the time used is the same as the server time.
//When client clock is synchronized with server, Clock.now from client should return a result very close to Clock.now from server.
//A server using Clock should only use the function now().
export class Clock {
	private static socket: SocketIOClient.Socket;
	private static clockDelta: number = 0;
	private static synchClockDeltas: number[] = [];
	private static readonly TOTAL_SYNCH_STEP = 6;
	private static readonly TIME_BETWEEN_SYNCH_STEP = 2000;
	private static isSynchronised: boolean = false;
	private static isSynchronizing: boolean = false;
	private static stopSynchronization: boolean = false;
	private static latency: number = 0;

	private constructor() {}

	public static getIsSynchronizedWithServer(): boolean {
		return Clock.isSynchronised;
	}

	public static getLatency(): number {
		return Clock.latency;
	}

	public static getDelta(): number {
		return Clock.clockDelta;
	}

	public static getIsSynchronizingWithServer(): boolean {
		return Clock.isSynchronizing;
	}

	public static startSynchronizationWithServer(clientSocket: SocketIOClient.Socket): void {
		if (!Clock.isSynchronizing) {
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
		Clock.socket.on(CE.TIME_RESPONSE, Clock.computeClockDeltaFromTimeResponse);
		Clock.socket.on("disconnect", () => {
			Clock.stopSynchronization = true;
			Clock.isSynchronised = false;
			Clock.isSynchronizing = false;
		});
	}

	//Each time we get a time response from server, we compute a clockdelta.
	//This specific clockdelta is used to compute the clockDelta used in Clock.now().
	private static computeClockDeltaFromTimeResponse(timeResponse: TimeResponseEvent): void {
		const currentTime = Date.now();
		Clock.latency = (currentTime - timeResponse.clientCurrentLocalTime) / 2;
		const clientServerTimeDelta = timeResponse.serverCurrentLocalTime - timeResponse.clientCurrentLocalTime;
		const clockDelta = clientServerTimeDelta + Clock.latency;
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

	//From all the clockDeltas previously calculated, we only keep those being at a max. distance of one standard-deviation from median.
	//Then, we use the arithmetic mean of all those clockDeltas as the offical ClockDelta.
	private static computeUsedClockDelta(): void {
		const clockDeltasStandardDeviation = standardDeviation(Clock.synchClockDeltas);
		const clockDeltasMedian = median(Clock.synchClockDeltas);

		const clockDeltasWithoutOutliers = Clock.synchClockDeltas.filter(
			(clockDelta) => Math.abs(clockDelta - clockDeltasMedian) <= clockDeltasStandardDeviation
		);

		Clock.clockDelta = arithmeticMean(clockDeltasWithoutOutliers);
	}

	public static now(): number {
		return Date.now() + Clock.clockDelta;
	}
}
