import {Request, Response, Router} from 'express';
import {restResult, InternalResult, internalResult} from '../helper/error';
import * as url from 'url';
import axios from 'axios';
import {SolrResponse, SolrResult} from '../model/solr';
import {isLocal} from '../../main';

let currentPass: string;

export function apiRoutes(router: Router) {
    router.get('/title', title);
    router.get('/hindi', hindi);
    router.get('/trans', trans);
    router.get('/hun', hun);
    router.get('/lex', lex);
    router.get('/genpass', genpass);
    genpass();
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

async function genpass() {
    currentPass = '';
    for(let i = 0; i < 8; i++) {
        let r = Math.floor(Math.random() * 62);
        if(r < 10)
            r += 48;
        else if(r < 36)
            r += 65 - 10;
        else
            r += 97 - 36;
        currentPass += String.fromCodePoint(r);
    }
    console.log(`Password for English: ${currentPass}`);
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
