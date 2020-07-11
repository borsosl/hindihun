import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SearchService} from './service/search.service';
import {BehaviorSubject} from 'rxjs';
import {SolrResponse} from '../../../backend/app/src/main/model/solr';
import {ResultOrError} from '../../../backend/app/src/main/helper/error';
import {Ert, Ford, Pl, Szavak, Var} from '../../../script/common/schema';
import {processLine as ktod} from '../../../script/ktrans-to-unicode/process-ktrans-text';

interface HomeViewModel {
    result: SolrResponse;
    error: ResultOrError<SolrResponse>;
}

@Component({
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

    vm = {} as HomeViewModel;
    vm$ = new BehaviorSubject<HomeViewModel>(this.vm);

    constructor(private router: Router, private searchService: SearchService) {
    }

    ngOnInit() {
        this.searchService.searchSubject.subscribe(val => {
            if(val) {
                if(!val.hits)
                    val.hits = val.docs.map(solrDoc => JSON.parse(solrDoc.doc));
                this.vm.error = null;
            }
            this.vm.result = val;
            this.vm$.next(this.vm);
        });
        this.searchService.searchFailedSubject.subscribe(val => {
            if(val) {
                this.vm.result = null;
            }
            this.vm.error = val;
            this.vm$.next(this.vm);
        });
    }

    toWordCardHtml(hit: Szavak) {
        const out: string[] = [];
        out.push(
            `<div>`,
                `<span class="title">${ktod(hit.szo)}</span>`,
                hit.sorsz ? ` <span class="sorsz">${hit.sorsz}</span>` : '',
                `<span class="variant">`,
                    this.list(hit.alt, '&emsp;( ', ' )', true),
                    // std atiras, span italic
                    `&emsp;${hit.szo}`,
                    hit.szarm ? `&emsp;[${hit.szarm}]` : '',
                    // etim: szarm [] belul
                `</span>`,
            `</div>`,
            // lasd
            this.ford(hit.ford),
            // forras
        );
        return out.join('');
    }

    private ford(ford: Ford[]) {
        let wrapStart: string;
        let wrapEnd: string;
        let itemStart: string;
        let itemEnd: string;
        if(ford.length > 1) {
            wrapStart = '<ol>'; wrapEnd = '</ol>'; itemStart = '<li>'; itemEnd = '</li>';
        } else {
            wrapStart = '<div class="unnumbered">'; wrapEnd = '</div>'; itemStart = ''; itemEnd = '';
        }
        const out: string[] = [wrapStart];
        for(const fd of ford) {
            const beforeNyt = !!fd.kif;
            const beforeVar = beforeNyt || !!fd.nyt;
            const hasVar = !!(fd.var && fd.var.length);
            out.push(
                itemStart,
                fd.kif ? `<span class="kif">${ktod(fd.kif)}</span>&ensp;${fd.kif} –` : '',
                fd.nyt ? `${beforeNyt ? '&ensp;' : ''}<i>${fd.nyt}</i>` : '',
                this.variant(fd.var, beforeVar),
                this.ert(fd.ert, hasVar, beforeVar),
                this.pl(fd.pl),
                // szin
                // ant
                // lex
                itemEnd
            );
        }
        out.push(wrapEnd);
        return out.join('');
    }

    private variant(vari: Var[], before: boolean) {
        if(!vari || !vari.length)
            return '';
        const out: string[] = [];
        for(const vr of vari) {
            out.push(
                out.length ? '; ' : before ? '&emsp;{ ' : '{ ',
                `<i>${vr.tipus}:</i>&ensp;${ktod(vr.alak)}`
            );
        }
        out.push(' }');
        return out.join('');
    }

    private ert(ert: (Ert | string)[], hasVar: boolean, before: boolean) {
        const out: string[] = [];
        for(const er of ert) {
            out.push(out.length ? ', ' : hasVar ? '<div class="bef">' : before ? '&ensp;' : '');
            if(typeof er === 'string') {
                out.push(er);
            } else {
                out.push(
                    er.nyt ? `<i>${er.nyt}</i> ` : '',
                    er.szo,
                    er.megj ? ` (${er.megj})` : ''
                );
            }
        }
        if(hasVar)
            out.push('</div>');
        return out.join('');
    }

    private pl(pl: Pl[]) {
        if(!pl || !pl.length)
            return '';
        const out: string[] = [];
        for(const p of pl) {
            out.push(
                out.length ? ', ' : '<ul class="bef">',
                `<li>${ktod(p.ered)}&ensp;${p.ered}`,
                p.ford ? `:&ensp;${p.ford}` : '',
                // forras
                '</li>'
            );
        }
        out.push('</ul>');
        return out.join('');
    }

    private list(items: string[], start = '', end = '', deva = false) {
        if(!items || !items.length)
            return '';
        const out: string[] = [];
        for(const s of items) {
            const t = deva ? ktod(s) : s;
            out.push(out.length ? `, ${t}` : `${start}${t}`);
        }
        out.push(end);
        return out.join('');
    }
}
