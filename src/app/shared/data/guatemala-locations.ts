export interface Departamento {
  name: string;
  municipios: string[];
}

export const DEFAULT_DEPARTAMENTO = 'Quiché';
export const DEFAULT_MUNICIPIO   = 'Santa Cruz del Quiché';

export const DEPARTAMENTOS_GUATEMALA: Departamento[] = [
  {
    name: 'Alta Verapaz',
    municipios: [
      'Cobán', 'Cahabón', 'Chahal', 'Chisec', 'Fray Bartolomé de las Casas',
      'Lanquín', 'Panzós', 'Raxruhá', 'Senahú', 'San Cristóbal Verapaz',
      'San Juan Chamelco', 'San Pedro Carchá', 'Santa Catalina La Tinta',
      'Santa Cruz Verapaz', 'Tactic', 'Tamahú', 'Tucurú',
    ],
  },
  {
    name: 'Baja Verapaz',
    municipios: [
      'Salamá', 'Cubulco', 'El Chol', 'Granados', 'Purulhá',
      'Rabinal', 'San Jerónimo', 'San Miguel Chicaj',
    ],
  },
  {
    name: 'Chimaltenango',
    municipios: [
      'Chimaltenango', 'Acatenango', 'El Tejar', 'Parramos', 'Patzicía',
      'Patzún', 'Pochuta', 'San Andrés Itzapa', 'San José Poaquil',
      'San Juan Comalapa', 'San Martín Jilotepeque', 'Santa Apolonia',
      'Santa Cruz Balanyá', 'Tecpán Guatemala', 'Yepocapa', 'Zaragoza',
    ],
  },
  {
    name: 'Chiquimula',
    municipios: [
      'Chiquimula', 'Camotán', 'Concepción Las Minas', 'Esquipulas',
      'Ipala', 'Jocotán', 'Olopa', 'Quezaltepeque',
      'San Jacinto', 'San José La Arada', 'San Juan Ermita',
    ],
  },
  {
    name: 'El Progreso',
    municipios: [
      'Guastatoya', 'El Jícaro', 'Morazán', 'San Agustín Acasaguastlán',
      'San Antonio La Paz', 'San Cristóbal Acasaguastlán', 'Sanarate', 'Sansare',
    ],
  },
  {
    name: 'Escuintla',
    municipios: [
      'Escuintla', 'Guanagazapa', 'Iztapa', 'La Democracia', 'La Gomera',
      'Masagua', 'Nueva Concepción', 'Palín', 'San José',
      'San Vicente Pacaya', 'Santa Lucía Cotzumalguapa', 'Siquinalá', 'Tiquisate',
    ],
  },
  {
    name: 'Guatemala',
    municipios: [
      'Guatemala', 'Amatitlán', 'Chinautla', 'Chuarrancho', 'Fraijanes',
      'Mixco', 'Palencia', 'San José del Golfo', 'San José Pinula',
      'San Juan Sacatepéquez', 'San Miguel Petapa', 'San Pedro Ayampuc',
      'San Pedro Sacatepéquez', 'San Raimundo', 'Santa Catarina Pinula',
      'Villa Canales', 'Villa Nueva',
    ],
  },
  {
    name: 'Huehuetenango',
    municipios: [
      'Huehuetenango', 'Aguacatán', 'Barillas', 'Chiantla', 'Colotenango',
      'Concepción Huista', 'Cuilco', 'Jacaltenango', 'La Democracia',
      'La Libertad', 'Malacatancito', 'Nentón', 'San Antonio Huista',
      'San Gaspar Ixchil', 'San Ildefonso Ixtahuacán', 'San Juan Atitán',
      'San Juan Ixcoy', 'San Marcos Huista', 'San Mateo Ixtatán',
      'San Miguel Acatán', 'San Pedro Necta', 'San Rafael La Independencia',
      'San Rafael Petzal', 'San Sebastián Coatán', 'San Sebastián Huehuetenango',
      'Santa Ana Huista', 'Santa Bárbara', 'Santa Eulalia',
      'Santiago Chimaltenango', 'Tectitán', 'Todos Santos Cuchumatán',
      'Unión Cantinil',
    ],
  },
  {
    name: 'Izabal',
    municipios: [
      'Puerto Barrios', 'El Estor', 'Livingston', 'Los Amates', 'Morales',
    ],
  },
  {
    name: 'Jalapa',
    municipios: [
      'Jalapa', 'Mataquescuintla', 'Monjas', 'San Carlos Alzatate',
      'San Luis Jilotepeque', 'San Manuel Chaparrón', 'San Pedro Pinula',
    ],
  },
  {
    name: 'Jutiapa',
    municipios: [
      'Jutiapa', 'Agua Blanca', 'Asunción Mita', 'Atescatempa', 'Comapa',
      'Conguaco', 'El Adelanto', 'El Progreso', 'Jalpatagua', 'Jerez',
      'Moyuta', 'Pasaco', 'Quesada', 'San José Acatempa',
      'Santa Catarina Mita', 'Yupiltepeque', 'Zapotitlán',
    ],
  },
  {
    name: 'Petén',
    municipios: [
      'Flores', 'Dolores', 'El Chal', 'La Libertad', 'Las Cruces',
      'Melchor de Mencos', 'Poptún', 'San Andrés', 'San Benito',
      'San Francisco', 'San José', 'San Luis', 'Santa Ana', 'Sayaxché',
    ],
  },
  {
    name: 'Quetzaltenango',
    municipios: [
      'Quetzaltenango', 'Almolonga', 'Cabricán', 'Cajolá', 'Cantel',
      'Coatepeque', 'Colomba', 'Concepción Chiquirichapa', 'El Palmar',
      'Flores Costa Cuca', 'Génova', 'Huitán', 'La Esperanza', 'Olintepeque',
      'Palestina de Los Altos', 'Salcajá', 'San Carlos Sija',
      'San Francisco La Unión', 'San Juan Ostuncalco',
      'San Marcos Sacatepéquez', 'San Martín Sacatepéquez',
      'San Mateo', 'San Miguel Sigüilá', 'Sibilia', 'Zunil',
    ],
  },
  {
    name: 'Quiché',
    municipios: [
      'Santa Cruz del Quiché', 'Canillá', 'Chajul', 'Chicamán', 'Chiché',
      'Chichicastenango', 'Chinique', 'Cunén', 'Ixcán', 'Joyabaj', 'Nebaj',
      'Pachalum', 'Patzité', 'Sacapulas', 'San Andrés Sajcabajá',
      'San Antonio Ilotenango', 'San Bartolomé Jocotenango', 'San Juan Cotzal',
      'San Pedro Jocopilas', 'Uspantán', 'Zacualpa',
    ],
  },
  {
    name: 'Retalhuleu',
    municipios: [
      'Retalhuleu', 'Champerico', 'El Asintal', 'Nuevo San Carlos',
      'San Andrés Villa Seca', 'San Felipe', 'San Martín Zapotitlán',
      'San Sebastián', 'Santa Cruz Muluá',
    ],
  },
  {
    name: 'Sacatepéquez',
    municipios: [
      'Antigua Guatemala', 'Alotenango', 'Ciudad Vieja', 'Jocotenango',
      'Magdalena Milpas Altas', 'Pastores', 'San Antonio Aguas Calientes',
      'San Bartolomé Milpas Altas', 'San Lucas Sacatepéquez', 'San Miguel Dueñas',
      'Santa Catarina Barahona', 'Santa Lucía Milpas Altas', 'Santa María de Jesús',
      'Santiago Sacatepéquez', 'Santo Domingo Xenacoj', 'Sumpango',
    ],
  },
  {
    name: 'San Marcos',
    municipios: [
      'San Marcos', 'Ayutla', 'Catarina', 'Comitancillo', 'Concepción Tutuapa',
      'El Quetzal', 'El Rodeo', 'El Tumbador', 'Esquipulas Palo Gordo',
      'Ixchiguán', 'La Blanca', 'La Reforma', 'Malacatán', 'Nuevo Progreso',
      'Ocós', 'Pajapita', 'Río Blanco', 'San Antonio Sacatepéquez',
      'San Cristóbal Cucho', 'San José Ojetenam',
      'San Lorenzo', 'San Miguel Ixtahuacán', 'San Pablo',
      'San Pedro Sacatepéquez', 'San Rafael Pie de la Cuesta',
      'Sibinal', 'Sipacapa', 'Tacaná', 'Tajumulco', 'Tejutla',
    ],
  },
  {
    name: 'Santa Rosa',
    municipios: [
      'Cuilapa', 'Barberena', 'Casillas', 'Chiquimulilla', 'Guazacapán',
      'Nueva Santa Rosa', 'Oratorio', 'Pueblo Nuevo Viñas', 'San Juan Tecuaco',
      'San Rafael Las Flores', 'Santa Cruz Naranjo', 'Santa María Ixhuatán',
      'Santa Rosa de Lima', 'Taxisco',
    ],
  },
  {
    name: 'Sololá',
    municipios: [
      'Sololá', 'Concepción', 'Nahualá', 'Panajachel', 'San Andrés Semetabaj',
      'San Antonio Palopó', 'San José Chacayá', 'San Juan La Laguna',
      'San Lucas Tolimán', 'San Marcos La Laguna', 'San Pablo La Laguna',
      'San Pedro La Laguna', 'Santa Catarina Ixtahuacán', 'Santa Catarina Palopó',
      'Santa Clara La Laguna', 'Santa Cruz La Laguna', 'Santa Lucía Utatlán',
      'Santa María Visitación', 'Santiago Atitlán',
    ],
  },
  {
    name: 'Suchitepéquez',
    municipios: [
      'Mazatenango', 'Chicacao', 'Cuyotenango', 'Patulul', 'Pueblo Nuevo',
      'Río Bravo', 'Samayac', 'San Antonio Suchitepéquez', 'San Bernardino',
      'San Francisco Zapotitlán', 'San Gabriel', 'San José El Ídolo',
      'San Juan Bautista', 'San Lorenzo', 'San Miguel Panán',
      'San Pablo Jocopilas', 'Santa Bárbara', 'Santo Domingo Suchitepéquez',
      'Santo Tomás La Unión', 'Zunilito',
    ],
  },
  {
    name: 'Totonicapán',
    municipios: [
      'Totonicapán', 'Momostenango', 'San Andrés Xecul',
      'San Bartolo Aguas Calientes', 'San Cristóbal Totonicapán',
      'San Francisco El Alto', 'Santa Lucía La Reforma', 'Santa María Chiquimula',
    ],
  },
  {
    name: 'Zacapa',
    municipios: [
      'Zacapa', 'Cabañas', 'Estanzuela', 'Gualán', 'Huité',
      'La Unión', 'Río Hondo', 'San Diego', 'San Jorge',
      'Teculután', 'Usumatlán',
    ],
  },
];

export function getMunicipios(departamento: string): string[] {
  return DEPARTAMENTOS_GUATEMALA.find(d => d.name === departamento)?.municipios ?? [];
}
