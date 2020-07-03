import { Component, OnInit, Input } from '@angular/core';
import { Request, RequestStatus } from 'src/app/models/request-model';
import { ModalController } from '@ionic/angular';
import { RequestCardActionSheetComponent } from '../../action-sheets/request-card-action-sheet/request-card-action-sheet.component';

@Component({
  selector: 'request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.scss'],
})
export class RequestCardComponent implements OnInit {

  @Input() request: Request;


  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    console.log(this.request);

  }

  async presentOptions(ev: any) {
    const modal = await this.modalController.create({
      component: RequestCardActionSheetComponent,
      cssClass: 'action-sheet border-top-radius',
    });

    modal.onDidDismiss().then(({ data }) => {
      if (data) {

        switch (data) {
          case RequestStatus.closed:
          case RequestStatus.completed:
          case RequestStatus.edit:
          case RequestStatus.delete:
            console.log(data);

            break;

          default:
            break;
        }

      }
    })

    modal.present();
  }

}
