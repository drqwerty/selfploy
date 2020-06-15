export const Categories: Category[] = [
  {
    name: 'carpintería',
    icon: '/assets/icon/categories/carpenter.svg',
    color: '#F2A365',
    checked: false,
    indeterminateState: false,
    collapsed: true,
    services: [
      {
        name: 'aluminio',
        checked: false,
      },
      {
        name: 'muebles',
        checked: false,
      },
      {
        name: 'carpintería general',
        checked: false,
      },
    ]
  },
  {
    name: 'cerrajería',
    icon: '/assets/icon/categories/locksmith.svg',
    color: '#58A2BE',
    checked: false,
    indeterminateState: false,
    collapsed: true,
    services: [
      {
        name: 'cerraduras',
        checked: false,
      },
      {
        name: 'llaves',
        checked: false,
      },
      {
        name: 'cerrajería general',
        checked: false,
      },
    ]
  },
  {
    name: 'electricidad',
    icon: '/assets/icon/categories/electrician.svg',
    color: '#FFC95E',
    checked: false,
    indeterminateState: false,
    collapsed: true,
    services: [
      {
        name: 'instalaciones',
        checked: false,
      },
      {
        name: 'iluminación',
        checked: false,
      },
      {
        name: 'electricidad general',
        checked: false,
      },
    ]
  },
  {
    name: 'fontanería',
    icon: '/assets/icon/categories/plumber.svg',
    color: '#80D4F8',
    checked: false,
    indeterminateState: false,
    collapsed: true,
    services: [
      {
        name: 'cañerías',
        checked: false,
      },
      {
        name: 'griferías',
        checked: false,
      },
      {
        name: 'humedades',
        checked: false,
      },
      {
        name: 'sanitarios',
        checked: false,
      },
      {
        name: 'fontanería general',
        checked: false,
      },
    ]
  },
  {
    name: 'informática',
    icon: '/assets/icon/categories/computing.svg',
    color: '#80B9D2',
    checked: false,
    indeterminateState: false,
    collapsed: true,
    services: [
      {
        name: 'recuperación de datos',
        checked: false,
      },
      {
        name: 'reparaciones',
        checked: false,
      },
      {
        name: 'páginas web',
        checked: false,
      },
      {
        name: 'informática general',
        checked: false,
      },
    ]
  },
  {
    name: 'limpieza',
    icon: '/assets/icon/categories/cleaning.svg',
    color: '#FF7B7B',
    checked: false,
    indeterminateState: false,
    collapsed: true,
    services: [
      {
        name: 'alfombras',
        checked: false,
      },
      {
        name: 'cortinas',
        checked: false,
      },
      {
        name: 'muebles',
        checked: false,
      },
      {
        name: 'ventanas',
        checked: false,
      },
      {
        name: 'limpieza general',
        checked: false,
      },
    ]
  },
  {
    name: 'mascotas',
    icon: '/assets/icon/categories/pets.svg',
    color: '#A0A0A0',
    checked: false,
    indeterminateState: false,
    collapsed: true,
    services: [
      {
        name: 'guardería',
        checked: false,
      },
      {
        name: 'paseadores/as de perros',
        checked: false,
      },
      {
        name: 'mascotas general',
        checked: false,
      },
    ]
  },
  {
    name: 'mudanzas',
    icon: '/assets/icon/categories/removals.svg',
    color: '#CFA17D',
    checked: false,
    indeterminateState: false,
    collapsed: true,
    services: [
      {
        name: 'mudanzas internacionales',
        checked: false,
      },
      {
        name: 'mudanzas nacionales',
        checked: false,
      },
      {
        name: 'mudanza general',
        checked: false,
      },
    ]
  },
  {
    name: 'pintura',
    icon: '/assets/icon/categories/painter.svg',
    color: '#45B29C',
    checked: false,
    indeterminateState: false,
    collapsed: true,
    services: [
      {
        name: 'humedades',
        checked: false,
      },
      {
        name: 'pintura',
        checked: false,
      },
      {
        name: 'pintura general',
        checked: false,
      },
    ]
  },
];

export interface Category {
  name: string;
  icon: string;
  color: string;
  checked: boolean;
  indeterminateState: boolean;
  collapsed: boolean;
  services: Service[];
}

export interface Service {
  name: string;
  checked: boolean;
}