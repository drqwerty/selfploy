import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/models/user-model';
import { DataService } from 'src/app/providers/data.service';
import { Filters, Order } from 'android/app/build/intermediates/merged_assets/debug/out/public/assets/filters';

@Component({
  host: {
    style: 'display: contents',
  },
  selector: 'professional-list',
  templateUrl: './professional-list.component.html',
  styleUrls: ['./professional-list.component.scss'],
})
export class ProfessionalListComponent implements OnInit {

  professionalsWithoutFilters : User[];
  professionals               : User[];
  serviceName                 : string;
  categoryName                : string;

  pageLoaded = false;

  constructor(
    private dataService: DataService,
  ) { }


  ngOnInit() { }


  async getProfessionals(serviceName: string, categoryName: string) {
    this.serviceName   = serviceName;
    this.categoryName  = categoryName;
    this.professionals = await this.dataService.findProfessionalOf(this.categoryName, this.serviceName);
    this.professionalsWithoutFilters = this.professionals;
    console.table(this.professionals);
  }


  filterResults(filterValues: Filters, resetFilters: boolean) {
    if (resetFilters) {
      this.professionals = this.professionalsWithoutFilters;
    } else {
      this.professionals = this.professionalsWithoutFilters.filter(user => {
        if (user.distance > filterValues.distance.value) return false;
        if (!user.workingHours.some(workinHour => filterValues.workingHours.value.includes(workinHour))) return false;

        
        if (filterValues.order.value.order == Order.distance) {

          if (filterValues.order.value.ascendent) {
            this.professionals.sort((a, b) => a.distance - b.distance);
            
          } else {
            this.professionals.sort((a, b) => b.distance - a.distance);
          }

        } else {

        }
        
        return true;
      })
    }

  }

}
