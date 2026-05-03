import { Component, EventEmitter, Output, Input, inject } from '@angular/core';
import { CardService } from '../../services/card.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: `
    <nav class="navbar">
      <div class="brand">
        <span class="icon">🏰</span>
        <h1>Oziyama</h1>
        <span class="subtitle">Event Manager</span>
      </div>
      <div class="actions">
        <!-- SESSION CONTROLS -->
        @if (!cardService.isSessionActive()) {
          <button class="session-btn start" (click)="cardService.startSession()">
            ▶️ Oyun Başlat
          </button>
        } @else {
          <button class="session-btn end" (click)="cardService.endSession()">
            ⏹️ Oyunu Bitir
          </button>
        }
        
        <div class="divider"></div>

        <button 
          [class.active]="currentView === 'map'" 
          (click)="viewChange.emit('map')">
          Map View
        </button>
        <button 
          [class.active]="currentView === 'manager'" 
          (click)="viewChange.emit('manager')">
          Card Manager
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background-color: var(--bg-panel);
      border-bottom: var(--border-gold);
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: var(--shadow-glow);
    }
    .brand {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }
    .icon {
      font-size: 1.5rem;
    }
    h1 {
      color: var(--accent-gold);
      margin: 0;
      font-size: 1.8rem;
      text-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 0.9rem;
      font-family: var(--font-ui);
    }
    .actions {
      display: flex;
      gap: 1rem;
    }
    .actions button {
      padding: 0.5rem 1rem;
      color: var(--text-muted);
      border: 1px solid transparent;
      border-radius: 4px;
      font-family: var(--font-ui);
      font-weight: 600;
    }
    .actions button:hover {
      color: var(--text-main);
      background: rgba(255,255,255,0.05);
    }
    .actions button.active {
      color: var(--accent-gold);
      border-color: var(--accent-gold);
      background: rgba(212, 175, 55, 0.1);
    }
    .divider {
      width: 1px;
      height: 24px;
      background: rgba(255,255,255,0.1);
      margin: 0 0.5rem;
    }
    .session-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .session-btn.start {
      color: var(--accent-green) !important;
      border-color: var(--accent-green) !important;
    }
    .session-btn.start:hover {
      background: rgba(46, 204, 113, 0.1) !important;
    }
    .session-btn.end {
      color: var(--accent-red) !important;
      border-color: var(--accent-red) !important;
    }
    .session-btn.end:hover {
      background: rgba(231, 76, 60, 0.1) !important;
    }
  `]
})
export class NavbarComponent {
  cardService = inject(CardService);
  
  @Input() currentView: 'map' | 'manager' = 'map';
  @Output() viewChange = new EventEmitter<'map' | 'manager'>();
}
