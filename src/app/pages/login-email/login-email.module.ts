import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginEmailPageRoutingModule } from './login-email-routing.module';

import { LoginEmailPage } from './login-email.page';
import { LoginPasswordComponent } from '../../components/login-password/login-password.component';
import { LoginRegisterComponent } from '../../components/login-register/login-register.component';
import { TermsAndConditionsComponent } from '../../components/terms-and-conditions/terms-and-conditions.component';
import { CameraSourceActionSheetComponent } from 'src/app/components/camera-source-action-sheet/camera-source-action-sheet.component';
import { StatusBarModule } from 'src/app/components/status-bar/status-bar.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginEmailPageRoutingModule,
    ReactiveFormsModule,
    StatusBarModule,
  ],
  declarations: [
    LoginEmailPage,
    LoginPasswordComponent,
    LoginRegisterComponent,
    CameraSourceActionSheetComponent,
    TermsAndConditionsComponent,
  ],
  entryComponents: [
    LoginPasswordComponent,
    LoginRegisterComponent,
  ]
})
export class LoginEmailPageModule { }
