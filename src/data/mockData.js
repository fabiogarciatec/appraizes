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
