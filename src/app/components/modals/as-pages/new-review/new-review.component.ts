import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { User } from 'src/app/models/user-model';
import { DataService } from 'src/app/providers/data.service';

@Component({
  selector: 'app-new-review',
  templateUrl: './new-review.component.html',
  styleUrls: ['./new-review.component.scss'],
})
export class NewReviewComponent {

  readonly TEXT_LIMIT = 300;


  @Input() professional: User;


  textLength = 0;
  reviewForm: FormGroup;


  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private dataService: DataService,
  ) {
    this.initForm();
  }


  initForm() {
    this.reviewForm = this.formBuilder.group({
      starRating: new FormControl(0, [
        Validators.required,
        Validators.minLength(1)
      ]),
      review: new FormControl('', [
        Validators.maxLength(this.TEXT_LIMIT),
      ]),
    });
  }


  close() {
    this.modalController.dismiss();
  }


  post() {
    this.modalController.dismiss();

    console.log(this.reviewForm.value.starRating);
    console.log(this.reviewForm.value.review);
  }


  countText() {
    this.textLength = this.reviewForm.value.review.length;
  }

}
