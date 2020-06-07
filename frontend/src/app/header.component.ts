import {ChangeDetectionStrategy, Component} from '@angular/core';
import {SearchService} from './service/search.service';

@Component({
    selector: 'hh-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
    searchText: string;

    constructor(private searchService: SearchService) {
    }

    search() {
        this.searchService.search(this.searchText);
    }
}
