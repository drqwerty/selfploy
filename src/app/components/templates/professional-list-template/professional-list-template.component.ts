import { Component, Input } from '@angular/core';
import { User } from 'src/app/models/user-model';
import { DataService } from 'src/app/providers/data.service';
import { Filters, Order } from 'android/app/build/intermediates/merged_assets/debug/out/public/assets/filters';
import { Request } from 'src/app/models/request-model';
import { FilterDefaultValues } from 'src/assets/filters';

@Component({
  host: {
    style: 'display: contents',
  },
  selector: 'professional-list',
  templateUrl: './professional-list-template.component.html',
  styleUrls: ['./professional-list-template.component.scss'],
})
export class ProfessionalListTemplateComponent {

  @Input() selectingProfessionals = false;


  professionalsWithoutFilters : User[];
  professionals               : User[];
  serviceName                 : string;
  categoryName                : string;

  pageLoaded = false;

  constructor(
    private dataService: DataService,
  ) { }


  async getProfessionals(serviceName: string, categoryName: string) {
    this.serviceName   = serviceName;
    this.categoryName  = categoryName;
    this.professionals = await this.dataService.findProfessionalOf(this.categoryName, this.serviceName);
    this.professionalsWithoutFilters = this.professionals;
    console.table(this.professionals);
  }


  async getProfessionalsFiltered(serviceName: string, categoryName: string, filterValues: Filters) {
    this.serviceName   = serviceName;
    this.categoryName  = categoryName;
    this.professionalsWithoutFilters = await this.dataService.findProfessionalOf(this.categoryName, this.serviceName);

    this.filterResults(filterValues, false);
  }


  filterResults(filterValues: Filters, resetFilters: boolean) {
    if (resetFilters) {
      this.professionals = this.professionalsWithoutFilters;
    } else {
      this.professionals = this.professionalsWithoutFilters.filter(user => {
        if (user.distance > filterValues.distance.value) return false;
        if (!user.workingHours.some(workinHour => filterValues.workingHours.value.includes(workinHour))) return false;
        if (user.avg < filterValues.classification.value) return false;

        return true;
      });

      const ascendenOrder = filterValues.order.value.ascendent;

      if (filterValues.order.value.order == Order.distance) {
        if (ascendenOrder) this.professionals?.sort((a, b) => a.distance - b.distance);
        else this.professionals?.sort((a, b) => b.distance - a.distance);

      } else {
        if (ascendenOrder) this.professionals?.sort((a, b) => a.avg - b.avg);
        else this.professionals?.sort((a, b) => b.avg - a.avg);
      }
    }
  }
}