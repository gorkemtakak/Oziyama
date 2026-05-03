import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardService } from '../../services/card.service';
import { Player } from '../../models/player.model';

@Component({
  selector: 'app-player-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (cardService.isSettingUpSession()) {
      <div class="modal-overlay">
        <div class="modal-content">
          <h3>Oyun Kurulumu</h3>
          <p class="subtitle">Session'da yer alacak oyuncuları tanımlayın (Min: 2, Max: 4)</p>
          
          <div class="players-list">
            @for (player of players; track i; let i = $index) {
              <div class="player-row">
                <span class="player-num">{{ i + 1 }}.</span>
                <input type="text" [(ngModel)]="player.name" placeholder="Oyuncu Adı" required>
                <input type="color" [(ngModel)]="player.color" title="Oyuncu Rengi">
                
                @if (players.length > 2) {
                  <button class="remove-btn" (click)="removePlayer(i)" title="Oyuncuyu Sil">×</button>
                }
              </div>
            }
          </div>
          
          <div class="actions-row">
            <button class="add-btn" (click)="addPlayer()" [disabled]="players.length >= 4">
              + Yeni Oyuncu Ekle
            </button>
          </div>
          
          <div class="footer-actions">
            <button class="cancel-btn" (click)="cancel()">İptal</button>
            <button class="start-btn" (click)="start()" [disabled]="!isValid()">Oyunu Başlat</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(5px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background: var(--bg-panel);
      padding: 2rem;
      border-radius: 8px;
      border: 1px solid var(--accent-gold);
      min-width: 400px;
      box-shadow: 0 0 20px rgba(0,0,0,0.5);
    }
    h3 {
      color: var(--accent-gold);
      margin-top: 0;
      margin-bottom: 0.5rem;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-bottom: 1.5rem;
    }
    .players-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .player-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(0,0,0,0.2);
      padding: 0.8rem;
      border-radius: 4px;
    }
    .player-num {
      color: var(--text-muted);
      font-weight: bold;
      width: 20px;
    }
    input[type="text"] {
      flex: 1;
      background: var(--bg-dark);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-main);
      padding: 0.5rem;
      border-radius: 4px;
      font-family: var(--font-ui);
    }
    input[type="text"]:focus {
      outline: none;
      border-color: var(--accent-gold);
    }
    input[type="color"] {
      width: 35px;
      height: 35px;
      padding: 0;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: transparent;
    }
    .remove-btn {
      color: var(--accent-red);
      font-size: 1.2rem;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0 0.5rem;
    }
    .remove-btn:hover {
      opacity: 0.8;
    }
    .actions-row {
      margin-bottom: 2rem;
    }
    .add-btn {
      background: rgba(52, 152, 219, 0.1);
      color: var(--accent-blue);
      border: 1px dashed var(--accent-blue);
      width: 100%;
      padding: 0.8rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .add-btn:hover:not(:disabled) {
      background: rgba(52, 152, 219, 0.2);
    }
    .add-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .footer-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
    .cancel-btn {
      background: transparent;
      border: 1px solid var(--text-muted);
      color: var(--text-muted);
      padding: 0.6rem 1.2rem;
      border-radius: 4px;
      cursor: pointer;
    }
    .cancel-btn:hover {
      background: rgba(255,255,255,0.05);
      color: var(--text-main);
    }
    .start-btn {
      background: var(--accent-green);
      color: var(--bg-dark);
      border: none;
      padding: 0.6rem 1.5rem;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
    }
    .start-btn:hover:not(:disabled) {
      opacity: 0.9;
    }
    .start-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class PlayerSetupComponent {
  public cardService = inject(CardService);
  
  // Default 2 players
  players: Omit<Player, 'id'>[] = [
    { name: 'Savaşçı', color: '#e74c3c' },
    { name: 'Büyücü', color: '#3498db' }
  ];

  colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'];

  addPlayer() {
    if (this.players.length < 4) {
      this.players.push({
        name: `Oyuncu ${this.players.length + 1}`,
        color: this.colors[this.players.length] || '#ffffff'
      });
    }
  }

  removePlayer(index: number) {
    if (this.players.length > 2) {
      this.players.splice(index, 1);
    }
  }

  isValid() {
    return this.players.every(p => p.name.trim() !== '') && this.players.length >= 2;
  }

  cancel() {
    this.cardService.isSettingUpSession.set(false);
  }

  start() {
    if (this.isValid()) {
      this.cardService.startSession(this.players);
      this.cardService.isSettingUpSession.set(false);
    }
  }
}
