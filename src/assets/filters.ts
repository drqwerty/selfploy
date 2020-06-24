import { WorkingHours } from 'src/app/models/user-model';

export enum Order {
  classification = 'Clasificación',
  distance = 'Distancia',
}

export const FilterDefaultValues: Filters = {
  order: {
    name: 'Ordenar',
    value: { order: Order.distance, ascendent: true },
    options: [
      { name: Order.distance, checked: true },
      { name: Order.classification, checked: false }
    ]
  },
  classification: {
    name: 'Clasificación',
    value: 0,
    options: [
      { name: 'Todos', value: 0, checked: true },
      { name: '5',     value: 5, checked: false },
      { name: '4+',    value: 4, checked: false },
      { name: '3+',    value: 3, checked: false },
      { name: '2+',    value: 2, checked: false },
      { name: '1+',    value: 1, checked: false },
    ]
  },
  workingHours: {
    name: 'Horario',
    value: [WorkingHours.morning, WorkingHours.afternoon, WorkingHours.evening, WorkingHours.flexible],
    options: [
      { name: WorkingHours.morning,   checked: true },
      { name: WorkingHours.afternoon, checked: true },
      { name: WorkingHours.evening,   checked: true },
      { name: WorkingHours.flexible,  checked: true },
    ]
  },
  distance: {
    name: 'Distancia',
    value: 30,
  }
};

export interface Filters {
  order: OrderFilter;
  classification: ClassificationFilter;
  workingHours: WorkingHoursFilter;
  distance: DistanceFilter;
}

interface Filter {
  name: string;
}

export interface OrderFilter extends Filter {
  value: { order: Order, ascendent: boolean };
  options: { name: Order, checked: boolean }[];
}

export interface ClassificationFilter extends Filter {
  value: number;
  options: { name: string, value: number, checked: boolean }[];
}

export interface WorkingHoursFilter extends Filter {
  value: WorkingHours[];
  options: { name: WorkingHours, checked: boolean }[];
}

export interface DistanceFilter extends Filter {
  value: number;
}