import {
  Program,
  Activity,
  BudgetItem,
  MonthlyExecution,
  AuditLog
} from '../../features/pat/models/pat.models';

// ============================================
// DATOS MOCK - PLAN ANUAL DE TRABAJO 2025
// CÁMARA DE COMERCIO
// ============================================

export const MOCK_PROGRAMS: Program[] = [
  {
    id: 1,
    codigo: 'PRG-001',
    nombre: 'Fortalecimiento Empresarial MIPYMES',
    area: 'Desarrollo Empresarial',
    responsable: 'María García López',
    estado: 'EJECUCION',
    objetivoEstrategico: 'Fortalecer las capacidades competitivas de las MIPYMES del territorio',
    pilar: 'Competitividad Empresarial',
    beneficiarios: 'Micro, pequeñas y medianas empresas de la jurisdicción',
    vigencia: 2025
  },
  {
    id: 2,
    codigo: 'PRG-002',
    nombre: 'Formalización y Registro Mercantil',
    area: 'Registros Públicos',
    responsable: 'Carlos Martínez Ruiz',
    estado: 'EJECUCION',
    objetivoEstrategico: 'Promover la formalización empresarial y el registro mercantil en la jurisdicción',
    pilar: 'Formalización',
    beneficiarios: 'Empresarios formales e informales',
    vigencia: 2025
  },
  {
    id: 3,
    codigo: 'PRG-003',
    nombre: 'Internacionalización Empresarial',
    area: 'Comercio Exterior',
    responsable: 'Ana Rodríguez Pérez',
    estado: 'APROBADO',
    objetivoEstrategico: 'Facilitar el acceso de empresas locales a mercados internacionales',
    pilar: 'Internacionalización',
    beneficiarios: 'Empresas exportadoras y con potencial exportador',
    vigencia: 2025
  },
  {
    id: 4,
    codigo: 'PRG-004',
    nombre: 'Transformación Digital Empresarial',
    area: 'Innovación',
    responsable: 'Luis Fernando Gómez',
    estado: 'EJECUCION',
    objetivoEstrategico: 'Acelerar la adopción de tecnologías digitales en el sector empresarial',
    pilar: 'Innovación y Tecnología',
    beneficiarios: 'Empresas de todos los tamaños',
    vigencia: 2025
  },
  {
    id: 5,
    codigo: 'PRG-005',
    nombre: 'Emprendimiento e Innovación',
    area: 'Desarrollo Empresarial',
    responsable: 'Patricia Sánchez Mora',
    estado: 'BORRADOR',
    objetivoEstrategico: 'Fomentar la creación de nuevas empresas innovadoras',
    pilar: 'Emprendimiento',
    beneficiarios: 'Emprendedores y startups',
    vigencia: 2025
  },
  {
    id: 6,
    codigo: 'PRG-006',
    nombre: 'Sostenibilidad y Economía Circular',
    area: 'Responsabilidad Social',
    responsable: 'Roberto Hernández Villa',
    estado: 'CERRADO',
    objetivoEstrategico: 'Promover prácticas empresariales sostenibles',
    pilar: 'Sostenibilidad',
    beneficiarios: 'Empresas comprometidas con la sostenibilidad',
    vigencia: 2025
  }
];

export const MOCK_ACTIVITIES: Activity[] = [
  // Programa 1: Fortalecimiento Empresarial
  {
    id: 1,
    programId: 1,
    nombre: 'Capacitaciones en gestión empresarial',
    unidadMedida: 'Empresas capacitadas',
    metaTotal: 500,
    descripcion: 'Formación en temas de gestión, finanzas y marketing'
  },
  {
    id: 2,
    programId: 1,
    nombre: 'Asesorías personalizadas a empresarios',
    unidadMedida: 'Asesorías realizadas',
    metaTotal: 300,
    descripcion: 'Consultoría especializada individual'
  },
  {
    id: 3,
    programId: 1,
    nombre: 'Ruedas de negocios locales',
    unidadMedida: 'Eventos realizados',
    metaTotal: 12,
    descripcion: 'Eventos de networking y oportunidades comerciales'
  },
  {
    id: 4,
    programId: 1,
    nombre: 'Diagnósticos empresariales',
    unidadMedida: 'Diagnósticos completados',
    metaTotal: 200,
    descripcion: 'Evaluación integral del estado empresarial'
  },

  // Programa 2: Formalización
  {
    id: 5,
    programId: 2,
    nombre: 'Jornadas de formalización gratuita',
    unidadMedida: 'Empresas formalizadas',
    metaTotal: 1000,
    descripcion: 'Eventos de registro y formalización masiva'
  },
  {
    id: 6,
    programId: 2,
    nombre: 'Campañas de sensibilización',
    unidadMedida: 'Personas alcanzadas',
    metaTotal: 5000,
    descripcion: 'Comunicación sobre beneficios de la formalidad'
  },
  {
    id: 7,
    programId: 2,
    nombre: 'Renovaciones asistidas de matrícula',
    unidadMedida: 'Renovaciones asistidas',
    metaTotal: 800,
    descripcion: 'Apoyo en el proceso de renovación mercantil'
  },

  // Programa 3: Internacionalización
  {
    id: 8,
    programId: 3,
    nombre: 'Misiones comerciales internacionales',
    unidadMedida: 'Empresas participantes',
    metaTotal: 50,
    descripcion: 'Participación en ferias y eventos internacionales'
  },
  {
    id: 9,
    programId: 3,
    nombre: 'Capacitación en comercio exterior',
    unidadMedida: 'Empresarios capacitados',
    metaTotal: 150,
    descripcion: 'Formación en exportaciones e importaciones'
  },

  // Programa 4: Transformación Digital
  {
    id: 10,
    programId: 4,
    nombre: 'Talleres de marketing digital',
    unidadMedida: 'Empresas capacitadas',
    metaTotal: 400,
    descripcion: 'Formación en redes sociales y comercio electrónico'
  },
  {
    id: 11,
    programId: 4,
    nombre: 'Implementación de herramientas digitales',
    unidadMedida: 'Empresas acompañadas',
    metaTotal: 150,
    descripcion: 'Acompañamiento en adopción tecnológica'
  },
  {
    id: 12,
    programId: 4,
    nombre: 'Diagnóstico de madurez digital',
    unidadMedida: 'Diagnósticos realizados',
    metaTotal: 250,
    descripcion: 'Evaluación del nivel de digitalización'
  },

  // Programa 5: Emprendimiento
  {
    id: 13,
    programId: 5,
    nombre: 'Programa de incubación',
    unidadMedida: 'Emprendimientos incubados',
    metaTotal: 30,
    descripcion: 'Acompañamiento a emprendimientos en etapa temprana'
  },
  {
    id: 14,
    programId: 5,
    nombre: 'Concurso de capital semilla',
    unidadMedida: 'Proyectos financiados',
    metaTotal: 10,
    descripcion: 'Financiamiento para emprendimientos innovadores'
  },

  // Programa 6: Sostenibilidad
  {
    id: 15,
    programId: 6,
    nombre: 'Certificaciones ambientales',
    unidadMedida: 'Empresas certificadas',
    metaTotal: 25,
    descripcion: 'Apoyo en obtención de certificaciones verdes'
  },
  {
    id: 16,
    programId: 6,
    nombre: 'Talleres de economía circular',
    unidadMedida: 'Empresas participantes',
    metaTotal: 100,
    descripcion: 'Formación en prácticas circulares'
  }
];

export const MOCK_BUDGET_ITEMS: BudgetItem[] = [
  // Actividad 1: Capacitaciones
  { id: 1, activityId: 1, rubro: 'Honorarios facilitadores', planeado: 45000000, ejecutado: 32000000 },
  { id: 2, activityId: 1, rubro: 'Material didáctico', planeado: 8000000, ejecutado: 5500000 },
  { id: 3, activityId: 1, rubro: 'Refrigerios y logística', planeado: 12000000, ejecutado: 8200000 },
  
  // Actividad 2: Asesorías
  { id: 4, activityId: 2, rubro: 'Honorarios consultores', planeado: 60000000, ejecutado: 42000000 },
  { id: 5, activityId: 2, rubro: 'Transporte y viáticos', planeado: 5000000, ejecutado: 3200000 },
  
  // Actividad 3: Ruedas de negocios
  { id: 6, activityId: 3, rubro: 'Alquiler de espacios', planeado: 18000000, ejecutado: 12000000 },
  { id: 7, activityId: 3, rubro: 'Publicidad y promoción', planeado: 8000000, ejecutado: 5000000 },
  { id: 8, activityId: 3, rubro: 'Catering', planeado: 15000000, ejecutado: 10000000 },
  
  // Actividad 4: Diagnósticos
  { id: 9, activityId: 4, rubro: 'Herramientas de diagnóstico', planeado: 12000000, ejecutado: 8000000 },
  { id: 10, activityId: 4, rubro: 'Consultores especializados', planeado: 25000000, ejecutado: 16000000 },
  
  // Actividad 5: Formalización
  { id: 11, activityId: 5, rubro: 'Jornadas de formalización', planeado: 30000000, ejecutado: 22000000 },
  { id: 12, activityId: 5, rubro: 'Material promocional', planeado: 5000000, ejecutado: 4000000 },
  
  // Actividad 6: Campañas
  { id: 13, activityId: 6, rubro: 'Publicidad medios', planeado: 40000000, ejecutado: 28000000 },
  { id: 14, activityId: 6, rubro: 'Redes sociales', planeado: 15000000, ejecutado: 12000000 },
  
  // Actividad 7: Renovaciones
  { id: 15, activityId: 7, rubro: 'Personal de apoyo', planeado: 20000000, ejecutado: 14000000 },
  
  // Actividad 8: Misiones comerciales
  { id: 16, activityId: 8, rubro: 'Tiquetes aéreos', planeado: 80000000, ejecutado: 0 },
  { id: 17, activityId: 8, rubro: 'Alojamiento', planeado: 35000000, ejecutado: 0 },
  { id: 18, activityId: 8, rubro: 'Inscripciones ferias', planeado: 25000000, ejecutado: 0 },
  
  // Actividad 9: Capacitación comercio exterior
  { id: 19, activityId: 9, rubro: 'Expertos internacionales', planeado: 50000000, ejecutado: 0 },
  { id: 20, activityId: 9, rubro: 'Material especializado', planeado: 10000000, ejecutado: 0 },
  
  // Actividad 10: Marketing digital
  { id: 21, activityId: 10, rubro: 'Instructores digitales', planeado: 35000000, ejecutado: 24000000 },
  { id: 22, activityId: 10, rubro: 'Plataformas y software', planeado: 8000000, ejecutado: 6000000 },
  
  // Actividad 11: Herramientas digitales
  { id: 23, activityId: 11, rubro: 'Licencias de software', planeado: 45000000, ejecutado: 28000000 },
  { id: 24, activityId: 11, rubro: 'Consultores TI', planeado: 30000000, ejecutado: 18000000 },
  
  // Actividad 12: Diagnóstico digital
  { id: 25, activityId: 12, rubro: 'Herramientas de evaluación', planeado: 15000000, ejecutado: 10000000 },
  
  // Actividad 13: Incubación
  { id: 26, activityId: 13, rubro: 'Mentores', planeado: 40000000, ejecutado: 0 },
  { id: 27, activityId: 13, rubro: 'Espacio coworking', planeado: 20000000, ejecutado: 0 },
  
  // Actividad 14: Capital semilla
  { id: 28, activityId: 14, rubro: 'Fondo capital semilla', planeado: 100000000, ejecutado: 0 },
  
  // Actividad 15: Certificaciones
  { id: 29, activityId: 15, rubro: 'Consultores ambientales', planeado: 25000000, ejecutado: 25000000 },
  { id: 30, activityId: 15, rubro: 'Costos de certificación', planeado: 15000000, ejecutado: 15000000 },
  
  // Actividad 16: Economía circular
  { id: 31, activityId: 16, rubro: 'Facilitadores', planeado: 18000000, ejecutado: 18000000 },
  { id: 32, activityId: 16, rubro: 'Material educativo', planeado: 5000000, ejecutado: 5000000 }
];

export const MOCK_MONTHLY_EXECUTIONS: MonthlyExecution[] = [
  // Actividad 1: Capacitaciones (meta: 500)
  { id: 1, activityId: 1, mes: 1, metaEjecutada: 45, valorEjecutado: 5200000, observaciones: 'Inicio del programa' },
  { id: 2, activityId: 1, mes: 2, metaEjecutada: 52, valorEjecutado: 5800000, observaciones: 'Buena participación' },
  { id: 3, activityId: 1, mes: 3, metaEjecutada: 48, valorEjecutado: 5500000, observaciones: 'Se realizaron 4 talleres' },
  { id: 4, activityId: 1, mes: 4, metaEjecutada: 55, valorEjecutado: 6200000 },
  { id: 5, activityId: 1, mes: 5, metaEjecutada: 60, valorEjecutado: 6500000, observaciones: 'Mes con mayor participación' },
  { id: 6, activityId: 1, mes: 6, metaEjecutada: 50, valorEjecutado: 5600000 },
  { id: 7, activityId: 1, mes: 7, metaEjecutada: 45, valorEjecutado: 5100000, observaciones: 'Vacaciones afectaron asistencia' },
  { id: 8, activityId: 1, mes: 8, metaEjecutada: 48, valorEjecutado: 5800000 },
  
  // Actividad 2: Asesorías (meta: 300)
  { id: 9, activityId: 2, mes: 1, metaEjecutada: 25, valorEjecutado: 3800000 },
  { id: 10, activityId: 2, mes: 2, metaEjecutada: 28, valorEjecutado: 4200000 },
  { id: 11, activityId: 2, mes: 3, metaEjecutada: 30, valorEjecutado: 4500000 },
  { id: 12, activityId: 2, mes: 4, metaEjecutada: 32, valorEjecutado: 4800000 },
  { id: 13, activityId: 2, mes: 5, metaEjecutada: 28, valorEjecutado: 4200000 },
  { id: 14, activityId: 2, mes: 6, metaEjecutada: 25, valorEjecutado: 3800000 },
  { id: 15, activityId: 2, mes: 7, metaEjecutada: 22, valorEjecutado: 3300000 },
  { id: 16, activityId: 2, mes: 8, metaEjecutada: 30, valorEjecutado: 4500000 },
  
  // Actividad 3: Ruedas de negocios (meta: 12)
  { id: 17, activityId: 3, mes: 2, metaEjecutada: 1, valorEjecutado: 2500000, observaciones: 'Primera rueda del año' },
  { id: 18, activityId: 3, mes: 4, metaEjecutada: 1, valorEjecutado: 2300000 },
  { id: 19, activityId: 3, mes: 5, metaEjecutada: 2, valorEjecutado: 4800000, observaciones: 'Edición especial sectorial' },
  { id: 20, activityId: 3, mes: 7, metaEjecutada: 1, valorEjecutado: 2400000 },
  { id: 21, activityId: 3, mes: 8, metaEjecutada: 2, valorEjecutado: 5000000 },
  
  // Actividad 4: Diagnósticos (meta: 200)
  { id: 22, activityId: 4, mes: 1, metaEjecutada: 15, valorEjecutado: 1800000 },
  { id: 23, activityId: 4, mes: 2, metaEjecutada: 18, valorEjecutado: 2100000 },
  { id: 24, activityId: 4, mes: 3, metaEjecutada: 20, valorEjecutado: 2400000 },
  { id: 25, activityId: 4, mes: 4, metaEjecutada: 22, valorEjecutado: 2600000 },
  { id: 26, activityId: 4, mes: 5, metaEjecutada: 18, valorEjecutado: 2100000 },
  { id: 27, activityId: 4, mes: 6, metaEjecutada: 20, valorEjecutado: 2400000 },
  { id: 28, activityId: 4, mes: 7, metaEjecutada: 15, valorEjecutado: 1800000 },
  { id: 29, activityId: 4, mes: 8, metaEjecutada: 22, valorEjecutado: 2600000 },
  
  // Actividad 5: Jornadas formalización (meta: 1000)
  { id: 30, activityId: 5, mes: 1, metaEjecutada: 85, valorEjecutado: 2600000 },
  { id: 31, activityId: 5, mes: 2, metaEjecutada: 92, valorEjecutado: 2800000 },
  { id: 32, activityId: 5, mes: 3, metaEjecutada: 110, valorEjecutado: 3300000, observaciones: 'Jornada especial' },
  { id: 33, activityId: 5, mes: 4, metaEjecutada: 95, valorEjecutado: 2900000 },
  { id: 34, activityId: 5, mes: 5, metaEjecutada: 88, valorEjecutado: 2700000 },
  { id: 35, activityId: 5, mes: 6, metaEjecutada: 102, valorEjecutado: 3100000 },
  { id: 36, activityId: 5, mes: 7, metaEjecutada: 78, valorEjecutado: 2400000 },
  { id: 37, activityId: 5, mes: 8, metaEjecutada: 95, valorEjecutado: 2900000 },
  
  // Actividad 6: Campañas (meta: 5000)
  { id: 38, activityId: 6, mes: 1, metaEjecutada: 450, valorEjecutado: 4500000 },
  { id: 39, activityId: 6, mes: 2, metaEjecutada: 520, valorEjecutado: 5200000 },
  { id: 40, activityId: 6, mes: 3, metaEjecutada: 480, valorEjecutado: 4800000 },
  { id: 41, activityId: 6, mes: 4, metaEjecutada: 550, valorEjecutado: 5500000 },
  { id: 42, activityId: 6, mes: 5, metaEjecutada: 500, valorEjecutado: 5000000 },
  { id: 43, activityId: 6, mes: 6, metaEjecutada: 480, valorEjecutado: 4800000 },
  { id: 44, activityId: 6, mes: 7, metaEjecutada: 420, valorEjecutado: 4200000 },
  { id: 45, activityId: 6, mes: 8, metaEjecutada: 500, valorEjecutado: 5000000 },
  
  // Actividad 7: Renovaciones (meta: 800)
  { id: 46, activityId: 7, mes: 1, metaEjecutada: 120, valorEjecutado: 2100000, observaciones: 'Inicio periodo renovación' },
  { id: 47, activityId: 7, mes: 2, metaEjecutada: 150, valorEjecutado: 2600000 },
  { id: 48, activityId: 7, mes: 3, metaEjecutada: 180, valorEjecutado: 3100000, observaciones: 'Pico de renovaciones' },
  { id: 49, activityId: 7, mes: 4, metaEjecutada: 80, valorEjecutado: 1400000 },
  { id: 50, activityId: 7, mes: 5, metaEjecutada: 50, valorEjecutado: 900000 },
  { id: 51, activityId: 7, mes: 6, metaEjecutada: 40, valorEjecutado: 700000 },
  { id: 52, activityId: 7, mes: 7, metaEjecutada: 35, valorEjecutado: 600000 },
  { id: 53, activityId: 7, mes: 8, metaEjecutada: 45, valorEjecutado: 800000 },
  
  // Actividad 10: Marketing digital (meta: 400)
  { id: 54, activityId: 10, mes: 1, metaEjecutada: 35, valorEjecutado: 2800000 },
  { id: 55, activityId: 10, mes: 2, metaEjecutada: 42, valorEjecutado: 3200000 },
  { id: 56, activityId: 10, mes: 3, metaEjecutada: 38, valorEjecutado: 2900000 },
  { id: 57, activityId: 10, mes: 4, metaEjecutada: 45, valorEjecutado: 3400000 },
  { id: 58, activityId: 10, mes: 5, metaEjecutada: 40, valorEjecutado: 3000000 },
  { id: 59, activityId: 10, mes: 6, metaEjecutada: 48, valorEjecutado: 3600000 },
  { id: 60, activityId: 10, mes: 7, metaEjecutada: 35, valorEjecutado: 2600000 },
  { id: 61, activityId: 10, mes: 8, metaEjecutada: 42, valorEjecutado: 3200000 },
  
  // Actividad 11: Herramientas digitales (meta: 150)
  { id: 62, activityId: 11, mes: 2, metaEjecutada: 12, valorEjecutado: 5500000 },
  { id: 63, activityId: 11, mes: 3, metaEjecutada: 15, valorEjecutado: 6800000 },
  { id: 64, activityId: 11, mes: 4, metaEjecutada: 18, valorEjecutado: 8100000 },
  { id: 65, activityId: 11, mes: 5, metaEjecutada: 14, valorEjecutado: 6300000 },
  { id: 66, activityId: 11, mes: 6, metaEjecutada: 16, valorEjecutado: 7200000 },
  { id: 67, activityId: 11, mes: 7, metaEjecutada: 10, valorEjecutado: 4500000 },
  { id: 68, activityId: 11, mes: 8, metaEjecutada: 12, valorEjecutado: 5400000 },
  
  // Actividad 12: Diagnóstico digital (meta: 250)
  { id: 69, activityId: 12, mes: 1, metaEjecutada: 20, valorEjecutado: 1200000 },
  { id: 70, activityId: 12, mes: 2, metaEjecutada: 25, valorEjecutado: 1500000 },
  { id: 71, activityId: 12, mes: 3, metaEjecutada: 22, valorEjecutado: 1300000 },
  { id: 72, activityId: 12, mes: 4, metaEjecutada: 28, valorEjecutado: 1700000 },
  { id: 73, activityId: 12, mes: 5, metaEjecutada: 24, valorEjecutado: 1400000 },
  { id: 74, activityId: 12, mes: 6, metaEjecutada: 20, valorEjecutado: 1200000 },
  { id: 75, activityId: 12, mes: 7, metaEjecutada: 18, valorEjecutado: 1100000 },
  { id: 76, activityId: 12, mes: 8, metaEjecutada: 23, valorEjecutado: 1400000 },
  
  // Actividad 15 y 16: Sostenibilidad (Programa cerrado - completado)
  { id: 77, activityId: 15, mes: 1, metaEjecutada: 3, valorEjecutado: 4800000 },
  { id: 78, activityId: 15, mes: 2, metaEjecutada: 4, valorEjecutado: 6400000 },
  { id: 79, activityId: 15, mes: 3, metaEjecutada: 5, valorEjecutado: 8000000 },
  { id: 80, activityId: 15, mes: 4, metaEjecutada: 4, valorEjecutado: 6400000 },
  { id: 81, activityId: 15, mes: 5, metaEjecutada: 5, valorEjecutado: 8000000 },
  { id: 82, activityId: 15, mes: 6, metaEjecutada: 4, valorEjecutado: 6400000 },
  
  { id: 83, activityId: 16, mes: 1, metaEjecutada: 15, valorEjecutado: 3500000 },
  { id: 84, activityId: 16, mes: 2, metaEjecutada: 18, valorEjecutado: 4200000 },
  { id: 85, activityId: 16, mes: 3, metaEjecutada: 20, valorEjecutado: 4600000 },
  { id: 86, activityId: 16, mes: 4, metaEjecutada: 17, valorEjecutado: 3900000 },
  { id: 87, activityId: 16, mes: 5, metaEjecutada: 15, valorEjecutado: 3500000 },
  { id: 88, activityId: 16, mes: 6, metaEjecutada: 15, valorEjecutado: 3500000 }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    entidad: 'Program',
    entidadId: 1,
    accion: 'UPDATE',
    usuario: 'maria.garcia',
    fecha: '2025-01-15T09:30:00Z',
    valorAnterior: { estado: 'APROBADO' },
    valorNuevo: { estado: 'EJECUCION' },
    descripcion: 'Cambio de estado del programa a ejecución'
  },
  {
    id: 2,
    entidad: 'MonthlyExecution',
    entidadId: 1,
    accion: 'CREATE',
    usuario: 'maria.garcia',
    fecha: '2025-01-31T16:45:00Z',
    valorAnterior: null,
    valorNuevo: { mes: 1, metaEjecutada: 45, valorEjecutado: 5200000 },
    descripcion: 'Registro de ejecución mensual enero'
  },
  {
    id: 3,
    entidad: 'MonthlyExecution',
    entidadId: 9,
    accion: 'CREATE',
    usuario: 'maria.garcia',
    fecha: '2025-01-31T17:00:00Z',
    valorAnterior: null,
    valorNuevo: { mes: 1, metaEjecutada: 25, valorEjecutado: 3800000 },
    descripcion: 'Registro de ejecución mensual enero - Asesorías'
  },
  {
    id: 4,
    entidad: 'Program',
    entidadId: 6,
    accion: 'UPDATE',
    usuario: 'roberto.hernandez',
    fecha: '2025-06-30T18:00:00Z',
    valorAnterior: { estado: 'EJECUCION' },
    valorNuevo: { estado: 'CERRADO' },
    descripcion: 'Cierre del programa de sostenibilidad - Metas cumplidas'
  },
  {
    id: 5,
    entidad: 'BudgetItem',
    entidadId: 1,
    accion: 'UPDATE',
    usuario: 'carlos.martinez',
    fecha: '2025-02-15T10:30:00Z',
    valorAnterior: { ejecutado: 5200000 },
    valorNuevo: { ejecutado: 11000000 },
    descripcion: 'Actualización presupuesto ejecutado febrero'
  }
];

// Nombres de meses para visualización
export const MONTH_NAMES: string[] = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];