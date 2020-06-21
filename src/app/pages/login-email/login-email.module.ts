import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginEmailPageRoutingModule } from './login-email-routing.module';

import { LoginEmailPage } from './login-email.page';
import { LoginPasswordComponent } from 'src/app/components/modals/as-pages/login-password/login-password.component';
import { LoginRegisterModule } from 'src/app/components/modals/as-pages/login-register/login-register.module';
import { TermsAndConditionsModule } from 'src/app/components/modals/terms-and-conditions/terms-and-conditions.module';
import { CameraSourceActionSheetModule } from 'src/app/components/action-sheets/camera-source-action-sheet/camera-source-action-sheet.module';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginEmailPageRoutingModule,
    TermsAndConditionsModule,
    ReactiveFormsModule,
    StatusBarModule,
    CameraSourceActionSheetModule,
    LoginRegisterModule,
  ],
  declarations: [
    LoginEmailPage,
    LoginPasswordComponent,
  ],
  entryComponents: [
    LoginPasswordComponent,
  ]
})
export class LoginEmailPageModule { }
