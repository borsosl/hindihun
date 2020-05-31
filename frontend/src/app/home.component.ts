import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SearchService} from './service/search.service';
import {Szavak} from './model/schema';

@Component({
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

    hits: Szavak[];


    constructor(private router: Router, private searchService: SearchService) {
    }

    ngOnInit() {
    }
}
