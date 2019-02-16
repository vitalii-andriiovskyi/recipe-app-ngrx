export interface Unit {
  value: string;
}

export interface UnitGroup {
  disabled?: boolean;
  name: string;
  units: Unit[];
}

export const unitGroups: UnitGroup[] = [
  {
    name: 'Volume',
    units: [
      { value: 'L' },
      { value: 'ml' }
    ]
  },
  {
    name: 'Spoons',
    units: [
      { value: 'Tablespoon(s)' },
      { value: 'Dessert spoon(s)' },
      { value: 'Teaspoon(s)' },
    ]
  },
  { 
    name: 'Weight' ,
    units: [
      { value: 'kg' },
      { value: 'g' },
      { value: 'lb' }
    ]
  },
  { 
    name: 'Others' ,
    units: [
      { value: 'piece(s)' },
      { value: 'unit(s)' },
    ]
  },
]