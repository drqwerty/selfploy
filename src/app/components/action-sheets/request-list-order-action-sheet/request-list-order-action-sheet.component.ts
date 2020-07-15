import { Component } from '@angular/core';
import { UserConfig } from 'src/app/models/user-model';
import { DataService } from 'src/app/providers/data.service';
import { RequestListConfig } from 'src/app/models/request-model';

@Component({
  selector: 'app-request-list-order-action-sheet',
  templateUrl: './request-list-order-action-sheet.component.html',
  styleUrls: ['./request-list-order-action-sheet.component.scss'],
})
export class RequestListOrderActionSheetComponent {

  userConfig: UserConfig;

  options = {
    date: false,
    state: false,
    ascending: false,
  };

  constructor(
    private data: DataService,
  ) {
    this.init();
  }


  async init() {
    this.userConfig = await this.data.getUserConfig();

    this.options.date = this.userConfig.requestListOptions.orderBy == RequestListConfig.orderByDate;
    this.options.state = this.userConfig.requestListOptions.orderBy == RequestListConfig.orderByState;
    this.options.ascending = this.userConfig.requestListOptions.order == RequestListConfig.ascendingOrder;
  }


  changeOrder(order: 'date' | 'state') {

    if (order === 'date') {
      if (this.options.date) {
        this.options.ascending = !this.options.ascending;
      } else {
        this.options.date = true;
        this.options.state = false;
        this.options.ascending = false;
      }

    } else {
      if (this.options.state) {
        this.options.ascending = !this.options.ascending;
      } else {
        this.options.date = false;
        this.options.state = true;
        this.options.ascending = false;
      }

    }

    this.updateUserConfig();

  }


  updateUserConfig() {
    this.userConfig.requestListOptions.orderBy = this.options.date
      ? RequestListConfig.orderByDate
      : RequestListConfig.orderByState;
    this.userConfig.requestListOptions.order = this.options.ascending
      ? RequestListConfig.ascendingOrder
      : RequestListConfig.descendingOrder;
    this.data.updateUserConfig(this.userConfig);
  }

}
