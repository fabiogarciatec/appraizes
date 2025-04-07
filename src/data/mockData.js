// Mock data for the application

// Users
export const users = [
  {
    id: 1,
    username: 'consultor1',
    password: 'senha123', // In a real app, this would be hashed
    name: 'João Silva',
    role: 'consultor',
    email: 'joao@example.com'
  },
  {
    id: 2,
    username: 'consultor2',
    password: 'senha123',
    name: 'Maria Oliveira',
    role: 'consultor',
    email: 'maria@example.com'
  },
  {
    id: 3,
    username: 'admin',
    password: 'admin123',
    name: 'Admin',
    role: 'admin',
    email: 'admin@example.com'
  }
];

// Clients
export const clients = [
  { id: 1, name: 'Construtora ABC', contact: 'Roberto', phone: '(11) 98765-4321', email: 'roberto@construtorabc.com' },
  { id: 2, name: 'Mineradora XYZ', contact: 'Carlos', phone: '(31) 97654-3210', email: 'carlos@mineradoraxyz.com' },
  { id: 3, name: 'Transportadora Rápida', contact: 'Ana', phone: '(21) 96543-2109', email: 'ana@transportadorarapida.com' }
];

// Machine Families
export const machineFamilies = [
  { id: 1, name: 'Escavadeiras' },
  { id: 2, name: 'Carregadeiras' },
  { id: 3, name: 'Tratores' },
  { id: 4, name: 'Motoniveladoras' },
  { id: 5, name: 'Retroescavadeiras' }
];

// Machine Models
export const machineModels = [
  { id: 1, name: 'EX200', familyId: 1 },
  { id: 2, name: 'EX300', familyId: 1 },
  { id: 3, name: 'WA320', familyId: 2 },
  { id: 4, name: 'WA420', familyId: 2 },
  { id: 5, name: 'D6', familyId: 3 },
  { id: 6, name: 'D8', familyId: 3 },
  { id: 7, name: '140H', familyId: 4 },
  { id: 8, name: '160M', familyId: 4 },
  { id: 9, name: '416F', familyId: 5 },
  { id: 10, name: '420F', familyId: 5 }
];

// Equipamentos (Máquinas dos clientes)
export const equipments = [
  { 
    id: 1, 
    chassis: 'EX200-12345', 
    series: 'Série 5', 
    modelId: 1, 
    familyId: 1, 
    year: 2018, 
    hourmeter: 3500, 
    clientId: 1 
  },
  { 
    id: 2, 
    chassis: 'WA320-54321', 
    series: 'Série 7', 
    modelId: 3, 
    familyId: 2, 
    year: 2020, 
    hourmeter: 1200, 
    clientId: 2 
  },
  { 
    id: 3, 
    chassis: 'D6-98765', 
    series: 'Série R', 
    modelId: 5, 
    familyId: 3, 
    year: 2019, 
    hourmeter: 2800, 
    clientId: 3 
  }
];

// Part Categories
export const partCategories = [
  { id: 1, name: 'Filtro' },
  { id: 2, name: 'Bomba' },
  { id: 3, name: 'Mangueira' },
  { id: 4, name: 'Motor' },
  { id: 5, name: 'Transmissão' },
  { id: 6, name: 'Sistema Hidráulico' },
  { id: 7, name: 'Sistema Elétrico' },
  { id: 8, name: 'Chassi' },
  { id: 9, name: 'Cabine' },
  { id: 10, name: 'Outros' }
];

// Official Parts
export const officialParts = [
  { 
    id: 1, 
    officialName: 'Filtro de Óleo Primário', 
    manufacturerRef: 'FO-1234', 
    categoryId: 1,
    description: 'Filtro de óleo para motor diesel, 10 microns',
    compatibleMachines: [
      { modelId: 1, startYear: 2015, endYear: 2022, startChassis: 'EX200-001', endChassis: 'EX200-500' },
      { modelId: 2, startYear: 2017, endYear: 2022, startChassis: 'EX300-001', endChassis: 'EX300-300' }
    ]
  },
  { 
    id: 2, 
    officialName: "Bomba D'água", 
    manufacturerRef: 'BD-5678', 
    categoryId: 2,
    description: "Bomba d'água para sistema de refrigeração",
    compatibleMachines: [
      { modelId: 1, startYear: 2015, endYear: 2022, startChassis: 'EX200-001', endChassis: 'EX200-500' },
      { modelId: 2, startYear: 2017, endYear: 2022, startChassis: 'EX300-001', endChassis: 'EX300-300' }
    ]
  },
  { 
    id: 3, 
    officialName: 'Mangueira Hidráulica de Alta Pressão', 
    manufacturerRef: 'MH-9012', 
    categoryId: 3,
    description: 'Mangueira para sistema hidráulico, 5000 PSI',
    compatibleMachines: [
      { modelId: 3, startYear: 2018, endYear: 2023, startChassis: 'WA320-100', endChassis: 'WA320-800' },
      { modelId: 4, startYear: 2018, endYear: 2023, startChassis: 'WA420-100', endChassis: 'WA420-600' }
    ]
  },
  { 
    id: 4, 
    officialName: 'Filtro de Ar', 
    manufacturerRef: 'FA-3456', 
    categoryId: 1,
    description: 'Filtro de ar para motor diesel',
    compatibleMachines: [
      { modelId: 5, startYear: 2016, endYear: 2023, startChassis: 'D6-001', endChassis: 'D6-700' },
      { modelId: 6, startYear: 2016, endYear: 2023, startChassis: 'D8-001', endChassis: 'D8-500' }
    ]
  },
  { 
    id: 5, 
    officialName: 'Bomba Hidráulica Principal', 
    manufacturerRef: 'BH-7890', 
    categoryId: 2,
    description: 'Bomba hidráulica principal para sistema de operação',
    compatibleMachines: [
      { modelId: 7, startYear: 2017, endYear: 2022, startChassis: '140H-001', endChassis: '140H-400' },
      { modelId: 8, startYear: 2019, endYear: 2023, startChassis: '160M-001', endChassis: '160M-300' }
    ]
  }
];

// Popular Names for Parts (the "dictionary")
export const popularNames = [
  { id: 1, popularName: 'Filtro do motor', officialPartId: 1 },
  { id: 2, popularName: 'Filtro de óleo', officialPartId: 1 },
  { id: 3, popularName: 'Bomba de água', officialPartId: 2 },
  { id: 4, popularName: 'Bomba do radiador', officialPartId: 2 },
  { id: 5, popularName: 'Mangueira de pressão', officialPartId: 3 },
  { id: 6, popularName: 'Mangueirão', officialPartId: 3 },
  { id: 7, popularName: 'Filtro de ar', officialPartId: 4 },
  { id: 8, popularName: 'Elemento do ar', officialPartId: 4 },
  { id: 9, popularName: 'Bomba principal', officialPartId: 5 },
  { id: 10, popularName: 'Bomba do sistema', officialPartId: 5 }
];

// Abastecimentos de Diesel
export const fuelRefills = [
  // Equipamento 1 - Escavadeira EX200-12345 (Janeiro 2025)
  {
    id: 1,
    equipmentSeries: 'EX200-12345',
    date: '2025-01-06',
    liters: 105,
    hourmeter: 2800,
    usedAdgreen: true,
    operatorName: 'Carlos Oliveira',
    operatorPhone: '(11) 98765-4321',
    equipmentId: 1
  },
  {
    id: 2,
    equipmentSeries: 'EX200-12345',
    date: '2025-01-13',
    liters: 110,
    hourmeter: 2840,
    usedAdgreen: true,
    operatorName: 'Carlos Oliveira',
    operatorPhone: '(11) 98765-4321',
    equipmentId: 1
  },
  {
    id: 3,
    equipmentSeries: 'EX200-12345',
    date: '2025-01-20',
    liters: 108,
    hourmeter: 2880,
    usedAdgreen: true,
    operatorName: 'Carlos Oliveira',
    operatorPhone: '(11) 98765-4321',
    equipmentId: 1
  },
  {
    id: 4,
    equipmentSeries: 'EX200-12345',
    date: '2025-01-27',
    liters: 112,
    hourmeter: 2920,
    usedAdgreen: true,
    operatorName: 'Carlos Oliveira',
    operatorPhone: '(11) 98765-4321',
    equipmentId: 1
  },
  
  // Equipamento 1 - Escavadeira EX200-12345 (Fevereiro 2025)
  {
    id: 5,
    equipmentSeries: 'EX200-12345',
    date: '2025-02-03',
    liters: 130,
    hourmeter: 2960,
    usedAdgreen: false,
    operatorName: 'Carlos Oliveira',
    operatorPhone: '(11) 98765-4321',
    equipmentId: 1
  },
  {
    id: 6,
    equipmentSeries: 'EX200-12345',
    date: '2025-02-10',
    liters: 132,
    hourmeter: 3000,
    usedAdgreen: false,
    operatorName: 'Carlos Oliveira',
    operatorPhone: '(11) 98765-4321',
    equipmentId: 1
  },
  {
    id: 7,
    equipmentSeries: 'EX200-12345',
    date: '2025-02-17',
    liters: 106,
    hourmeter: 3040,
    usedAdgreen: true,
    operatorName: 'Carlos Oliveira',
    operatorPhone: '(11) 98765-4321',
    equipmentId: 1
  },
  {
    id: 8,
    equipmentSeries: 'EX200-12345',
    date: '2025-02-24',
    liters: 107,
    hourmeter: 3080,
    usedAdgreen: true,
    operatorName: 'Carlos Oliveira',
    operatorPhone: '(11) 98765-4321',
    equipmentId: 1
  },
  
  // Equipamento 1 - Escavadeira EX200-12345 (Março 2025)
  {
    id: 9,
    equipmentSeries: 'EX200-12345',
    date: '2025-03-03',
    liters: 109,
    hourmeter: 3120,
    usedAdgreen: true,
    operatorName: 'Carlos Oliveira',
    operatorPhone: '(11) 98765-4321',
    equipmentId: 1
  },
  {
    id: 10,
    equipmentSeries: 'EX200-12345',
    date: '2025-03-10',
    liters: 105,
    hourmeter: 3160,
    usedAdgreen: true,
    operatorName: 'Carlos Oliveira',
    operatorPhone: '(11) 98765-4321',
    equipmentId: 1
  },
  {
    id: 11,
    equipmentSeries: 'EX200-12345',
    date: '2025-03-17',
    liters: 128,
    hourmeter: 3200,
    usedAdgreen: false,
    operatorName: 'Carlos Oliveira',
    operatorPhone: '(11) 98765-4321',
    equipmentId: 1
  },
  {
    id: 12,
    equipmentSeries: 'EX200-12345',
    date: '2025-03-24',
    liters: 130,
    hourmeter: 3240,
    usedAdgreen: false,
    operatorName: 'Carlos Oliveira',
    operatorPhone: '(11) 98765-4321',
    equipmentId: 1
  },
  {
    id: 13,
    equipmentSeries: 'EX200-12345',
    date: '2025-03-31',
    liters: 104,
    hourmeter: 3280,
    usedAdgreen: true,
    operatorName: 'Carlos Oliveira',
    operatorPhone: '(11) 98765-4321',
    equipmentId: 1
  },
  
  // Equipamento 2 - Carregadeira WA320-54321 (Janeiro 2025)
  {
    id: 14,
    equipmentSeries: 'WA320-54321',
    date: '2025-01-07',
    liters: 78,
    hourmeter: 800,
    usedAdgreen: true,
    operatorName: 'Marcos Santos',
    operatorPhone: '(31) 97654-3210',
    equipmentId: 2
  },
  {
    id: 15,
    equipmentSeries: 'WA320-54321',
    date: '2025-01-14',
    liters: 80,
    hourmeter: 840,
    usedAdgreen: true,
    operatorName: 'Marcos Santos',
    operatorPhone: '(31) 97654-3210',
    equipmentId: 2
  },
  {
    id: 16,
    equipmentSeries: 'WA320-54321',
    date: '2025-01-21',
    liters: 76,
    hourmeter: 880,
    usedAdgreen: true,
    operatorName: 'Marcos Santos',
    operatorPhone: '(31) 97654-3210',
    equipmentId: 2
  },
  {
    id: 17,
    equipmentSeries: 'WA320-54321',
    date: '2025-01-28',
    liters: 75,
    hourmeter: 920,
    usedAdgreen: true,
    operatorName: 'Marcos Santos',
    operatorPhone: '(31) 97654-3210',
    equipmentId: 2
  },
  
  // Equipamento 2 - Carregadeira WA320-54321 (Fevereiro 2025)
  {
    id: 18,
    equipmentSeries: 'WA320-54321',
    date: '2025-02-04',
    liters: 95,
    hourmeter: 960,
    usedAdgreen: false,
    operatorName: 'Marcos Santos',
    operatorPhone: '(31) 97654-3210',
    equipmentId: 2
  },
  {
    id: 19,
    equipmentSeries: 'WA320-54321',
    date: '2025-02-11',
    liters: 97,
    hourmeter: 1000,
    usedAdgreen: false,
    operatorName: 'Marcos Santos',
    operatorPhone: '(31) 97654-3210',
    equipmentId: 2
  },
  {
    id: 20,
    equipmentSeries: 'WA320-54321',
    date: '2025-02-18',
    liters: 98,
    hourmeter: 1040,
    usedAdgreen: false,
    operatorName: 'Marcos Santos',
    operatorPhone: '(31) 97654-3210',
    equipmentId: 2
  },
  {
    id: 21,
    equipmentSeries: 'WA320-54321',
    date: '2025-02-25',
    liters: 77,
    hourmeter: 1080,
    usedAdgreen: true,
    operatorName: 'Marcos Santos',
    operatorPhone: '(31) 97654-3210',
    equipmentId: 2
  },
  
  // Equipamento 2 - Carregadeira WA320-54321 (Março 2025)
  {
    id: 22,
    equipmentSeries: 'WA320-54321',
    date: '2025-03-04',
    liters: 79,
    hourmeter: 1120,
    usedAdgreen: true,
    operatorName: 'Marcos Santos',
    operatorPhone: '(31) 97654-3210',
    equipmentId: 2
  },
  {
    id: 23,
    equipmentSeries: 'WA320-54321',
    date: '2025-03-11',
    liters: 78,
    hourmeter: 1160,
    usedAdgreen: true,
    operatorName: 'Marcos Santos',
    operatorPhone: '(31) 97654-3210',
    equipmentId: 2
  },
  {
    id: 24,
    equipmentSeries: 'WA320-54321',
    date: '2025-03-18',
    liters: 96,
    hourmeter: 1200,
    usedAdgreen: false,
    operatorName: 'Marcos Santos',
    operatorPhone: '(31) 97654-3210',
    equipmentId: 2
  },
  {
    id: 25,
    equipmentSeries: 'WA320-54321',
    date: '2025-03-25',
    liters: 95,
    hourmeter: 1240,
    usedAdgreen: false,
    operatorName: 'Marcos Santos',
    operatorPhone: '(31) 97654-3210',
    equipmentId: 2
  },
  
  // Equipamento 3 - Trator D6-98765 (Janeiro 2025)
  {
    id: 26,
    equipmentSeries: 'D6-98765',
    date: '2025-01-08',
    liters: 165,
    hourmeter: 2200,
    usedAdgreen: true,
    operatorName: 'Roberto Almeida',
    operatorPhone: '(21) 96543-2109',
    equipmentId: 3
  },
  {
    id: 27,
    equipmentSeries: 'D6-98765',
    date: '2025-01-15',
    liters: 168,
    hourmeter: 2250,
    usedAdgreen: true,
    operatorName: 'Roberto Almeida',
    operatorPhone: '(21) 96543-2109',
    equipmentId: 3
  },
  {
    id: 28,
    equipmentSeries: 'D6-98765',
    date: '2025-01-22',
    liters: 162,
    hourmeter: 2300,
    usedAdgreen: true,
    operatorName: 'Roberto Almeida',
    operatorPhone: '(21) 96543-2109',
    equipmentId: 3
  },
  {
    id: 29,
    equipmentSeries: 'D6-98765',
    date: '2025-01-29',
    liters: 170,
    hourmeter: 2350,
    usedAdgreen: true,
    operatorName: 'Roberto Almeida',
    operatorPhone: '(21) 96543-2109',
    equipmentId: 3
  },
  
  // Equipamento 3 - Trator D6-98765 (Fevereiro 2025)
  {
    id: 30,
    equipmentSeries: 'D6-98765',
    date: '2025-02-05',
    liters: 240,
    hourmeter: 2400,
    usedAdgreen: false,
    operatorName: 'Roberto Almeida',
    operatorPhone: '(21) 96543-2109',
    equipmentId: 3
  },
  {
    id: 31,
    equipmentSeries: 'D6-98765',
    date: '2025-02-12',
    liters: 245,
    hourmeter: 2450,
    usedAdgreen: false,
    operatorName: 'Roberto Almeida',
    operatorPhone: '(21) 96543-2109',
    equipmentId: 3
  },
  {
    id: 32,
    equipmentSeries: 'D6-98765',
    date: '2025-02-19',
    liters: 238,
    hourmeter: 2500,
    usedAdgreen: false,
    operatorName: 'Roberto Almeida',
    operatorPhone: '(21) 96543-2109',
    equipmentId: 3
  },
  {
    id: 33,
    equipmentSeries: 'D6-98765',
    date: '2025-02-26',
    liters: 242,
    hourmeter: 2550,
    usedAdgreen: false,
    operatorName: 'Roberto Almeida',
    operatorPhone: '(21) 96543-2109',
    equipmentId: 3
  },
  
  // Equipamento 3 - Trator D6-98765 (Março 2025)
  {
    id: 34,
    equipmentSeries: 'D6-98765',
    date: '2025-03-05',
    liters: 166,
    hourmeter: 2600,
    usedAdgreen: true,
    operatorName: 'Roberto Almeida',
    operatorPhone: '(21) 96543-2109',
    equipmentId: 3
  },
  {
    id: 35,
    equipmentSeries: 'D6-98765',
    date: '2025-03-12',
    liters: 164,
    hourmeter: 2650,
    usedAdgreen: true,
    operatorName: 'Roberto Almeida',
    operatorPhone: '(21) 96543-2109',
    equipmentId: 3
  },
  {
    id: 36,
    equipmentSeries: 'D6-98765',
    date: '2025-03-19',
    liters: 168,
    hourmeter: 2700,
    usedAdgreen: true,
    operatorName: 'Roberto Almeida',
    operatorPhone: '(21) 96543-2109',
    equipmentId: 3
  },
  {
    id: 37,
    equipmentSeries: 'D6-98765',
    date: '2025-03-26',
    liters: 235,
    hourmeter: 2750,
    usedAdgreen: false,
    operatorName: 'Roberto Almeida',
    operatorPhone: '(21) 96543-2109',
    equipmentId: 3
  }
];

// Quote Requests
export const quoteRequests = [
  {
    id: 1,
    clientId: 1,
    consultantId: 1,
    date: '2025-03-15',
    status: 'identified', // pending, identified, quoted, completed
    popularPartName: 'Filtro do motor',
    machineInfo: {
      model: 'EX200',
      series: 'Série 5',
      chassis: 'EX200-123',
      year: 2018,
      family: 'Escavadeiras'
    },
    observations: 'Cliente precisa com urgência, máquina parada.',
    identifiedPartId: 1
  },
  {
    id: 2,
    clientId: 2,
    consultantId: 1,
    date: '2025-03-18',
    status: 'pending',
    popularPartName: 'Mangueira do braço',
    machineInfo: {
      model: 'WA320',
      series: 'Série 7',
      chassis: 'WA320-456',
      year: 2020,
      family: 'Carregadeiras'
    },
    observations: 'Vazamento de óleo na mangueira.',
    identifiedPartId: null
  },
  {
    id: 3,
    clientId: 3,
    consultantId: 2,
    date: '2025-03-20',
    status: 'identified',
    popularPartName: "Bomba d'água",
    machineInfo: {
      model: 'D6',
      series: 'Série R',
      chassis: 'D6-789',
      year: 2019,
      family: 'Tratores'
    },
    observations: 'Superaquecimento do motor.',
    identifiedPartId: 2
  }
];
