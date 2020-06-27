import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileModalComponent } from './profile.component';
import { ProfileViewModule } from 'src/app/components/templates/profile-view/profile-view.module';
import { MapPreviewModule } from 'src/app/components/templates/map-preview/map-preview.module';
import { FabWithTextModule } from 'src/app/components/templates/fab-with-text/fab-with-text.module';
import DebounceClickModule from 'src/app/directives/debounce-click.module';



@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ProfileViewModule,
    MapPreviewModule,
    FabWithTextModule,
    DebounceClickModule,
  ],
  declarations: [
    ProfileModalComponent,
  ],
  exports: [
    ProfileModalComponent,
  ],
})
export class ProfileModalModule { }
