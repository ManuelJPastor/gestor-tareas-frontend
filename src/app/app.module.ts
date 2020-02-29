import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { DirectivaComponent } from './directiva/directiva.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { UsuarioService } from './usuarios/usuario.service';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormComponent } from './usuarios/form.component';
import { FormsModule } from '@angular/forms';
import { TareasComponent } from './tareas/tareas.component';
import { LoginComponent } from './login/login.component';
import { AuthenticationService } from './login/auth.service';
import { HttpInterceptorService } from './http-interceptor.service';
import { PaginacionPipe } from './pipes/paginacion.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator'
import { CustomMatPaginatorIntl } from './paginator-es';

const routes: Routes = [
  {path: '', redirectTo: '/usuarios', pathMatch: 'full'},
  {path: 'home', redirectTo: '/usuarios', pathMatch: 'full'},
  {path: 'directivas', component: DirectivaComponent},
  {path: 'usuarios', component: UsuariosComponent},
  {path: 'usuarios/form', component: FormComponent},
  {path: 'usuarios/form/:id', component: FormComponent},
  {path: 'login', component: LoginComponent},
  {path: 'tareas', component: TareasComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    DirectivaComponent,
    UsuariosComponent,
    FormComponent,
    TareasComponent,
    LoginComponent,
    PaginacionPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    MatPaginatorModule
  ],
    providers: [UsuarioService, AuthenticationService, {provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl} /*{
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    }*/],
  bootstrap: [AppComponent]
})
export class AppModule { }
