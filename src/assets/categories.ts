export const Categories: Category[] = [
  {
    name: 'carpintería',
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
    name: 'carpintería',
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
    name: 'mudanzas',
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
  checked: boolean;
  indeterminateState: boolean;
  collapsed: boolean;
  services: Service[];
}

export interface Service {
  name: string;
  checked: boolean;
}