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
  professionalImage: string;

  stars = 3;
  jobs = 12;


  constructor(
    private fStorage: FirebaseStorage,
  ) {
  }

  ngOnInit() {
    this.getImage();
  }
  
  async getImage() {
    if (this.professional.hasProfilePic)
      this.professionalImage = await this.fStorage.getUserProfilePic(this.professional.id);
  }


}
