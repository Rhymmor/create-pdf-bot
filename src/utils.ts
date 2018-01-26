import axios from 'axios';

export function downloadBinary(link: string) {
    return new Promise<Buffer>((resolve, reject) => {
        axios
            .get(link, { responseType: 'arraybuffer' })
            .then(res => {
                resolve(new Buffer(res.data, 'binary'));
            })
            .catch(reject);
    });
}

export function deleteItem<T>(arr: T[], item: T) {
    const idx = arr.indexOf(item);
    if (idx !== -1) {
        arr.splice(idx, 1);
    }
}