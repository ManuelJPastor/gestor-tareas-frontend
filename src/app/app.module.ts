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
import { TareasComponent } from './tareas/tareas.component';
import { LoginComponent } from './login/login.component';
import { AuthenticationService } from './login/auth.service';
import { HttpInterceptorService } from './http-interceptor.service';
import { PaginacionPipe } from './pipes/paginacion.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator'
import { CustomMatPaginatorIntl } from './paginator-es';
import { UsuariosFormComponent } from './usuarios/usuarios-form/usuarios-form.component';
import { TareasFormComponent } from './tareas/tareas-form/tareas-form.component';
import { FormsModule } from '@angular/forms';
import { SettingsComponent } from './settings/settings.component';
import { SectoresComponent } from './settings/sectores/sectores.component';
import { SectoresFormComponent } from './settings/sectores/sectores-form/sectores-form.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { TareasRamaComponent } from './tareas/tareas-rama/tareas-rama.component';

const routes: Routes = [
  {path: '', redirectTo: '/usuarios', pathMatch: 'full'},
  {path: 'home', redirectTo: '/usuarios', pathMatch: 'full'},
  {path: 'directivas', component: DirectivaComponent},
  {path: 'usuarios', component: UsuariosComponent},
  {path: 'usuarios/form', component: UsuariosFormComponent},
  {path: 'usuarios/form/:id', component: UsuariosFormComponent},
  {path: 'login', component: LoginComponent},
  {path: 'tareas', component: TareasComponent},
  {path: 'tareas/form', component: TareasFormComponent},
  {path: 'tareas/form/:id', component: TareasFormComponent},
  {path: 'settings', component: SettingsComponent},
  {path: 'settings/sectores', component: SectoresComponent},
  {path: 'settings/sectores/form', component: SectoresFormComponent},
  {path: 'settings/sectores/form/:id', component: SectoresFormComponent},
  {path: 'tareas/rama/:id', component: TareasRamaComponent},
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    DirectivaComponent,
    UsuariosComponent,
    UsuariosFormComponent,
    TareasComponent,
    LoginComponent,
    PaginacionPipe,
    TareasFormComponent,
    SettingsComponent,
    SectoresComponent,
    SectoresFormComponent,
    TareasRamaComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    MatPaginatorModule,
    NgMultiSelectDropDownModule.forRoot()
  ],
    providers: [UsuarioService, AuthenticationService, {provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl} /*{
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    }*/],
  bootstrap: [AppComponent]
})
export class AppModule { }
