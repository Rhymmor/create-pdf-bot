import axios from 'axios';
import { createWriteStream } from 'fs';

export type UseString<S extends string, T> = {
    [key in S]: T;
};

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

export function maxBy<T, K>(arr: T[], func: (x: T) => K): T | undefined {
    if (!arr.length) { return; }

    let max_index = 0;
    let max: K = func(arr[max_index]);
    for (let i = 1; i < arr.length; i++) {
        const curr = func(arr[i]);
        if (curr > max) {
            max_index = i;
            max = curr;
        }
    }
    return arr[max_index];
}