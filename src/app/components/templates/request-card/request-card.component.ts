import { Component, OnInit, Input } from '@angular/core';
import { Request, RequestStatus } from 'src/app/models/request-model';
import { ModalController } from '@ionic/angular';
import { RequestCardActionSheetComponent } from 'src/app/components/action-sheets/request-card-action-sheet/request-card-action-sheet.component';
import { DeleteConfirmActionSheetComponent } from 'src/app/components/action-sheets/delete-confirm-action-sheet/delete-confirm-action-sheet.component';
import { DataService } from 'src/app/providers/data.service';

@Component({
  selector: 'request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.scss'],
})
export class RequestCardComponent implements OnInit {

  @Input() request: Request;


  constructor(
    private modalController: ModalController,
    private data: DataService,
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
            console.log(data);

            break;
          case RequestStatus.delete:
            this.deleteRequest();

            break;

          default:
            break;
        }

      }
    })

    modal.present();
  }

  async deleteRequest() {
    const modal = await this.modalController.create({
      component: DeleteConfirmActionSheetComponent,
      cssClass: 'modal',
    });

    modal.onDidDismiss().then(({ data: confirm }) => {
      if (confirm) this.data.removeRequest(this.request);
    });

    modal.present();
  }

}
