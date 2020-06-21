import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/models/user-model';
import { FirebaseStorage } from 'src/app/services/firebase-storage.service';

@Component({
  selector: 'professional-card',
  templateUrl: './professional-card.component.html',
  styleUrls: ['./professional-card.component.scss'],
})
export class ProfessionalCardComponent implements OnInit {

  @Input() professional: User;

  stars = 3;
  jobs = 12;

  showSpinner = true;

  constructor(
    private fStorage: FirebaseStorage,
  ) {
  }

  ngOnInit() {
    this.getImage();
  }
  
  async getImage() {
    if (this.professional?.hasProfilePic) 
      this.professional.profilePic = await this.fStorage.getUserProfilePic(this.professional.id);
  }

  imageLoaded() {
    this.showSpinner = false;
  }
}
