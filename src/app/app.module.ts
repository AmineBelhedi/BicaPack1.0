import { LOCALE_ID, NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { RouterModule } from '@angular/router';
import { NotfoundModule } from './pages/notfound/notfound.module';
import { TableModule } from 'primeng/table';
import { AuthService } from './services/auth.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor';
@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        AppLayoutModule,
        RouterModule,
        NotfoundModule,
        TableModule // Importation de TableModule pour l'utilisation dans l'application
    ],
    providers: [
        AuthService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        }
        // { provide: LocationStrategy, useClass: HashLocationStrategy },
        // provideHttpClient(withInterceptors([authInterceptor]))
    
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
