import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface QuickLink {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  authService = inject(AuthService);

  currentDate = new Date();
  greeting = '';

  quickLinks: QuickLink[] = [
    {
      title: 'PAT Dashboard',
      description: 'Ver métricas y avances del Plan de Acción',
      icon: '📊',
      route: '/pat/dashboard',
      color: '#667eea'
    },
    {
      title: 'Programas',
      description: 'Gestionar programas del PAT',
      icon: '📋',
      route: '/pat/programs',
      color: '#48bb78'
    },
    {
      title: 'Reportes',
      description: 'Generar reportes y estadísticas',
      icon: '📈',
      route: '/reports',
      color: '#ed8936'
    },
    {
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: '⚙️',
      route: '/settings',
      color: '#9f7aea'
    }
  ];

  stats: StatCard[] = [
    {
      title: 'Programas Activos',
      value: '12',
      change: '+2 este mes',
      trend: 'up',
      icon: '📁'
    },
    {
      title: 'Avance Global',
      value: '67%',
      change: '+5% vs anterior',
      trend: 'up',
      icon: '📈'
    },
    {
      title: 'Presupuesto Ejecutado',
      value: '$2.4M',
      change: '58% del total',
      trend: 'neutral',
      icon: '💰'
    },
    {
      title: 'Tareas Pendientes',
      value: '8',
      change: '-3 desde ayer',
      trend: 'down',
      icon: '📝'
    }
  ];

  ngOnInit(): void {
    this.setGreeting();
  }

  private setGreeting(): void {
    const hour = this.currentDate.getHours();
    
    if (hour < 12) {
      this.greeting = 'Buenos días';
    } else if (hour < 18) {
      this.greeting = 'Buenas tardes';
    } else {
      this.greeting = 'Buenas noches';
    }
  }

  getUserName(): string {
    const user = this.authService.currentUser();
    return user?.firstName || user?.username || 'Usuario';
  }
}