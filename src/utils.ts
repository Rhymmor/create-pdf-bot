import axios from 'axios';
import { createWriteStream } from 'fs';


export function downloadToFile(link: string, path: string) {
    return new Promise<string>((resolve, reject) => {
        axios
            .get(link, { responseType: 'stream' })
            .then(res => {
                res.data.on('end', () => {
                    resolve(path);
                })
                res.data.pipe(createWriteStream(path));
                // resolve(new Buffer(res.data, 'binary'));
            })
            .catch(reject);
    });
}

export function deleteItem<T>(arr: T[], item: T): T[] {
    const idx = arr.indexOf(item);
    if (idx !== -1) {
        return arr.slice(0, idx).concat(arr.slice(idx + 1));
    }
    return arr;
}