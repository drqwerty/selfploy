import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { MainPageRoutingModule } from './main-routing.module';
import { MainPage } from './main.page';

import { LoginRegisterModule } from 'src/app/components/login-register/login-register.module';
import { TermsAndConditionsModule } from 'src/app/components/terms-and-conditions/terms-and-conditions.module';
import { CameraSourceActionSheetModule } from 'src/app/components/camera-source-action-sheet/camera-source-action-sheet.module';
import { StatusBarModule } from 'src/app/components/status-bar/status-bar.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainPageRoutingModule,
    ReactiveFormsModule,
    StatusBarModule,
    TermsAndConditionsModule,
    CameraSourceActionSheetModule,
    LoginRegisterModule,
  ],
  declarations: [
    MainPage,
  ],
  entryComponents: [
  ],
  providers: [FormBuilder]
})
export class MainPageModule { }
