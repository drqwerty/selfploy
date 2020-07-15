import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConversationComponent } from './conversation.component';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StatusBarModule,
  ],
  declarations: [
    ConversationComponent
  ],
  exports: [
    ConversationComponent
  ],
})
export class ConversationModule { }
