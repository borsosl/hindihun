import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {ResultOrError} from '../../../../backend/app/src/main/helper/error';
import {SolrResponse} from '../../../../backend/app/src/main/model/solr';
import {ActivatedRouteSnapshot, Resolve, Router} from '@angular/router';
import {take} from 'rxjs/operators';
import {processLine as devaToKtrans} from '../../../../script/ktrans-to-unicode/process-unicode-text';
import {SearchType} from '../../../../script/common/model';

const pwdStorageKey = 'DB2_PWD';
const prefixSplitter = /^((.*?)%)?(([jhm])\s+)?(.*)/;

@Injectable({
    providedIn: 'root'
})
export class SearchService implements Resolve<any> {

    searchSubject = new BehaviorSubject<SolrResponse>(null);
    searchFailedSubject = new BehaviorSubject<ResultOrError<SolrResponse>>(null);
    currentPassword: string;

    constructor(private http: HttpClient, private router: Router) {
        this.currentPassword = window.localStorage.getItem(pwdStorageKey);
    }

    search(input: string) {
        const rexRes = prefixSplitter.exec(input.trim());
        if(!rexRes)
            return;
        const prefix = rexRes[4];
        const searchExpression = rexRes[5];
        let searchType: SearchType;
        switch(prefix) {
            case 'j': searchType = SearchType.trans; break;
            case 'h': searchType = SearchType.hindi; break;
            case 'm': searchType = SearchType.hun; break;
            default: searchType = SearchType.title; break;
        }
        let sanitizedInput = prefix ? `${prefix} ${searchExpression}` : searchExpression;
        let pass = rexRes[1] ? rexRes[2] : null;
        if(pass !== null) {
            sanitizedInput = `${pass}%${sanitizedInput}`;
            if(pass) {
                this.currentPassword = pass;
                window.localStorage.setItem(pwdStorageKey, pass);
            } else if(this.currentPassword)
                pass = this.currentPassword;
        }
        this.request(searchType, pass, devaToKtrans(searchExpression, false, true), sanitizedInput);
    }

    private request(searchType: SearchType, pass: string, searchExpression: string, sanitizedInput: string) {
        searchExpression = this.sanitizeExpr(searchExpression, searchType);
        this.http.get<ResultOrError<SolrResponse>>('/api/' + SearchType[searchType], {
            params: {
                q: searchExpression,
                ...pass !== null && {pass}
            }
        }).subscribe(roe => {
            if(roe.result && roe.result.numFound) {
                document.title = pass ? sanitizedInput.slice(sanitizedInput.indexOf('%') + 1) : sanitizedInput;
                roe.result.input = sanitizedInput;
                this.searchSubject.next(roe.result);
                // noinspection JSIgnoredPromiseFromCall
                this.router.navigate(['/'], {
                    queryParams: {
                        q: sanitizedInput
                    }
                });
            } else {
                if(!roe.result)
                    roe.result = {} as SolrResponse;
                roe.result.input = sanitizedInput;
                roe.error = 'Nincs találat.';
                this.searchFailedSubject.next(roe);
            }
        }, (err: HttpErrorResponse) => {
            this.searchFailedSubject.next({
                result: {
                    input: sanitizedInput
                } as SolrResponse,
                error: err.status === 503
                    ? 'Az adatbázis szerver most indul. 2-3 perc múlva használható.'
                    : err.error && err.error.error
                        ? `Hiba történt: ${err.error.error}`
                        : err.message
                            ? `Hiba történt: ${err.message}`
                            : 'Ismeretlen hiba történt'
            });
        });
    }

    private sanitizeExpr(expr: string, searchType: SearchType) {
        const general = expr
            .replace(/([ "]|^)\*/g, '$1\\*')
            .replace(/(\S)-/g, '$1\\-');
        return searchType === SearchType.title || searchType === SearchType.hindi
            ? general.replace(/'/g, 'a')
                .replace(/[~#]/g, 'n')
            : general;
    }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const q = route.queryParamMap.get('q');
        if(!q) {
            document.title = 'Hindí-magyar szótár';
            this.searchSubject.next(null);
            return of('root');
        }
        const last = this.searchSubject.getValue();
        if(last && q === last.input)
            return of('prev');
        this.search(q);
        return this.searchSubject.pipe(
            take(2)
        );
    }
}
