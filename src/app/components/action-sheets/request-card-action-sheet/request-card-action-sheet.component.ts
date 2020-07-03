import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { InfoComponent } from 'src/app/components/modals/info/info.component';
import { RequestStatus } from 'src/app/models/request-model';

@Component({
  selector: 'app-request-card-action-sheet',
  templateUrl: './request-card-action-sheet.component.html',
  styleUrls: ['./request-card-action-sheet.component.scss'],
})
export class RequestCardActionSheetComponent {

  @Input() isMine = true;
  @Input() isDraft = true;


  states = RequestStatus;

  constructor(
    private modalController: ModalController,
  ) { }

  async presentInfo() {
    const modal = await this.modalController.create({
      component: InfoComponent,
      cssClass: 'modal',
      componentProps: {
        infoList: [
          {
            title: 'Cerrar',
            description: 'Dejarás de recibir nuevas propuestas, pero podrás seguir comunicándote con los contactos',
            show: !this.isDraft,
          },
          {
            title: 'Marcar como ejecutado',
            description: 'El encargo se cerrará y se deshabilitará la comunicación',
            show: !this.isDraft,
          },
          {
            title: 'Editar',
            description: 'Añade más detalles a tu solicitud',
            show: this.isDraft,
          },
          {
            title: 'Eliminar',
            description:
              this.isMine
                ? 'Cierra el encargo si está publicado y lo elimina de tu lista de encargos'
                : 'Elimina el encargo de tu lista de encargos',
            show: true,
          },
        ]
      }
    });

    modal.present();
  }

  dismiss(optionSelected: RequestStatus) {
    this.modalController.dismiss(optionSelected);
  }

}
