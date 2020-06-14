import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginRegisterComponent } from './login-register.component';
import { StatusBarModule } from '../status-bar/status-bar.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    StatusBarModule,
  ],
  declarations: [
    LoginRegisterComponent,
  ],
  exports: [
    LoginRegisterComponent,
  ],
})
export class LoginRegisterModule { }
