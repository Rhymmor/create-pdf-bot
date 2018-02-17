import { CommonScene } from "./commonScene";
import { Scenes } from "../stage";
import { PdfCreator, PdfSize } from "../../lib/pdf";
import { TmpDirsWatcher } from "../../lib/tmpDirs";
import { Store } from "../store";

export class CreatePdfScene extends CommonScene<string> {
    private static PDF_NAME = 'images.pdf';
    private pdfCreator: PdfCreator;
    private dirsWatcher: TmpDirsWatcher;
    private store: Store;

    constructor(dirsWatcher: TmpDirsWatcher, store: Store) {
        super(Scenes.CreatePdf);
        this.dirsWatcher = dirsWatcher;
        this.store = store;
        this.pdfCreator = new PdfCreator(CreatePdfScene.PDF_NAME);
    }

    protected async onEnter(ctx: any) {
        const id = this.getUserId(ctx);
        const media = this.getMedia(id);
        const images = await Promise.all(media);
        const pdf = await this.pdfCreator.create(PdfSize.A4, this.dirsWatcher.getIdTmpDir(id), images);
        ctx.replyWithDocument({source: pdf, filename: CreatePdfScene.PDF_NAME});
        this.clean(id);
        return ctx.scene.enter(Scenes.StartAgain);
    }

    private getMedia(id: string) {
        return this.store.getUser(id).media;
    }

    private clean(id: string) {
        this.store.deleteUser(id);
        this.dirsWatcher.clean(id);
    }

    protected onClick(): any {}
}