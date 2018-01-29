import { PdfSize } from "../lib/pdf";
import { ImageEntity } from "../lib/image";

type Media = Promise<ImageEntity>[];
interface UserStore {
    size: PdfSize;
    media: Media;
}

export class Store {
    private map: Map<string, UserStore>;
    
    constructor() {
        this.map = new Map();
    }

    private getDefaultStore(): UserStore {
        return {
            size: PdfSize.Auto,
            media: []
        }
    }

    private hasUser(id: string) {
        return this.map.has(id);
    }

    public getUser(id: string): UserStore {
        if (this.hasUser(id)) {
            return this.map.get(id)!;
        }
        const newUser = this.getDefaultStore();
        this.map.set(id, newUser);
        return newUser;
    }

    public deleteUser(id: string) {
        this.map.delete(id);
    }
}