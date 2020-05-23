import * as cli from 'command-line-args';
import {processSourceDir} from './process-source-directory';
import {updateDB} from './update-db';

interface Options {
    db: string;     // eg. postgres:mypwd@localhost:5432/hindihun
    path: string,
}

const opt: Options = cli([
    { name: 'db', type: String },
    { name: 'path', type: String, defaultOption: true }
]);

const words = processSourceDir(opt.path);
// noinspection JSIgnoredPromiseFromCall
updateDB(opt.db, words);
