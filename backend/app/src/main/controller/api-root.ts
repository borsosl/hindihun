import {Request, Response, Router} from 'express';
import {InternalResult, internalResult, restResult} from '../helper/error';
import * as url from 'url';
import axios from 'axios';
import {SolrResponse, SolrResult} from '../model/solr';
import {isLocal} from '../../main';
import {getDailyPass} from '../service/password.service';

let currentDay: string;
let currentPass: string;

export function apiRoutes(router: Router) {
    router.get('/title', title);
    router.get('/hindi', hindi);
    router.get('/trans', trans);
    router.get('/hun', hun);
    router.get('/lex', lex);

    currentDay = new Date().toISOString().substr(0, 10);
    getDailyPass().then(pass => {
        currentPass = pass;
    });
}

async function title(req: Request, res: Response) {
    await forwardToSolr(req, res, 'title');
}

async function hindi(req: Request, res: Response) {
    await forwardToSolr(req, res, 'hindi');
}

async function trans(req: Request, res: Response) {
    await forwardToSolr(req, res, 'trans');
}

async function hun(req: Request, res: Response) {
    await forwardToSolr(req, res, 'hun');
}

async function lex(req: Request, res: Response) {
    await forwardToSolr(req, res, 'lex');
}

async function forwardToSolr(req: Request, resp: Response, df: string) {
    let q = url.parse(req.url).query;
    const pass = req.query.pass as string;
    if(pass !== undefined) {
        q = q.replace(/&?pass=[^&]+/, '');
    }
    await restResult(resp, async () => await solrRequest(q, df, pass));
}

export async function solrRequest(params: string, df: string, pass?: string): Promise<InternalResult<SolrResponse>> {
    let indexName = 'hindihun';
    if(pass !== undefined) {
        const day = new Date().toISOString().substr(0, 10);
        if(day !== currentDay) {
            currentDay = day;
            currentPass = await getDailyPass();
        }
        if(!isLocal && pass !== currentPass)
            throw [401, 'Helytelen jelszó'];
        indexName = 'hindieng';
    }
    const int = internalResult(await axios.get<SolrResult>(
        `${process.env.SOLR_URL}/solr/${indexName}/query?df=${df}&fl=doc&omitHeader=true&rows=100&${params}`,
        {
            responseType: 'json'
        }
    ));
    return {
        status: int.status,
        result: int.result ? int.result.response : null
    };
}
