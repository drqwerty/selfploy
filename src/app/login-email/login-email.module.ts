import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginEmailPageRoutingModule } from './login-email-routing.module';

import { LoginEmailPage } from './login-email.page';
import { LoginPasswordComponent } from '../login-password/login-password.component';
import { LoginRegisterComponent } from '../login-register/login-register.component';
import { TermsAndConditionsComponent } from '../terms-and-conditions/terms-and-conditions.component';

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
    LoginRegisterComponent,
    TermsAndConditionsComponent,
  ],
  entryComponents: [
    LoginPasswordComponent,
    LoginRegisterComponent,
    TermsAndConditionsComponent,
  ]
})
export class LoginEmailPageModule { }
