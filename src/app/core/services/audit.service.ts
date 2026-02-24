// import { Injectable } from '@angular/core';
// import { Observable, of, BehaviorSubject } from 'rxjs';
// import { delay, map } from 'rxjs/operators';
// import { AuditLog, ApiResponse, AuditAction } from '../../features/pat/models/pat.models';
// import { MOCK_AUDIT_LOGS } from '../data/mock-data';

// export interface AuditLogInput {
//   entidad: string;
//   entidadId: number;
//   accion: AuditAction;
//   usuario: string;
//   valorAnterior: any;
//   valorNuevo: any;
//   descripcion?: string;
// }

// /**
//  * Servicio de auditoría para trazabilidad
//  * Registra todas las acciones del sistema
//  */
// @Injectable({
//   providedIn: 'root'
// })
// export class AuditService {
  
//   private auditLogs: AuditLog[] = [...MOCK_AUDIT_LOGS];
//   private readonly API_DELAY = 200;
  
//   // Observable para notificar nuevos logs
//   private logsSubject = new BehaviorSubject<AuditLog[]>(this.auditLogs);
//   public logs$ = this.logsSubject.asObservable();

//   constructor() {}

//   // ============================================
//   // GET /api/audit-log
//   // ============================================
//   getAuditLogs(filters?: {
//     entidad?: string;
//     entidadId?: number;
//     usuario?: string;
//     fechaDesde?: string;
//     fechaHasta?: string;
//   }): Observable<ApiResponse<AuditLog[]>> {
//     let filtered = [...this.auditLogs];

//     if (filters) {
//       if (filters.entidad) {
//         filtered = filtered.filter(l => l.entidad === filters.entidad);
//       }
//       if (filters.entidadId) {
//         filtered = filtered.filter(l => l.entidadId === filters.entidadId);
//       }
//       if (filters.usuario) {
//         filtered = filtered.filter(l => 
//           l.usuario.toLowerCase().includes(filters.usuario!.toLowerCase())
//         );
//       }
//       if (filters.fechaDesde) {
//         filtered = filtered.filter(l => l.fecha >= filters.fechaDesde!);
//       }
//       if (filters.fechaHasta) {
//         filtered = filtered.filter(l => l.fecha <= filters.fechaHasta!);
//       }
//     }

//     // Ordenar por fecha descendente
//     filtered.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

//     return of(filtered).pipe(
//       delay(this.API_DELAY),
//       map(logs => ({
//         success: true,
//         data: logs,
//         timestamp: new Date().toISOString()
//       }))
//     );
//   }

//   // ============================================
//   // POST /api/audit-log
//   // ============================================
//   logAction(input: AuditLogInput): void {
//     const newLog: AuditLog = {
//       id: Math.max(...this.auditLogs.map(l => l.id), 0) + 1,
//       ...input,
//       fecha: new Date().toISOString()
//     };

//     this.auditLogs.push(newLog);
//     this.logsSubject.next([...this.auditLogs]);

//     // Log en consola para debugging
//     console.log('[AUDIT]', {
//       accion: input.accion,
//       entidad: input.entidad,
//       descripcion: input.descripcion,
//       timestamp: newLog.fecha
//     });
//   }

//   // ============================================
//   // GET /api/audit-log/entity/{entidad}/{id}
//   // ============================================
//   getAuditByEntity(entidad: string, entidadId: number): Observable<ApiResponse<AuditLog[]>> {
//     return this.getAuditLogs({ entidad, entidadId });
//   }

//   // ============================================
//   // Estadísticas de auditoría
//   // ============================================
//   getAuditStats(): Observable<{
//     totalRegistros: number;
//     porEntidad: Record<string, number>;
//     porAccion: Record<string, number>;
//   }> {
//     return of({
//       totalRegistros: this.auditLogs.length,
//       porEntidad: this.groupBy(this.auditLogs, 'entidad'),
//       porAccion: this.groupBy(this.auditLogs, 'accion')
//     }).pipe(delay(100));
//   }

//   private groupBy(items: AuditLog[], key: keyof AuditLog): Record<string, number> {
//     return items.reduce((acc, item) => {
//       const value = String(item[key]);
//       acc[value] = (acc[value] || 0) + 1;
//       return acc;
//     }, {} as Record<string, number>);
//   }
// }

// src/app/core/services/audit.service.ts

import { Injectable } from '@angular/core';
import { Observable, of, delay, BehaviorSubject } from 'rxjs';
import { AuditLog } from '../../features/pat/models/pat.models';
import { MOCK_AUDIT_LOGS } from '../data/pat-mock-data';

export interface AuditLogInput {
  entidad: string;
  entidadId: number;
  accion: 'CREATE' | 'UPDATE' | 'DELETE';
  valorAnterior: any;
  valorNuevo: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private logs: AuditLog[] = [...MOCK_AUDIT_LOGS];
  private logsSubject = new BehaviorSubject<AuditLog[]>(this.logs);

  private readonly CURRENT_USER = 'usuario.activo@camaracomercio.org';

  /**
   * GET /api/audit-log
   */
  getAuditLogs(): Observable<AuditLog[]> {
    return of([...this.logs].sort((a, b) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    )).pipe(delay(200));
  }

  /**
   * GET /api/audit-log?entidad={entidad}&entidadId={id}
   */
  getAuditLogsByEntity(entidad: string, entidadId: number): Observable<AuditLog[]> {
    const filtered = this.logs.filter(
      l => l.entidad === entidad && l.entidadId === entidadId
    );
    return of(filtered).pipe(delay(200));
  }

  /**
   * Registrar evento de auditoría
   */
  log(input: AuditLogInput): void {
    const newLog: AuditLog = {
      id: Math.max(...this.logs.map(l => l.id), 0) + 1,
      entidad: input.entidad,
      entidadId: input.entidadId,
      accion: input.accion,
      usuario: this.CURRENT_USER,
      fecha: new Date().toISOString(),
      valorAnterior: input.valorAnterior,
      valorNuevo: input.valorNuevo
    };

    this.logs.push(newLog);
    this.logsSubject.next(this.logs);
    
    console.log('[AUDIT]', newLog);
  }

  /**
   * Observable para suscribirse a cambios en tiempo real
   */
  get logs$(): Observable<AuditLog[]> {
    return this.logsSubject.asObservable();
  }
}