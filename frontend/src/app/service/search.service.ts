import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {ResultOrError} from '../../../../backend/app/src/main/helper/error';
import {SolrResponse} from '../../../../backend/app/src/main/model/solr';
import {ActivatedRouteSnapshot, Resolve, Router} from '@angular/router';
import {take} from 'rxjs/operators';
import {processLine as ktod} from '../../../../script/ktrans-to-unicode/process-unicode-text';

const prefixSplitter = /^(([fhm])\s+)?(.*)/;
export enum SearchType {
    title,
    hindi,
    trans,
    hun
}

@Injectable({
    providedIn: 'root'
})
export class SearchService implements Resolve<any> {

    searchSubject = new BehaviorSubject<SolrResponse>(null);
    searchFailedSubject = new BehaviorSubject<ResultOrError<SolrResponse>>(null);

    constructor(private http: HttpClient, private router: Router) {
    }

    search(input: string) {
        const rexRes = prefixSplitter.exec(input.trim());
        if(!rexRes)
            return;
        const prefix = rexRes[2];
        const searchExpression = rexRes[3];
        let searchType: SearchType;
        switch(prefix) {
            case 'f': searchType = SearchType.trans; break;
            case 'h': searchType = SearchType.hindi; break;
            case 'm': searchType = SearchType.hun; break;
            default: searchType = SearchType.title; break;
        }
        const sanitizedInput = prefix ? `${prefix} ${searchExpression}` : searchExpression;
        this.request(searchType, ktod(searchExpression, false), sanitizedInput);
    }

    private request(searchType: SearchType, searchExpression: string, sanitizedInput: string) {
        this.http.get<ResultOrError<SolrResponse>>('/api/' + SearchType[searchType], {
            params: {
                q: searchExpression
            }
        }).subscribe(roe => {
            if(roe.result && roe.result.numFound) {
                document.title = sanitizedInput;
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
                this.searchFailedSubject.next(roe);
            }
        }, err => {
            this.searchFailedSubject.next({
                result: {
                    input: sanitizedInput
                } as SolrResponse,
                error: err
            });
        });
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
