import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss'],
})
export class TermsAndConditionsComponent {

  form: FormGroup;


  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
  ) {

    this.form = this.formBuilder.group({
      terms: new FormControl(false, [
        Validators.requiredTrue,
      ]),
      gprd: new FormControl(false, [
        Validators.requiredTrue,
      ]),
    })
  }


  dismiss() {

    this.modalController.dismiss();
  }


  accept() {

    this.modalController.dismiss({
      terms: this.form.value.terms,
      gprd: this.form.value.gprd,
    })
  }

}
