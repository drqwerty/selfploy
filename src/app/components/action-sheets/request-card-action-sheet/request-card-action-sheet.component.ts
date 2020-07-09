import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { InfoComponent } from 'src/app/components/modals/info/info.component';
import { RequestStatus } from 'src/app/models/request-model';

@Component({
  selector: 'app-request-card-action-sheet',
  templateUrl: './request-card-action-sheet.component.html',
  styleUrls: ['./request-card-action-sheet.component.scss'],
})
export class RequestCardActionSheetComponent implements OnInit {

  @Input() isMine: boolean;
  @Input() status: RequestStatus;


  states = RequestStatus;

  showButtons = {
    close: false,
    complete: false,
    edit: false,
    remove: false,
  };

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    const isMineAndNoDraft = this.isMine && this.status != this.states.draft;
    this.showButtons.close = isMineAndNoDraft && this.status != this.states.closed && this.status != this.states.completed;
    this.showButtons.complete = isMineAndNoDraft && this.status != this.states.completed;
    this.showButtons.edit = this.isMine && this.status == this.states.draft;
    this.showButtons.remove = true;
  }

  async presentInfo() {
    const modal = await this.modalController.create({
      component: InfoComponent,
      cssClass: 'modal',
      componentProps: {
        infoList: [
          {
            title: 'Cerrar',
            description: 'Dejarás de recibir nuevas propuestas, pero podrás seguir comunicándote con los contactos',
            show: this.showButtons.close,
          },
          {
            title: 'Marcar como ejecutado',
            description: 'El encargo se cerrará y se deshabilitará la comunicación',
            show: this.showButtons.complete,
          },
          {
            title: 'Editar',
            description: 'Añade o cambia detalles a tu solicitud',
            show: this.showButtons.edit,
          },
          {
            title: 'Eliminar',
            description:
              this.isMine
                ? 'Cierra el encargo si no está cerrado y lo elimina de tu lista de encargos'
                : 'Elimina el encargo de tu lista de encargos',
            show: this.showButtons.remove,
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
