// src/app/shared/data/menu-data.ts
import { MenuNode } from '../../features/pat/models/pat.models';

export const MENU_DATA: MenuNode[] = [
  // ═══════════════════════════════════════════════════════════════
  // AUDITORÍA
  // ═══════════════════════════════════════════════════════════════
  {
    label: 'Auditoría',
    icon: '🔍',
    children: [
      {
        label: 'Administración',
        icon: '⚙️',
        children: [
          { 
            label: 'Tablas auditables', 
            icon: '📋',
            route: 'http://nova.eaav.gov.co/NOVA/Auditoria/com/novasistemas/auditoria/formas/AUD001_N.jsf?emp_jsp7=EA&modulo=AUDITORIA&usuario=95434&un=ADMON&forma=AUD001_N.jsf&zona=01',
            external: true
          }
        ]
      },
      {
        label: 'Consultas',
        icon: '🔎',
        children: [
          { label: 'Usuario y tabla entre fechas', icon: '📅', route: 'http://nova.eaav.gov.co/JSP7/faces/Auditoria/frmAuditoriaConsulta.xhtml', external: true }
        ]
      },
      {
        label: 'Reportes',
        icon: '📊',
        children: [
          { label: 'Reporte general de auditoría', icon: '📈', route: 'http://nova.eaav.gov.co/JSP7/faces/Reportes/AUD/frmAUD001.xhtml' }
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // CAD
  // ═══════════════════════════════════════════════════════════════
  {
    label: 'CAD',
    icon: '📁',
    children: [
      {
        label: 'Actualizaciones',
        icon: '🔄',
        children: [
          { label: 'Radicar', icon: '📝', route: 'http://nova.eaav.gov.co/JSP7/faces/HojaRuta/frmEnvioMensaje.xhtml', external: true }
        ]
      },
      {
        label: 'Consultas',
        icon: '🔎',
        children: [
          { label: 'Consulta radicado', icon: '🔍', route: 'http://nova.eaav.gov.co/JSP7/faces/HojaRuta/frmConsultaCAD.xhtml', external: true },
          { label: 'Radicados reasignados', icon: '↔️', route: 'http://nova.eaav.gov.co/JSP7/faces/HojaRuta/frmConsultaReasignado.xhtml', external: true },
          { label: 'Radicados del módulo', icon: '📋', route: 'http://nova.eaav.gov.co/JSP7/faces/HojaRuta/frmRadicadosDelModulo.xhtml', external: true }
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // COMPRAS Y CONTRATACIÓN
  // ═══════════════════════════════════════════════════════════════
  {
    label: 'Compras y Contratación',
    icon: '🛒',
    children: [
      {
        label: 'Administración',
        icon: '⚙️',
        children: [
          { 
            label: 'Adm. lineamientos o políticas de prevención', 
            icon: '📜', 
            route: '/compras/admin/lineamientos' 
          },
          {
            label: 'Parámetros de contratación',
            icon: '🔧',
            children: [
              { label: 'Representante legal', icon: '👤', route: '/compras/parametros/representante-legal' },
              { label: 'Tipos de contratos', icon: '📄', route: '/compras/parametros/tipos-contrato' },
              { label: 'Modalidades de contratación', icon: '📋', route: '/compras/parametros/modalidades' },
              { label: 'Tipos de pólizas de contratos', icon: '🛡️', route: '/compras/parametros/polizas' },
              { label: 'Tipos de actas de contratos', icon: '📝', route: '/compras/parametros/actas' },
              { label: 'Tipos de amparos de contratos', icon: '🔒', route: '/compras/parametros/amparos' },
              { label: 'Tipos de novedades de contratos', icon: '🆕', route: '/compras/parametros/novedades' },
              { label: 'Requisitos de contratos', icon: '✅', route: '/compras/parametros/requisitos' },
              { label: 'Modificaciones', icon: '✏️', route: '/compras/parametros/modificaciones' },
              { label: 'Aseguradoras', icon: '🏢', route: '/compras/parametros/aseguradoras' },
              { label: 'Estados de contratos', icon: '📊', route: '/compras/parametros/estados' },
              { label: 'Topes régimen simplificado', icon: '📈', route: '/compras/parametros/topes' },
              { label: 'Origen de los recursos', icon: '💰', route: '/compras/parametros/origen-recursos' },
              { label: 'Relación novedad - estado contratación', icon: '🔗', route: '/compras/parametros/relacion-novedad-estado' },
              {
                label: 'Parámetros etapa precontractual',
                icon: '📂',
                children: [
                  { label: 'Documentos', icon: '📄', route: '/compras/precontractual/documentos' },
                  { label: 'Etapas', icon: '📋', route: '/compras/precontractual/etapas' },
                  { label: 'Configuraciones', icon: '⚙️', route: '/compras/precontractual/configuraciones' }
                ]
              }
            ]
          }
        ]
      },
      {
        label: 'Actualizaciones',
        icon: '🔄',
        children: [
          { label: 'Radicar', icon: '📝', route: '/compras/actualizaciones/radicar' },
          {
            label: 'Precontractual',
            icon: '📋',
            children: [
              { label: 'Creación de proceso', icon: '➕', route: '/compras/precontractual/crear' },
              { label: 'Rechazo de procesos', icon: '❌', route: '/compras/precontractual/rechazar' },
              { label: 'Seguimiento de procesos', icon: '👁️', route: '/compras/precontractual/seguimiento' },
              { label: 'Seguimiento de procesos no aprobados', icon: '⚠️', route: '/compras/precontractual/no-aprobados' },
              { label: 'Registro de proponentes', icon: '📝', route: '/compras/precontractual/proponentes' }
            ]
          },
          {
            label: 'Contratación',
            icon: '📑',
            children: [
              { label: 'Grupos de contratos', icon: '📁', route: '/compras/contratacion/grupos' },
              { label: 'Contratos', icon: '📄', route: '/compras/contratacion/contratos' }
            ]
          }
        ]
      },
      {
        label: 'Consultas',
        icon: '🔎',
        children: [
          {
            label: 'C. Contratación',
            icon: '📋',
            children: [
              { label: 'Consulta de contratos', icon: '🔍', route: '/compras/consultas/contratos' },
              { label: 'C. procesos adjudicados', icon: '✅', route: '/compras/consultas/adjudicados' },
              { label: 'Consulta de disponibilidades', icon: '📊', route: '/compras/consultas/disponibilidades' },
              { label: 'Radicados del módulo', icon: '📋', route: '/compras/consultas/radicados-modulo' },
              { label: 'Radicados tramitados', icon: '✔️', route: '/compras/consultas/radicados-tramitados' },
              { label: 'Radicados del área', icon: '🏢', route: '/compras/consultas/radicados-area' },
              { label: 'Radicados rechazados', icon: '❌', route: '/compras/consultas/radicados-rechazados' }
            ]
          }
        ]
      },
      {
        label: 'Reportes',
        icon: '📊',
        children: [
          { label: 'R. Procesos precontractuales', icon: '📈', route: '/compras/reportes/precontractuales' },
          {
            label: 'R. Contratación',
            icon: '📑',
            children: [
              { label: 'Informe general de contratos', icon: '📄', route: '/compras/reportes/informe-general' },
              { label: 'Informe de contratos - contraloría', icon: '🏛️', route: '/compras/reportes/contraloria' },
              { label: 'Contratos por contratista', icon: '👤', route: '/compras/reportes/por-contratista' },
              { label: 'Certificación de contrato', icon: '📜', route: '/compras/reportes/certificacion' },
              { label: 'Contratos por interventor', icon: '👁️', route: '/compras/reportes/por-interventor' },
              { label: 'Ejecución presupuestal de contratos', icon: '💰', route: '/compras/reportes/ejecucion-presupuestal' },
              { label: 'Resumen de contratos por clase', icon: '📊', route: '/compras/reportes/resumen-clase' },
              { label: 'Contratos por clase', icon: '📋', route: '/compras/reportes/por-clase' },
              { label: 'Contratos vencidos', icon: '⏰', route: '/compras/reportes/vencidos' },
              { label: 'Contratos con póliza vencida', icon: '🛡️', route: '/compras/reportes/poliza-vencida' },
              { label: 'Contratos por estado', icon: '📊', route: '/compras/reportes/por-estado' },
              { label: 'Relación de contratos y presupuesto', icon: '💵', route: '/compras/reportes/contratos-presupuesto' },
              { label: 'Relación contratos - cuentas por pagar', icon: '💳', route: '/compras/reportes/cuentas-pagar' },
              { label: 'Otrosí contratos', icon: '📝', route: '/compras/reportes/otrosi' },
              { label: 'Informe saldos de contratos', icon: '💰', route: '/compras/reportes/saldos' },
              { label: 'Informe movimientos de contratos', icon: '📈', route: '/compras/reportes/movimientos' },
              { label: 'R. Procesos precontractual y contractual', icon: '📋', route: '/compras/reportes/procesos-completo' },
              { label: 'Contratos próximos a vencer', icon: '⚠️', route: '/compras/reportes/proximos-vencer' },
              { label: 'Informe SIRECI', icon: '📊', route: '/compras/reportes/sireci' },
              { label: 'Informe SIRECI compras', icon: '🛒', route: '/compras/reportes/sireci-compras' },
              { label: 'Contratos con póliza próxima a vencer', icon: '🔔', route: '/compras/reportes/poliza-proxima-vencer' }
            ]
          }
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // HOJA DE RUTA
  // ═══════════════════════════════════════════════════════════════
  {
    label: 'Hoja de Ruta',
    icon: '🗺️',
    children: [
      {
        label: 'Administración',
        icon: '⚙️',
        children: [
          { label: 'Tipo cuenta', icon: '📋', route: '/hoja-ruta/admin/tipo-cuenta' },
          { label: 'Responsable', icon: '👤', route: '/hoja-ruta/admin/responsable' },
          { label: 'Caminos', icon: '🛤️', route: '/hoja-ruta/admin/caminos' },
          { label: 'Tipo de cuenta por módulo', icon: '📁', route: '/hoja-ruta/admin/tipo-cuenta-modulo' },
          { label: 'Módulos del usuario', icon: '👥', route: '/hoja-ruta/admin/modulos-usuario' },
          { label: 'Caminos por tipo de cuenta', icon: '🔀', route: '/hoja-ruta/admin/caminos-tipo-cuenta' },
          { label: 'Radicados', icon: '📝', route: '/hoja-ruta/admin/radicados' },
          { label: 'Cambio de área', icon: '🔄', route: '/hoja-ruta/admin/cambio-area' },
          { label: 'Activar radicados finalizados', icon: '✅', route: '/hoja-ruta/admin/activar-radicados' },
          { label: 'Actualizar fechas rad. autorizados', icon: '📅', route: '/hoja-ruta/admin/actualizar-fechas' }
        ]
      },
      {
        label: 'Consultas',
        icon: '🔎',
        children: [
          { label: 'Seguimiento', icon: '👁️', route: '/hoja-ruta/consultas/seguimiento' },
          { label: 'Radicados del módulo', icon: '📋', route: '/hoja-ruta/consultas/radicados-modulo' },
          { label: 'Radicados tramitados', icon: '✔️', route: '/hoja-ruta/consultas/radicados-tramitados' }
        ]
      },
      {
        label: 'Reportes',
        icon: '📊',
        children: [
          { label: 'Radicados', icon: '📝', route: '/hoja-ruta/reportes/radicados' },
          { label: 'Detallado', icon: '📋', route: '/hoja-ruta/reportes/detallado' },
          { label: 'Verificación de adjuntos en radicados', icon: '📎', route: '/hoja-ruta/reportes/verificacion-adjuntos' },
          { label: 'Indicador', icon: '📈', route: '/hoja-ruta/reportes/indicador' },
          { label: 'Indicador - tesorería', icon: '💰', route: '/hoja-ruta/reportes/indicador-tesoreria' },
          { label: 'Proceso de pagos', icon: '💳', route: '/hoja-ruta/reportes/proceso-pagos' }
        ]
      }
    ]
  },
    // ═══════════════════════════════════════════════════════════════
  // PAT (Plan de Acción y Trabajo) - Se expande automáticamente
  // ═══════════════════════════════════════════════════════════════
  {
    label: 'PAT',
    icon: '📊',
    children: [
      { 
        label: 'Dashboard', 
        icon: '🏠', 
        route: '/pat/dashboard' 
      },
      { 
        label: 'Programas', 
        icon: '📋', 
        route: '/pat/programs' 
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // PROYECTOS
  // ═══════════════════════════════════════════════════════════════
  {
    label: 'Proyectos',
    icon: '📐',
    children: [
      {
        label: 'Administración',
        icon: '⚙️',
        children: [
          { label: 'Estados', icon: '📊', route: 'http://nova.eaav.gov.co/JSP7/faces/Proyectos/frmAdminEstados.xhtml' },
          { label: 'Tipos recursos', icon: '💰', route: 'http://nova.eaav.gov.co/JSP7/faces/Proyectos/frmAdminTiposRec.xhtml', external: true },
          { label: 'Actividades', icon: '📋', route: 'http://nova.eaav.gov.co/JSP7/faces/Proyectos/frmAdminActividades.xhtml', external: true }
        ]
      },
      {
        label: 'Actualizaciones',
        icon: '🔄',
        children: [
          { label: 'Creación proyectos', icon: '➕', route: 'http://nova.eaav.gov.co/JSP7/faces/Proyectos/frmCrearProyectos.xhtml', external: true },
          { label: 'Editar proyectos', icon: '✏️', route: 'http://nova.eaav.gov.co/JSP7/faces/Proyectos/frmActualizarProyectos.xhtml', external: true },
          { label: 'Editar proyectos - contractuales', icon: '📑', route: 'http://nova.eaav.gov.co/JSP7/faces/Proyectos/frmActualizarProyectosAprobados.xhtml', external: true }
        ]
      },
      {
        label: 'Consultas',
        icon: '🔎',
        children: [
          { label: 'Proyectos', icon: '📁', route: '/proyectos/consultas/proyectos' }
        ]
      },
      {
        label: 'Reportes',
        icon: '📊',
        children: [
          { label: 'Lista de proyectos', icon: '📋', route: 'http://nova.eaav.gov.co/JSP7/faces/Reportes/PRY/frmPRY005.xhtml', external: true },
          { label: 'Por rubro', icon: '💵', route: 'http://nova.eaav.gov.co/JSP7/faces/Proyectos/frmReportePorRubro.xhtml', external: true },
          { label: 'Por avances', icon: '📈', route: 'http://nova.eaav.gov.co/JSP7/faces/Proyectos/frmReportePorAvance.xhtml', external: true },
          { label: 'Formato SUI', icon: '📄', route: 'http://nova.eaav.gov.co/JSP7/faces/Proyectos/frmReporteFormatoSUI.xhtml', external: true },
          { label: 'Formato contraloría', icon: '🏛️', route: 'http://nova.eaav.gov.co/JSP7/faces/Proyectos/frmReporteFormatoContraloria.xhtml', external: true }
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // SEGURIDAD
  // ═══════════════════════════════════════════════════════════════
  {
    label: 'Seguridad',
    icon: '🔐',
    children: [
      {
        label: 'Administración',
        icon: '⚙️',
        children: [
          { label: 'Creación de usuarios en sistema', icon: '👤', route: '/seguridad/admin/crear-usuarios' },
          { label: 'Administración roles y módulos', icon: '🎭', route: '/seguridad/admin/roles-modulos' },
          { label: 'Administración de menú', icon: '📋', route: '/seguridad/admin/menu' }
        ]
      },
      {
        label: 'Actualizaciones',
        icon: '🔄',
        children: [
          { label: 'Asociación de opciones de menú a roles', icon: '📌', route: '/seguridad/actualizaciones/menu-roles' },
          { label: 'Asignación de roles a usuarios', icon: '👥', route: '/seguridad/actualizaciones/roles-usuarios' },
          { label: 'Asignación de horarios de trabajo', icon: '🕐', route: '/seguridad/actualizaciones/horarios' },
          { label: 'Cambio de estado y password usuarios', icon: '🔑', route: '/seguridad/actualizaciones/estado-password' }
        ]
      },
      {
        label: 'Consultas',
        icon: '🔎',
        children: [
          { label: 'Consulta de estado de usuarios', icon: '👤', route: '/seguridad/consultas/estado-usuarios' },
          { label: 'Consulta de roles por módulo', icon: '🎭', route: '/seguridad/consultas/roles-modulo' },
          { label: 'Consulta de roles por usuario', icon: '👥', route: '/seguridad/consultas/roles-usuario' }
        ]
      },
      {
        label: 'Reportes',
        icon: '📊',
        children: [
          { label: 'Roles por módulo', icon: '🎭', route: '/seguridad/reportes/roles-modulo' },
          { label: 'Privilegios de roles', icon: '🔐', route: '/seguridad/reportes/privilegios-roles' },
          { label: 'Asignación de roles a usuarios', icon: '👥', route: '/seguridad/reportes/asignacion-roles' },
          { label: 'Usuarios registrados', icon: '📋', route: '/seguridad/reportes/usuarios-registrados' },
          { label: 'Privilegios por usuario y rol', icon: '🔑', route: '/seguridad/reportes/privilegios-usuario-rol' },
          { label: 'Usuario con roles y opciones de menú', icon: '📌', route: '/seguridad/reportes/usuario-roles-menu' }
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // SISTEMA
  // ═══════════════════════════════════════════════════════════════
  {
    label: 'Sistema',
    icon: '💻',
    children: [
      {
        label: 'Administración',
        icon: '⚙️',
        children: [
          { label: 'Agencias', icon: '🏢', route: '/sistema/admin/agencias' },
          { label: 'Causales', icon: '📋', route: '/sistema/admin/causales' },
          { label: 'Períodos', icon: '📅', route: '/sistema/admin/periodos' },
          { label: 'Períodos conciliación', icon: '🔄', route: '/sistema/admin/periodos-conciliacion' },
          { label: 'Administración de parámetros', icon: '🔧', route: '/sistema/admin/parametros' },
          { label: 'Administración de tipo de parámetro', icon: '📝', route: '/sistema/admin/tipo-parametro' },
          {
            label: 'Interfaz',
            icon: '🖥️',
            children: [
              { label: 'Fuentes', icon: '🔤', route: '/sistema/admin/interfaz/fuentes' }
            ]
          }
        ]
      },
      {
        label: 'Mantenimiento',
        icon: '🔧',
        children: [
          { label: 'Numeración', icon: '🔢', route: '/sistema/mantenimiento/numeracion' },
          { label: 'Corrección autoliquidación', icon: '✏️', route: '/sistema/mantenimiento/correccion-autoliquidacion' },
          { label: 'Modificación tabla amortización préstamos', icon: '📊', route: '/sistema/mantenimiento/amortizacion-prestamos' },
          { label: 'Sectorización', icon: '🗺️', route: '/sistema/mantenimiento/sectorizacion' }
        ]
      },
      {
        label: 'Reportes',
        icon: '📊',
        children: [
          { label: 'R. Zonas', icon: '🗺️', route: '/sistema/reportes/zonas' },
          { label: 'R. Países', icon: '🌍', route: '/sistema/reportes/paises' },
          { label: 'R. Departamentos', icon: '🏛️', route: '/sistema/reportes/departamentos' },
          { label: 'R. Municipios', icon: '🏘️', route: '/sistema/reportes/municipios' },
          { label: 'R. Barrios', icon: '🏠', route: '/sistema/reportes/barrios' },
          { label: 'R. Causales', icon: '📋', route: '/sistema/reportes/causales' },
          { label: 'R. Centros de costos', icon: '💰', route: '/sistema/reportes/centros-costos' },
          { label: 'R. Unidades', icon: '📦', route: '/sistema/reportes/unidades' },
          { label: 'Diccionario de datos - erpjsp7', icon: '📖', route: '/sistema/reportes/diccionario-datos' }
        ]
      },
      {
        label: 'Paz y salvo STM',
        icon: '✅',
        children: [
          { label: 'Registro paz y salvo STM', icon: '📝', route: '/sistema/paz-salvo/registro' }
        ]
      },
      { label: 'Cambio de password desde afuera', icon: '🔓', route: '/sistema/password-externo' },
      { label: 'Cambio de password', icon: '🔑', route: '/sistema/password' },
      { label: 'Asignación pregunta de seguridad', icon: '❓', route: '/sistema/pregunta-seguridad' }
    ]
  }
];