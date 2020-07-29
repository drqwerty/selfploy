import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/models/user-model';
import { DataService } from 'src/app/providers/data.service';

@Component({
  host: {
    style: 'display: contents',
  },
  selector: 'professional-list',
  templateUrl: './professional-list.component.html',
  styleUrls: ['./professional-list.component.scss'],
})
export class ProfessionalListComponent implements OnInit {

  professionals: User[];
  serviceName  : string;
  categoryName : string;

  pageLoaded = false;

  constructor(
    private dataService: DataService,
  ) { }


  ngOnInit() { }


  async getProfessionals(serviceName: string, categoryName: string) {
    this.serviceName  = serviceName;
    this.categoryName = categoryName;
    this.professionals = await this.dataService.findProfessionalOf(this.categoryName, this.serviceName);
    console.table(this.professionals);
  }

}
