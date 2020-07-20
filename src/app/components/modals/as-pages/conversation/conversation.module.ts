import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConversationComponent } from './conversation.component';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';
import { FivGalleryModule } from '@fivethree/core';
import { ImageMessagesPipe } from 'src/app/pipes/image-messages.pipe';
import { AutosizeModule } from 'ngx-autosize';
import { ObjectToArrayPipe } from 'src/app/pipes/object-to-array.pipe';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StatusBarModule,
    FivGalleryModule,
    AutosizeModule,
    PipesModule,
  ],
  declarations: [
    ConversationComponent,
  ],
  exports: [
    ConversationComponent
  ],
})
export class ConversationModule { }
