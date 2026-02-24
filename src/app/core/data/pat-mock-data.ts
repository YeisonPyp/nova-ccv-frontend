// src/app/core/mock/pat-mock-data.ts

import { 
  Program, 
  Activity, 
  BudgetItem, 
  MonthlyExecution, 
  MonthlyPlan,
  AuditLog 
} from '../../features/pat/models/pat.models';

export const MOCK_PROGRAMS: Program[] = [
  {
    id: 1,
    codigo: 'PRG-2025-001',
    nombre: 'Fortalecimiento Empresarial MIPYMES',
    area: 'Desarrollo Empresarial',
    responsable: 'María García López',
    estado: 'EJECUCION',
    objetivoEstrategico: 'Incrementar la competitividad de las MIPYMES de la región mediante capacitación y acompañamiento técnico',
    pilar: 'Desarrollo Económico Sostenible',
    beneficiarios: 'Micro, pequeñas y medianas empresas del departamento'
  },
  {
    id: 2,
    codigo: 'PRG-2025-002',
    nombre: 'Transformación Digital Comercial',
    area: 'Innovación y Tecnología',
    responsable: 'Carlos Rodríguez Martínez',
    estado: 'EJECUCION',
    objetivoEstrategico: 'Acelerar la adopción de tecnologías digitales en el sector comercial',
    pilar: 'Innovación y Competitividad',
    beneficiarios: 'Comerciantes y empresarios del sector retail'
  },
  {
    id: 3,
    codigo: 'PRG-2025-003',
    nombre: 'Formalización Empresarial',
    area: 'Registros Públicos',
    responsable: 'Ana Martínez Ruiz',
    estado: 'APROBADO',
    objetivoEstrategico: 'Reducir la informalidad empresarial en la región',
    pilar: 'Legalidad y Transparencia',
    beneficiarios: 'Empresarios informales y emprendedores'
  },
  {
    id: 4,
    codigo: 'PRG-2025-004',
    nombre: 'Internacionalización de Empresas',
    area: 'Comercio Exterior',
    responsable: 'Pedro Sánchez Villa',
    estado: 'EJECUCION',
    objetivoEstrategico: 'Incrementar las exportaciones de las empresas de la región',
    pilar: 'Apertura de Mercados',
    beneficiarios: 'Empresas con potencial exportador'
  },
  {
    id: 5,
    codigo: 'PRG-2025-005',
    nombre: 'Red de Emprendimiento Regional',
    area: 'Emprendimiento',
    responsable: 'Laura Jiménez Ortega',
    estado: 'BORRADOR',
    objetivoEstrategico: 'Fortalecer el ecosistema de emprendimiento regional',
    pilar: 'Emprendimiento e Innovación',
    beneficiarios: 'Emprendedores en etapa temprana'
  },
  {
    id: 6,
    codigo: 'PRG-2025-006',
    nombre: 'Certificación de Calidad Empresarial',
    area: 'Desarrollo Empresarial',
    responsable: 'Roberto Díaz Castro',
    estado: 'CERRADO',
    objetivoEstrategico: 'Acompañar a las empresas en procesos de certificación de calidad',
    pilar: 'Excelencia Operacional',
    beneficiarios: 'Empresas en proceso de certificación ISO'
  }
];

export const MOCK_ACTIVITIES: Activity[] = [
  // Programa 1: Fortalecimiento Empresarial
  { id: 1, programId: 1, nombre: 'Capacitaciones en gestión empresarial', unidadMedida: 'Capacitaciones', metaTotal: 24 },
  { id: 2, programId: 1, nombre: 'Asesorías técnicas individuales', unidadMedida: 'Asesorías', metaTotal: 150 },
  { id: 3, programId: 1, nombre: 'Talleres de innovación', unidadMedida: 'Talleres', metaTotal: 12 },
  { id: 4, programId: 1, nombre: 'Ruedas de negocios', unidadMedida: 'Eventos', metaTotal: 4 },
  
  // Programa 2: Transformación Digital
  { id: 5, programId: 2, nombre: 'Diagnósticos digitales', unidadMedida: 'Diagnósticos', metaTotal: 100 },
  { id: 6, programId: 2, nombre: 'Implementación de e-commerce', unidadMedida: 'Empresas', metaTotal: 50 },
  { id: 7, programId: 2, nombre: 'Capacitación en marketing digital', unidadMedida: 'Capacitaciones', metaTotal: 18 },
  
  // Programa 3: Formalización
  { id: 8, programId: 3, nombre: 'Jornadas de formalización', unidadMedida: 'Jornadas', metaTotal: 12 },
  { id: 9, programId: 3, nombre: 'Acompañamiento a nuevos registros', unidadMedida: 'Empresas', metaTotal: 200 },
  
  // Programa 4: Internacionalización
  { id: 10, programId: 4, nombre: 'Misiones comerciales', unidadMedida: 'Misiones', metaTotal: 6 },
  { id: 11, programId: 4, nombre: 'Estudios de mercado internacional', unidadMedida: 'Estudios', metaTotal: 10 },
  { id: 12, programId: 4, nombre: 'Empresas acompañadas en exportación', unidadMedida: 'Empresas', metaTotal: 30 },
  
  // Programa 5: Emprendimiento
  { id: 13, programId: 5, nombre: 'Bootcamps de emprendimiento', unidadMedida: 'Bootcamps', metaTotal: 8 },
  { id: 14, programId: 5, nombre: 'Mentorias a emprendedores', unidadMedida: 'Mentorías', metaTotal: 60 },
  
  // Programa 6: Certificación
  { id: 15, programId: 6, nombre: 'Empresas certificadas ISO', unidadMedida: 'Empresas', metaTotal: 15 },
  { id: 16, programId: 6, nombre: 'Auditorías internas realizadas', unidadMedida: 'Auditorías', metaTotal: 45 }
];

export const MOCK_BUDGET_ITEMS: BudgetItem[] = [
  // Actividad 1
  { id: 1, activityId: 1, rubro: 'Honorarios consultores', planeado: 48000000, ejecutado: 32000000 },
  { id: 2, activityId: 1, rubro: 'Materiales y suministros', planeado: 8000000, ejecutado: 5500000 },
  { id: 3, activityId: 1, rubro: 'Logística y refrigerios', planeado: 12000000, ejecutado: 7800000 },
  
  // Actividad 2
  { id: 4, activityId: 2, rubro: 'Honorarios asesores', planeado: 75000000, ejecutado: 45000000 },
  { id: 5, activityId: 2, rubro: 'Transporte', planeado: 15000000, ejecutado: 9000000 },
  
  // Actividad 3
  { id: 6, activityId: 3, rubro: 'Facilitadores talleres', planeado: 24000000, ejecutado: 16000000 },
  { id: 7, activityId: 3, rubro: 'Materiales didácticos', planeado: 6000000, ejecutado: 4200000 },
  
  // Actividad 4
  { id: 8, activityId: 4, rubro: 'Organización eventos', planeado: 40000000, ejecutado: 20000000 },
  { id: 9, activityId: 4, rubro: 'Promoción y divulgación', planeado: 10000000, ejecutado: 5000000 },
  
  // Actividad 5
  { id: 10, activityId: 5, rubro: 'Consultores digitales', planeado: 50000000, ejecutado: 35000000 },
  { id: 11, activityId: 5, rubro: 'Herramientas tecnológicas', planeado: 20000000, ejecutado: 14000000 },
  
  // Actividad 6
  { id: 12, activityId: 6, rubro: 'Desarrollo plataformas', planeado: 80000000, ejecutado: 48000000 },
  { id: 13, activityId: 6, rubro: 'Capacitación técnica', planeado: 25000000, ejecutado: 15000000 },
  
  // Actividad 7
  { id: 14, activityId: 7, rubro: 'Expertos marketing', planeado: 36000000, ejecutado: 24000000 },
  
  // Actividad 10
  { id: 15, activityId: 10, rubro: 'Tiquetes y viáticos', planeado: 120000000, ejecutado: 60000000 },
  { id: 16, activityId: 10, rubro: 'Inscripciones ferias', planeado: 30000000, ejecutado: 15000000 },
  
  // Actividad 11
  { id: 17, activityId: 11, rubro: 'Investigación mercados', planeado: 50000000, ejecutado: 30000000 },
  
  // Actividad 12
  { id: 18, activityId: 12, rubro: 'Acompañamiento exportador', planeado: 60000000, ejecutado: 36000000 },
  
  // Actividad 15 (programa cerrado)
  { id: 19, activityId: 15, rubro: 'Consultoría certificación', planeado: 75000000, ejecutado: 75000000 },
  
  // Actividad 16
  { id: 20, activityId: 16, rubro: 'Auditores internos', planeado: 45000000, ejecutado: 45000000 }
];

export const MOCK_MONTHLY_EXECUTIONS: MonthlyExecution[] = [
  // Actividad 1: Capacitaciones (meta: 24)
  { id: 1, activityId: 1, mes: 1, metaEjecutada: 2, valorEjecutado: 4000000 },
  { id: 2, activityId: 1, mes: 2, metaEjecutada: 2, valorEjecutado: 4500000 },
  { id: 3, activityId: 1, mes: 3, metaEjecutada: 2, valorEjecutado: 4200000 },
  { id: 4, activityId: 1, mes: 4, metaEjecutada: 2, valorEjecutado: 4100000 },
  { id: 5, activityId: 1, mes: 5, metaEjecutada: 2, valorEjecutado: 4300000 },
  { id: 6, activityId: 1, mes: 6, metaEjecutada: 2, valorEjecutado: 4500000 },
  { id: 7, activityId: 1, mes: 7, metaEjecutada: 2, valorEjecutado: 4700000 },
  { id: 8, activityId: 1, mes: 8, metaEjecutada: 2, valorEjecutado: 4800000 },
  { id: 9, activityId: 1, mes: 9, metaEjecutada: 2, valorEjecutado: 5100000 },
  { id: 10, activityId: 1, mes: 10, metaEjecutada: 1, valorEjecutado: 5100000 },
  
  // Actividad 2: Asesorías (meta: 150)
  { id: 11, activityId: 2, mes: 1, metaEjecutada: 10, valorEjecutado: 5000000 },
  { id: 12, activityId: 2, mes: 2, metaEjecutada: 12, valorEjecutado: 6000000 },
  { id: 13, activityId: 2, mes: 3, metaEjecutada: 15, valorEjecutado: 7500000 },
  { id: 14, activityId: 2, mes: 4, metaEjecutada: 12, valorEjecutado: 6000000 },
  { id: 15, activityId: 2, mes: 5, metaEjecutada: 14, valorEjecutado: 7000000 },
  { id: 16, activityId: 2, mes: 6, metaEjecutada: 13, valorEjecutado: 6500000 },
  { id: 17, activityId: 2, mes: 7, metaEjecutada: 11, valorEjecutado: 5500000 },
  { id: 18, activityId: 2, mes: 8, metaEjecutada: 10, valorEjecutado: 5000000 },
  { id: 19, activityId: 2, mes: 9, metaEjecutada: 8, valorEjecutado: 4000000 },
  { id: 20, activityId: 2, mes: 10, metaEjecutada: 5, valorEjecutado: 2500000 },
  
  // Actividad 5: Diagnósticos digitales (meta: 100)
  { id: 21, activityId: 5, mes: 1, metaEjecutada: 8, valorEjecutado: 4000000 },
  { id: 22, activityId: 5, mes: 2, metaEjecutada: 10, valorEjecutado: 5000000 },
  { id: 23, activityId: 5, mes: 3, metaEjecutada: 12, valorEjecutado: 6000000 },
  { id: 24, activityId: 5, mes: 4, metaEjecutada: 10, valorEjecutado: 5000000 },
  { id: 25, activityId: 5, mes: 5, metaEjecutada: 15, valorEjecutado: 7500000 },
  { id: 26, activityId: 5, mes: 6, metaEjecutada: 12, valorEjecutado: 6000000 },
  { id: 27, activityId: 5, mes: 7, metaEjecutada: 8, valorEjecutado: 4000000 },
  { id: 28, activityId: 5, mes: 8, metaEjecutada: 5, valorEjecutado: 2500000 },
  
  // Actividad 6: E-commerce (meta: 50)
  { id: 29, activityId: 6, mes: 2, metaEjecutada: 5, valorEjecutado: 8000000 },
  { id: 30, activityId: 6, mes: 3, metaEjecutada: 6, valorEjecutado: 10000000 },
  { id: 31, activityId: 6, mes: 4, metaEjecutada: 5, valorEjecutado: 8500000 },
  { id: 32, activityId: 6, mes: 5, metaEjecutada: 7, valorEjecutado: 11500000 },
  { id: 33, activityId: 6, mes: 6, metaEjecutada: 6, valorEjecutado: 10000000 },
  { id: 34, activityId: 6, mes: 7, metaEjecutada: 5, valorEjecutado: 8500000 },
  { id: 35, activityId: 6, mes: 8, metaEjecutada: 4, valorEjecutado: 6500000 },
  
  // Actividad 10: Misiones comerciales (meta: 6)
  { id: 36, activityId: 10, mes: 3, metaEjecutada: 1, valorEjecutado: 25000000 },
  { id: 37, activityId: 10, mes: 6, metaEjecutada: 1, valorEjecutado: 25000000 },
  { id: 38, activityId: 10, mes: 9, metaEjecutada: 1, valorEjecutado: 25000000 },
  
  // Actividad 15 y 16 (programa cerrado - 100% ejecutado)
  { id: 39, activityId: 15, mes: 1, metaEjecutada: 2, valorEjecutado: 10000000 },
  { id: 40, activityId: 15, mes: 2, metaEjecutada: 2, valorEjecutado: 10000000 },
  { id: 41, activityId: 15, mes: 3, metaEjecutada: 2, valorEjecutado: 10000000 },
  { id: 42, activityId: 15, mes: 4, metaEjecutada: 3, valorEjecutado: 15000000 },
  { id: 43, activityId: 15, mes: 5, metaEjecutada: 3, valorEjecutado: 15000000 },
  { id: 44, activityId: 15, mes: 6, metaEjecutada: 3, valorEjecutado: 15000000 },
  { id: 45, activityId: 16, mes: 1, metaEjecutada: 5, valorEjecutado: 5000000 },
  { id: 46, activityId: 16, mes: 2, metaEjecutada: 5, valorEjecutado: 5000000 },
  { id: 47, activityId: 16, mes: 3, metaEjecutada: 5, valorEjecutado: 5000000 },
  { id: 48, activityId: 16, mes: 4, metaEjecutada: 10, valorEjecutado: 10000000 },
  { id: 49, activityId: 16, mes: 5, metaEjecutada: 10, valorEjecutado: 10000000 },
  { id: 50, activityId: 16, mes: 6, metaEjecutada: 10, valorEjecutado: 10000000 }
];

export const MOCK_MONTHLY_PLANS: MonthlyPlan[] = [
  // Actividad 1: Capacitaciones - 2 por mes
  { id: 1, activityId: 1, mes: 1, metaPlaneada: 2, valorPlaneado: 5666666 },
  { id: 2, activityId: 1, mes: 2, metaPlaneada: 2, valorPlaneado: 5666666 },
  { id: 3, activityId: 1, mes: 3, metaPlaneada: 2, valorPlaneado: 5666666 },
  { id: 4, activityId: 1, mes: 4, metaPlaneada: 2, valorPlaneado: 5666666 },
  { id: 5, activityId: 1, mes: 5, metaPlaneada: 2, valorPlaneado: 5666666 },
  { id: 6, activityId: 1, mes: 6, metaPlaneada: 2, valorPlaneado: 5666666 },
  { id: 7, activityId: 1, mes: 7, metaPlaneada: 2, valorPlaneado: 5666666 },
  { id: 8, activityId: 1, mes: 8, metaPlaneada: 2, valorPlaneado: 5666666 },
  { id: 9, activityId: 1, mes: 9, metaPlaneada: 2, valorPlaneado: 5666666 },
  { id: 10, activityId: 1, mes: 10, metaPlaneada: 2, valorPlaneado: 5666666 },
  { id: 11, activityId: 1, mes: 11, metaPlaneada: 2, valorPlaneado: 5666666 },
  { id: 12, activityId: 1, mes: 12, metaPlaneada: 2, valorPlaneado: 5666674 },
  
  // Actividad 2: Asesorías
  { id: 13, activityId: 2, mes: 1, metaPlaneada: 12, valorPlaneado: 7500000 },
  { id: 14, activityId: 2, mes: 2, metaPlaneada: 12, valorPlaneado: 7500000 },
  { id: 15, activityId: 2, mes: 3, metaPlaneada: 13, valorPlaneado: 7500000 },
  { id: 16, activityId: 2, mes: 4, metaPlaneada: 13, valorPlaneado: 7500000 },
  { id: 17, activityId: 2, mes: 5, metaPlaneada: 13, valorPlaneado: 7500000 },
  { id: 18, activityId: 2, mes: 6, metaPlaneada: 13, valorPlaneado: 7500000 },
  { id: 19, activityId: 2, mes: 7, metaPlaneada: 13, valorPlaneado: 7500000 },
  { id: 20, activityId: 2, mes: 8, metaPlaneada: 13, valorPlaneado: 7500000 },
  { id: 21, activityId: 2, mes: 9, metaPlaneada: 13, valorPlaneado: 7500000 },
  { id: 22, activityId: 2, mes: 10, metaPlaneada: 13, valorPlaneado: 7500000 },
  { id: 23, activityId: 2, mes: 11, metaPlaneada: 13, valorPlaneado: 7500000 },
  { id: 24, activityId: 2, mes: 12, metaPlaneada: 13, valorPlaneado: 7500000 }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    entidad: 'Program',
    entidadId: 1,
    accion: 'UPDATE',
    usuario: 'admin@camaracomercio.org',
    fecha: '2025-01-15T10:30:00Z',
    valorAnterior: { estado: 'APROBADO' },
    valorNuevo: { estado: 'EJECUCION' }
  },
  {
    id: 2,
    entidad: 'MonthlyExecution',
    entidadId: 1,
    accion: 'CREATE',
    usuario: 'maria.garcia@camaracomercio.org',
    fecha: '2025-01-20T14:45:00Z',
    valorAnterior: null,
    valorNuevo: { activityId: 1, mes: 1, metaEjecutada: 2, valorEjecutado: 4000000 }
  },
  {
    id: 3,
    entidad: 'MonthlyExecution',
    entidadId: 11,
    accion: 'CREATE',
    usuario: 'maria.garcia@camaracomercio.org',
    fecha: '2025-01-25T09:15:00Z',
    valorAnterior: null,
    valorNuevo: { activityId: 2, mes: 1, metaEjecutada: 10, valorEjecutado: 5000000 }
  },
  {
    id: 4,
    entidad: 'Program',
    entidadId: 6,
    accion: 'UPDATE',
    usuario: 'admin@camaracomercio.org',
    fecha: '2025-06-30T16:00:00Z',
    valorAnterior: { estado: 'EJECUCION' },
    valorNuevo: { estado: 'CERRADO' }
  }
];

// Helpers
export const MONTHS_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];