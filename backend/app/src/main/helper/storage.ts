import {Storage} from '@google-cloud/storage';

const projectId = 'hindihun';
const bucketName = 'hindihun.appspot.com';
const keyFilename = './secret/hindihun-ccbae5968ac2.json';

function storage() {
    return new Storage({
        keyFilename,
        projectId
    });
}

export function storeFile(fname: string, content: string) {
    const gcs = storage();
    const gaeBucket = gcs.bucket(bucketName);
    return new Promise((res, err) => {
        gaeBucket.file(fname).createWriteStream({
            resumable: false,
            contentType: 'application/json'
        }).
        on('finish', res).
        on('error', err).
        end(content);
    });
}

export function getFile(fname: string): Promise<string> {
    const gcs = storage();
    const gaeBucket = gcs.bucket(bucketName);
    return new Promise((res, err) => {
        let buffer: Buffer;
        gaeBucket.file(fname).createReadStream().
        on('data', chunk => {
            buffer = buffer ? Buffer.concat([buffer, chunk]) : chunk;
        }).
        on('end', () => res(buffer.toString())).
        on('error', err);
    });
}
