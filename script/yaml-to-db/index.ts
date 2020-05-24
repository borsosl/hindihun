import * as cli from 'command-line-args';
import {processSourceDir} from './process-source-directory';
import {updateDB} from './update-db';

interface Options {
    solr: string;     // eg. http://localhost:8983/solr/hindihun
    path: string,
}

const opt: Options = cli([
    { name: 'solr', type: String },
    { name: 'path', type: String, defaultOption: true }
]);

const words = processSourceDir(opt.path);
// noinspection JSIgnoredPromiseFromCall
updateDB(opt.solr, words);
