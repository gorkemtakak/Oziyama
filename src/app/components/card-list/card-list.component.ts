import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardService } from '../../services/card.service';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="list-container">
      <div class="header-row">
        <h3>Available Cards ({{ filteredCards().length }})</h3>
        
        <div class="filters">
          <input 
            type="text" 
            class="search-input" 
            [(ngModel)]="searchQuery" 
            placeholder="İsimle ara..."
          >
          
          <select class="type-filter" [(ngModel)]="selectedType">
            <option value="all">Tüm Tipler</option>
            <option value="event">Event</option>
            <option value="encounter">Encounter</option>
            <option value="treasure">Treasure</option>
            <option value="curse">Curse</option>
            <option value="chain event">Chain Event</option>
          </select>
        </div>
      </div>
      
      <div class="card-grid">
        @for (card of filteredCards(); track card.id) {
          <div class="mini-card" [class]="card.type.replace(' ', '-')">
            <div class="card-header">
              <span class="type">{{ card.type }}</span>
              <div class="actions">
                <button class="edit-btn" (click)="editCard(card)" title="Edit">✎</button>
                <button class="delete-btn" (click)="deleteCard(card.id)" title="Delete">×</button>
              </div>
            </div>
            <h4>{{ card.title }}</h4>
            <p class="desc">{{ card.description | slice:0:60 }}...</p>
          </div>
        }
        
        @if (filteredCards().length === 0) {
          <div class="no-results">
            Aradığınız kriterlere uygun kart bulunamadı.
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .list-container {
      margin-top: 2rem;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    h3 {
      color: var(--text-muted);
      margin: 0;
      font-size: 1.2rem;
    }
    .filters {
      display: flex;
      gap: 0.5rem;
    }
    .search-input, .type-filter {
      background: var(--bg-dark);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-main);
      padding: 0.5rem 0.8rem;
      border-radius: 4px;
      font-family: var(--font-ui);
      font-size: 0.9rem;
    }
    .search-input:focus, .type-filter:focus {
      outline: none;
      border-color: var(--accent-gold);
    }
    
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    .mini-card {
      background: var(--bg-card);
      padding: 1rem;
      border-radius: 6px;
      border-top: 3px solid #555;
      position: relative;
    }
    .mini-card.event { border-top-color: var(--accent-blue); }
    .mini-card.encounter { border-top-color: var(--accent-red); }
    .mini-card.treasure { border-top-color: var(--accent-gold); }
    .mini-card.curse { border-top-color: var(--accent-purple); }
    .mini-card.chain-event { border-top-color: #e67e22; }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .type {
      font-size: 0.7rem;
      text-transform: uppercase;
      color: var(--text-muted);
      letter-spacing: 1px;
    }
    .actions {
      display: flex;
      gap: 0.5rem;
    }
    .edit-btn {
      color: var(--accent-gold);
      font-size: 1.1rem;
      line-height: 1;
      opacity: 0.7;
    }
    .delete-btn {
      color: var(--accent-red);
      font-size: 1.2rem;
      line-height: 1;
      opacity: 0.7;
    }
    .edit-btn:hover, .delete-btn:hover {
      opacity: 1;
    }
    h4 {
      font-family: var(--font-ui);
      font-size: 1rem;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }
    .desc {
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.4;
    }
    .no-results {
      grid-column: 1 / -1;
      text-align: center;
      padding: 2rem;
      color: var(--text-muted);
      font-style: italic;
      background: rgba(0,0,0,0.2);
      border-radius: 6px;
    }
  `]
})
export class CardListComponent {
  private cardService = inject(CardService);
  
  // Expose the signal
  cards = this.cardService.cards;
  
  // Filter state
  searchQuery = signal('');
  selectedType = signal('all');

  filteredCards = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const type = this.selectedType();
    
    return this.cards().filter(card => {
      const matchesSearch = card.title.toLowerCase().includes(query) || 
                            card.description.toLowerCase().includes(query);
      const matchesType = type === 'all' || card.type === type;
      
      return matchesSearch && matchesType;
    });
  });

  editCard(card: any) {
    this.cardService.setEditingCard(card);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteCard(id: string) {
    if (confirm('Are you sure you want to delete this card?')) {
      this.cardService.deleteCard(id);
    }
  }
}
