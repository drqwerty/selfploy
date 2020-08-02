import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { User } from 'src/app/models/user-model';
import { DataService } from 'src/app/providers/data.service';

@Component({
  selector: 'app-review-new',
  templateUrl: './review-new.component.html',
  styleUrls: ['./review-new.component.scss'],
})
export class ReviewNewComponent {

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
      text: new FormControl('', [
        Validators.maxLength(this.TEXT_LIMIT),
      ]),
    });
  }


  close() {
    this.modalController.dismiss();
  }


  async post() {
    const { starRating, text } = this.reviewForm.value;
    await this.dataService.postReview(this.professional.id, starRating, text);
    this.modalController.dismiss();
  }


  countText() {
    this.textLength = this.reviewForm.value.text.length;
  }

}
