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