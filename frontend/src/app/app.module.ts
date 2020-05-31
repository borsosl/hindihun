import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {InputTextModule} from 'primeng/inputtext';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HeaderComponent} from './header.component';
import {HomeComponent} from './home.component';
import {UsageComponent} from './general/usage.component';
import {CardModule} from 'primeng/card';

@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        HomeComponent,
        UsageComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule,
        AppRoutingModule,
        InputTextModule,
        CardModule
    ],
    providers: [],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
