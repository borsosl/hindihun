import {Response} from 'express';
import {AxiosResponse} from 'axios';

export interface ResultOrError<T = unknown> {
    result?: T;
    error?: unknown;
}

export interface InternalResult<T = unknown> {
    status?: number;
    result: T;
}

export function internalResult<T = unknown>(resp: AxiosResponse<T>): InternalResult<T> {
    return {
        status: resp.status,
        result: resp.data
    };
}

export async function restResult<T>(resp: Response, fn: () => Promise<InternalResult<T>>) {
    try {
        const res = await fn();
        const roe: ResultOrError<T> = {
            result: res.result
        };
        resp
            .status(res.status)
            .json(roe);
    } catch(e) {
        if(e.response) {
            // Non-2xx http response
            writeError(resp, e.response.status, e.response.data);
        } else if(e.request) {
            writeError(resp, 400, 'Http request failed');
        } else if(e.message) {
            writeError(resp, 500, e.message);
        } else {
            writeError(resp, 500, JSON.stringify(e));
        }
    }
}

function writeError(resp: Response, status: number, text: string) {
    const roe: ResultOrError = {
        error: text
    };
    resp.status(status).json(roe);
}
