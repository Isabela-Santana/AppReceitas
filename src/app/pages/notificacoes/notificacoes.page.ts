import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para o *ngIf e *ngFor
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, 
  IonBadge, IonButton, IonIcon, IonRefresher, IonRefresherContent, 
  IonList, IonItemSliding, IonItem, IonLabel, IonNote, IonItemOptions, 
  IonItemOption, IonSkeletonText 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons'; // Para os ícones funcionarem
import { checkmarkDoneOutline, chevronDownCircleOutline, trashOutline, informationCircle, checkmarkCircle } from 'ionicons/icons';

@Component({
  selector: 'app-notificacoes',
  templateUrl: './notificacoes.page.html',
  styleUrls: ['./notificacoes.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
    IonBackButton, IonBadge, IonButton, IonIcon, IonRefresher, 
    IonRefresherContent, IonList, IonItemSliding, IonItem, IonLabel, 
    IonNote, IonItemOptions, IonItemOption, IonSkeletonText
  ]
})
export class NotificacoesPage implements OnInit {
  
  // Propriedades que o HTML exige
  isLoading: boolean = true;
  unreadCount: number = 2;
  activeFilter: string = 'todas';
  notifications: any[] = [];
  filteredNotifications: any[] = [];

  constructor() {
    // Registra os ícones usados no HTML
    addIcons({ 
      checkmarkDoneOutline, 
      chevronDownCircleOutline, 
      trashOutline, 
      informationCircle, 
      checkmarkCircle 
    });
  }

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.isLoading = true;
    
    // Simulação de dados vindo do Firebase
    setTimeout(() => {
      this.notifications = [
        {
          id: 1,
          user: 'Maria Silva',
          userAvatar: 'MS',
          message: 'curtiu sua receita',
          recipeTitle: 'Bolo de Cenoura',
          time: '5 min',
          read: false,
          type: 'success'
        },
        {
          id: 2,
          user: 'Admin',
          userAvatar: 'A',
          message: 'sua receita foi aprovada!',
          recipeTitle: 'Lasanha Vegana',
          time: '1 hora',
          read: false,
          type: 'info'
        }
      ];
      this.applyFilter();
      this.isLoading = false;
      this.updateUnreadCount();
    }, 1500);
  }

  handleRefresh(event: any) {
    this.loadNotifications();
    event.target.complete();
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter() {
    if (this.activeFilter === 'nao_lidas') {
      this.filteredNotifications = this.notifications.filter(n => !n.read);
    } else {
      this.filteredNotifications = [...this.notifications];
    }
  }

  markAsRead(notification: any) {
    notification.read = true;
    this.updateUnreadCount();
    this.applyFilter();
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.updateUnreadCount();
    this.applyFilter();
  }

  deleteNotification(id: any) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.updateUnreadCount();
    this.applyFilter();
  }

  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  // Métodos auxiliares de estilo
  getColorForType(type: string) {
    return type === 'info' ? '#3880ff' : '#2dd36f';
  }

  getIconForType(type: string) {
    return type === 'info' ? 'information-circle' : 'checkmark-circle';
  }
}