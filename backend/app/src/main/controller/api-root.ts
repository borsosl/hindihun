import {Request, Response, Router} from 'express';
import {restResult, InternalResult, internalResult} from '../helper/error';
import * as url from 'url';
import axios from 'axios';
import {SolrResponse, SolrResult} from '../model/solr';


export function apiRoutes(router: Router) {
    router.get('/title', title);
    router.get('/hindi', hindi);
    router.get('/trans', trans);
    router.get('/hun', hun);
    router.get('/lex', lex);
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
    await restResult(resp, async () => await solrRequest(url.parse(req.url).query, df));
}

export async function solrRequest(params: string, df: string): Promise<InternalResult<SolrResponse>> {
    const int = internalResult(await axios.get<SolrResult>(
        `${process.env.SOLR_URL}/solr/hindihun/query?df=${df}&fl=doc&omitHeader=true&rows=100&${params}`,
        {
            responseType: 'json'
        }
    ));
    return {
        status: int.status,
        result: int.result ? int.result.response : null
    };
}
