import {Component, OnInit} from '@angular/core';
import {SearchService} from './service/search.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'hh-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    searchText: string;

    constructor(private searchService: SearchService, private router: Router,
                private activatedRoute: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.activatedRoute.queryParamMap.subscribe(map => {
            const q = map.get('q');
            if(q)
                this.searchText = q;
            else
                this.reset();
        });
    }

    private reset() {
        this.searchText = '';
        this.searchService.searchSubject.next(null);
        this.searchService.searchFailedSubject.next(null);
    }

    search() {
        this.searchService.search(this.searchText);
    }

    titleClick() {
        this.reset();
        // noinspection JSIgnoredPromiseFromCall
        this.router.navigate(['/']);
    }
}
