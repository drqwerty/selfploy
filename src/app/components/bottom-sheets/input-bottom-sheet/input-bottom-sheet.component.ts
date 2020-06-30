import { Component, ViewChild, Input } from '@angular/core';
import { IonInput, ModalController, IonTextarea } from '@ionic/angular';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-input-bottom-sheet',
  templateUrl: './input-bottom-sheet.component.html',
  styleUrls: ['./input-bottom-sheet.component.scss'],
})
export class InputBottomSheetComponent {

  @Input() type: 'input' | 'text-area';
  @Input() title: string;
  @Input() form: FormGroup;
  @Input() keyboardType: 'text' | 'number' = 'text';
  

  @ViewChild(IonInput) input: IonInput;
  @ViewChild(IonTextarea) textArea: IonTextarea;


  constructor(
    private modalController: ModalController,
  ) { }


  ionViewDidEnter() {
    setTimeout(() => {
      if (this.type === 'input') {
        this.input.setFocus()
      } else {
        this.textArea.setFocus()
      }
    });
  }

  cancel() {
    this.modalController.dismiss();
  }

  accept() {
    if (this.form.invalid) return;

    this.modalController.dismiss({
      value: this.form.value.value
    })
  }

}

