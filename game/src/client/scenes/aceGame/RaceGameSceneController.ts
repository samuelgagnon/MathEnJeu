import { Scene } from "phaser";
import ClientRaceGameController from "../../../gameCore/race/ClientRaceGameController";
import { CST } from "../../CST";

export default class RaceGameSceneController extends Phaser.Scene {
	private raceGame: ClientRaceGameController;
	private lag: number;
	private physTimestep: number;

	constructor() {
		const sceneConfig = {
			key: CST.SCENES.RACE_GAME_SCENE_CONTROLLER,
		};
		super(sceneConfig);
	}

	init(data: any) {
		this.raceGame = data.gameController;
	}

	create() {
		this.startGame();
	}

	update() {}

	public getRaceGame(): ClientRaceGameController {
		return this.raceGame;
	}

	/**
	 *
	 * @param sceneKey The key of the scene you want to close
	 * @param data Data that you want to send to the other scene (may be null)
	 */
	public launch(sceneKey: string, data?: any): void {
		const activeScenes: Scene[] = this.scene.manager.getScenes(true);

		activeScenes.forEach((scene: Scene) => {
			scene.input.enabled = false;
		});

		this.scene.launch(sceneKey, data);
	}

	/**
	 *	This method will close the scene identified with sceneKey.
	 *  If toSceneKey is null, it will enable inputs for every other active scenes.
	 * 	If toSceneKey is not null, it will only activate inputs to the specified key.
	 * @param sceneKey The key of the scene you want to close
	 * @param toSceneKey The key of the scene that will be on top level when the scene is closed
	 */
	public closeScene(sceneKey: string, toSceneKey?: string): void {
		const activeScenes: Scene[] = this.scene.manager.getScenes(true);

		this.scene.stop(sceneKey);

		if (toSceneKey) {
			this.scene.get(toSceneKey).input.enabled = true;
		} else {
			activeScenes.forEach((scene: Scene) => {
				scene.input.enabled = true;
			});
		}
	}

	private startGame(): void {}
}
