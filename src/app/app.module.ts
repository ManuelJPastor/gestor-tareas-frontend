import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { PaginacionPipe } from './pipes/paginacion.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator'
import { FormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ExpandMode, NgxTreeSelectModule } from 'ngx-tree-select';
import { AuthUserGuard } from './guards/authUser.guard';
import { AuthAdminGuard } from './guards/authAdmin.guard';
import { LoginComponent } from './components/login/login.component';
import { TareasComponent } from './components/tareas/tareas.component';
import { TareasFormComponent } from './components/tareas/tareas-form/tareas-form.component';
import { TareasRamaComponent } from './components/tareas/tareas-rama/tareas-rama.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SectoresComponent } from './components/settings/sectores/sectores.component';
import { SectoresFormComponent } from './components/settings/sectores/sectores-form/sectores-form.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { UsuariosFormComponent } from './components/usuarios/usuarios-form/usuarios-form.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthenticationService } from './services/auth.service';
import { UsuarioService } from './services/usuario.service';
import { HttpInterceptorService } from './services/http-interceptor.service';
import { CustomMatPaginatorIntl } from './pipes/paginator-es';
import { DatePipe } from '@angular/common';
import {AutosizeModule} from 'ngx-autosize';
import { ParticipanteGuard } from './guards/participante.guard';
import { PerfilGuard } from './guards/perfil.guard';
import { PlantillasComponent } from './components/plantillas/plantillas.component';

const routes: Routes = [

  {path: 'login', component: LoginComponent},
  {path: 'tareas', component: TareasComponent, canActivate: [ AuthUserGuard]},
  {path: 'tareas/form', component: TareasFormComponent, canActivate: [ AuthUserGuard ]},
  {path: 'tareas/form/:id', component: TareasFormComponent, canActivate: [ AuthUserGuard, ParticipanteGuard ]},
  {path: 'tareas/rama', component: TareasRamaComponent, canActivate: [ AuthUserGuard ]},
  {path: 'tareas/rama/:id', component: TareasRamaComponent, canActivate: [ AuthUserGuard ]},
  {path: 'settings', component: SettingsComponent, canActivate: [ AuthAdminGuard ]},
  {path: 'settings/sectores', component: SectoresComponent, canActivate: [ AuthAdminGuard ]},
  {path: 'settings/sectores/form', component: SectoresFormComponent, canActivate: [ AuthAdminGuard ]},
  {path: 'settings/sectores/form/:id', component: SectoresFormComponent, canActivate: [ AuthAdminGuard ]},
  {path: 'settings/usuarios', component: UsuariosComponent, canActivate: [ AuthAdminGuard ]},
  {path: 'usuarios/form', component: UsuariosFormComponent, canActivate: [ AuthAdminGuard ]},
  {path: 'usuarios/form/:id', component: UsuariosFormComponent, canActivate: [ AuthUserGuard, PerfilGuard ]},
  {path: 'plantillas', component: PlantillasComponent, canActivate: [ AuthAdminGuard ]},
  {path: '**', redirectTo: '/tareas', pathMatch: 'full'},
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    UsuariosComponent,
    UsuariosFormComponent,
    TareasComponent,
    LoginComponent,
    PaginacionPipe,
    TareasFormComponent,
    SettingsComponent,
    SectoresComponent,
    SectoresFormComponent,
    TareasRamaComponent,
    PlantillasComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    MatPaginatorModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgxTreeSelectModule.forRoot({
       idField: 'id',
       textField: 'titulo',
       expandMode: ExpandMode.None,
       allowFilter: true,
       filterPlaceholder: 'Type your filter here...',
       maxVisibleItemCount: 5,
       childrenField: 'subTareas',
       allowParentSelection: true,
     }),
     AutosizeModule
  ],
    providers: [UsuarioService, AuthenticationService, {provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl} ,{
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    }, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
