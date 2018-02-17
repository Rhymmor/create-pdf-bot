import { StartScene, StartButtons } from "./StartScene";
import { Scenes } from "../stage";


export class StartAgainScene extends StartScene {
    private static TEXT = `Here we go. To create another pdf just click ${StartButtons.Start} again`;

    constructor() {
        super(Scenes.StartAgain, StartAgainScene.TEXT);
    }
}