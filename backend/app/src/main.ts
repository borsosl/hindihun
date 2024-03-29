import * as log from 'loglevel';
import {LogLevelDesc} from 'loglevel';
import {startServer} from './main/express';
import {solrRequest} from './main/controller/api-root';

export let isLocal: boolean;

export async function main() {
    log.setLevel(process.env.LOG_LEVEL as LogLevelDesc || 'info');

    if(!process.env.SOLR_URL) {
        log.error('SOLR connection not configured');
        return;
    }

    try {
        startServer();
    } catch(e) {
        log.error(e);
        return;
    }

    isLocal = process.env.SOLR_URL.includes('localhost');
    solrRequest('', '').catch(e => {
        log.error('SOLR connection error');
        log.error(e);
    });
}
