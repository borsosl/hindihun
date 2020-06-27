import * as cli from 'command-line-args';
import {processSourceDir} from './process-source-directory';
import {updateDB} from './update-db';

interface Options {
    solr: string;       // eg. http://localhost:8983/solr/hindihun
    analyze: string;    // file path ending|all|almost
    path: string;
}

const opt: Options = cli([
    { name: 'solr', type: String },
    { name: 'analyze', alias: 'a', type: String },
    { name: 'path', type: String, defaultOption: true }
]);

const words = processSourceDir(opt.path, opt.analyze);
if(!opt.analyze) {
    // noinspection JSIgnoredPromiseFromCall
    updateDB(opt.solr, words);
}
