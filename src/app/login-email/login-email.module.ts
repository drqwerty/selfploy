import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginEmailPageRoutingModule } from './login-email-routing.module';

import { LoginEmailPage } from './login-email.page';
import { LoginPasswordComponent } from '../login-password/login-password.component';
import { LoginRegisterComponent } from '../login-register/login-register.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginEmailPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [
    LoginEmailPage,
    LoginPasswordComponent,
    LoginRegisterComponent
  ],
  entryComponents: [
    LoginPasswordComponent,
    LoginRegisterComponent
  ]
})
export class LoginEmailPageModule { }
