import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Review } from 'src/app/models/review-model';
import { DataService } from 'src/app/providers/data.service';
import { User } from 'src/app/models/user-model';
import { Moment } from 'moment';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss'],
})
export class ReviewsComponent {


  @Input() userId: string;

  pageLoaded = false;
  reviewList: { review: Review, user: User }[];

  constructor(
    private modalController: ModalController,
    private dataService: DataService,
  ) { }


  ionViewWillEnter() {
    this.dataService.getAllReviewFrom(this.userId)
      .then(reviews => this.reviewList = reviews);
  }


  ionViewDidEnter() {
    this.pageLoaded = true;
  }


  goBack() {
    this.modalController.dismiss();
  }


  formatDate(moment: Moment) {
    return moment.format('LL');
  }

}
