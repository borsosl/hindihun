import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './home.component';
import {SearchService} from './service/search.service';


const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        pathMatch: 'full',
        runGuardsAndResolvers: 'always',
        resolve: {
            q: SearchService
        }
    }, {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule {
}
