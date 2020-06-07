import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SearchService} from './service/search.service';
import {BehaviorSubject} from 'rxjs';
import {SolrResponse} from '../../../backend/app/src/main/model/solr';
import {ResultOrError} from '../../../backend/app/src/main/helper/error';

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
}
