import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainPageRoutingModule } from './main-routing.module';

import { MainPage } from './main.page';

import { ImageCropperModule } from 'ngx-image-cropper';
import { ImageCropperComponent } from 'src/app/components/image-cropper/image-cropper.component';
import { LoginRegisterComponent } from 'src/app/components/login-register/login-register.component';
import { TermsAndConditionsComponent } from 'src/app/components/terms-and-conditions/terms-and-conditions.component';
import { CameraSourceActionSheetComponent } from 'src/app/components/camera-source-action-sheet/camera-source-action-sheet.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainPageRoutingModule,
    ImageCropperModule,
    ReactiveFormsModule,
  ],
  declarations: [
    MainPage,
    ImageCropperComponent,
    LoginRegisterComponent,
    CameraSourceActionSheetComponent,
    TermsAndConditionsComponent,
  ],
  entryComponents: [
    LoginRegisterComponent,
  ],
  providers: [FormBuilder]
})
export class MainPageModule { }
