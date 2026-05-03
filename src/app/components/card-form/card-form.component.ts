import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardService } from '../../services/card.service';
import { CardType, CardOption } from '../../models/event-card.model';

@Component({
  selector: 'app-card-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-container">
      <h3>{{ isEditMode ? 'Edit Card' : 'Add New Card' }}</h3>
      
      <form (ngSubmit)="onSubmit()" #cardForm="ngForm">
        
        <!-- BASIC INFO -->
        <div class="form-section">
          <div class="form-group">
            <label>Title</label>
            <input type="text" [(ngModel)]="title" name="title" required placeholder="e.g. Goblin Ambush">
          </div>
          
          <div class="form-group">
            <label>Type</label>
            <select [(ngModel)]="type" name="type" required>
              <option value="event">Event</option>
              <option value="encounter">Encounter</option>
              <option value="treasure">Treasure</option>
              <option value="curse">Curse</option>
              <option value="chain event">Chain Event</option>
            </select>
          </div>
            
          <div class="form-group map-settings-group">
            <label>Harita / Bölge</label>
            
            <label class="checkbox-label global-check">
              <input type="checkbox" [(ngModel)]="isGlobal" name="isGlobal">
              🌍 Tüm Haritalarda (Global)
            </label>
            
            @if (!isGlobal) {
              <select [(ngModel)]="mapRegion" name="mapRegion" required class="mt-2">
                <option value="mistyhighlans">Misty Highlands</option>
              </select>
            }
            
            <div class="mt-2" style="background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 4px;">
              <label style="color: var(--accent-gold); display: block; margin-bottom: 0.3rem;">Çekilme Sınırı</label>
              
              <label class="radio-label">
                <input type="radio" [(ngModel)]="drawLimit" name="drawLimit" value="unlimited">
                Sınırsız Çekilebilir
              </label>
              <label class="radio-label">
                <input type="radio" [(ngModel)]="drawLimit" name="drawLimit" value="session">
                Session başına sadece 1 kez (Tüm Harita İçin)
              </label>
              <label class="radio-label">
                <input type="radio" [(ngModel)]="drawLimit" name="drawLimit" value="player">
                Her oyuncu için session başına 1 kez
              </label>
            </div>
            
            <div class="mt-2" style="background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 4px;">
              <label style="color: var(--accent-gold); display: block; margin-bottom: 0.3rem;">Tetiklenme Zamanı (Bu karta yönlendirme yapıldığında)</label>
              
              <label class="radio-label">
                <input type="radio" [(ngModel)]="triggerMode" name="triggerMode" value="immediate">
                Anında Ekrana Gelir
              </label>
              <label class="radio-label">
                <input type="radio" [(ngModel)]="triggerMode" name="triggerMode" value="pending">
                Oyuncunun "Bekleyen Event" listesine düşer (Haritada gezerken şansa çıkar)
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label>Story / Description</label>
            <textarea [(ngModel)]="description" name="description" required rows="3" placeholder="What happens in this card?"></textarea>
          </div>
        </div>
        
        <!-- OPTIONS WITH FORWARD MAPPING -->
        <div class="form-section bg-alt">
          <div class="section-header">
            <label>Bu Kartın Şıkları ve Hedefleri (Options & Targets)</label>
            <button type="button" class="add-btn" (click)="addOption()">+ Şık Ekle</button>
          </div>
          
          <div class="options-list">
            @for (opt of options; track opt.id; let i = $index) {
              <div class="option-row">
                <div class="option-row-main">
                  <input type="text" class="opt-text" [(ngModel)]="opt.text" name="opt_text_{{i}}" placeholder="Seçenek metni..." required>
                  
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="opt.requiresDice" name="opt_dice_{{i}}">
                    Zar İster
                  </label>
                  
                  @if (opt.requiresDice) {
                    <input type="text" class="opt-qty" [(ngModel)]="opt.diceQty" name="opt_qty_{{i}}" placeholder="Zar (Örn: 15)">
                  }
                  
                  <button type="button" class="remove-btn" (click)="removeOption(i)">×</button>
                </div>
                
                <div class="option-row-targets">
                  @if (!opt.requiresDice) {
                    <div class="target-field">
                      <span class="arrow">➜ Hedef:</span>
                      <select class="target-select" [(ngModel)]="opt.nextCardId" name="opt_next_{{i}}">
                        <option [value]="undefined">-- Kartı Kapat --</option>
                        @for (c of availableCards(); track c.id) {
                          @if (c.id !== editingId) {
                            <option [value]="c.id">[{{ c.type | uppercase }}] {{ c.title }}</option>
                          }
                        }
                      </select>
                    </div>
                  } @else {
                    <div class="target-field win-target">
                      <span class="arrow">⚔️ BAŞARILI (Win) ➜</span>
                      <select class="target-select" [(ngModel)]="opt.winCardId" name="opt_win_{{i}}">
                        <option [value]="undefined">-- Kartı Kapat --</option>
                        @for (c of availableCards(); track c.id) {
                          @if (c.id !== editingId) {
                            <option [value]="c.id">[{{ c.type | uppercase }}] {{ c.title }}</option>
                          }
                        }
                      </select>
                    </div>
                    <div class="target-field fail-target">
                      <span class="arrow">💀 BAŞARISIZ (Fail) ➜</span>
                      <select class="target-select" [(ngModel)]="opt.failCardId" name="opt_fail_{{i}}">
                        <option [value]="undefined">-- Kartı Kapat --</option>
                        @for (c of availableCards(); track c.id) {
                          @if (c.id !== editingId) {
                            <option [value]="c.id">[{{ c.type | uppercase }}] {{ c.title }}</option>
                          }
                        }
                      </select>
                    </div>
                  }
                </div>
              </div>
            }
            @if (options.length === 0) {
              <p class="empty-hint">Bu kartın kendi şıkkı yok. Tıklanınca kapanacak.</p>
            }
          </div>
        </div>
        
        <!-- FLAVOR & ACTIONS -->
        <div class="form-group" style="margin-top: 1rem;">
          <label>Flavor Text (Optional)</label>
          <input type="text" [(ngModel)]="flavor" name="flavor" placeholder='"A quote goes here"'>
        </div>
        
        <div class="form-actions">
          <button type="submit" [disabled]="!cardForm.form.valid" class="submit-btn">
            {{ isEditMode ? 'Update Card' : 'Add Card' }}
          </button>
          
          @if (isEditMode) {
            <button type="button" class="cancel-btn" (click)="cancelEdit()">Cancel</button>
          }
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      background: var(--bg-panel);
      padding: 2rem;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.05);
      margin-bottom: 2rem;
    }
    h3 {
      color: var(--accent-gold);
      margin-bottom: 1.5rem;
    }
    .form-section {
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .form-row {
      display: flex;
      gap: 1rem;
    }
    .half-width {
      flex: 1;
    }
    .map-settings-group {
      background: rgba(46, 204, 113, 0.05);
      padding: 0.8rem;
      border-radius: 4px;
      border: 1px solid rgba(46, 204, 113, 0.2);
    }
    .global-check {
      color: var(--accent-green) !important;
      font-weight: bold !important;
    }
    .mt-2 { margin-top: 0.5rem; }
    
    .bg-alt {
      background: rgba(0,0,0,0.2);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 6px;
      padding: 1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .empty-hint {
      font-size: 0.85rem;
      color: #666;
      font-style: italic;
    }
    .add-btn {
      background: rgba(52, 152, 219, 0.1);
      color: var(--accent-blue);
      border: 1px solid var(--accent-blue);
      padding: 0.3rem 0.8rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    .add-btn:hover {
      background: var(--accent-blue);
      color: #fff;
    }
    .options-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .option-row {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      background: rgba(0,0,0,0.3);
      padding: 0.8rem;
      border-radius: 6px;
      border-left: 3px solid var(--accent-gold);
    }
    .option-row-main {
      display: flex;
      gap: 0.8rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .option-row-targets {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .target-field {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
    }
    .win-target .arrow { color: var(--accent-green); }
    .fail-target .arrow { color: var(--accent-red); }
    
    .target-select {
      flex: 1;
      max-width: 250px;
      padding: 0.4rem;
      font-size: 0.85rem;
    }
    
    .opt-text {
      flex: 2;
      min-width: 150px;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.8rem;
      cursor: pointer;
      color: #ccc;
    }
    .radio-label {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.8rem;
      cursor: pointer;
      color: #ccc;
      margin-bottom: 0.3rem;
    }
    .opt-qty {
      width: 80px;
      text-align: center;
    }
    
    .arrow {
      color: var(--accent-gold);
      font-weight: bold;
    }
    .remove-btn {
      color: var(--accent-red);
      font-size: 1.2rem;
      padding: 0 0.5rem;
      opacity: 0.7;
      margin-left: auto;
    }
    .remove-btn:hover { opacity: 1; }
    
    label {
      font-family: var(--font-ui);
      font-size: 0.9rem;
      color: var(--text-muted);
      font-weight: bold;
    }
    input[type="text"], select, textarea {
      background: var(--bg-dark);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-main);
      padding: 0.8rem;
      border-radius: 4px;
      font-family: var(--font-ui);
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--accent-gold);
    }
    
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .submit-btn {
      background: var(--accent-gold);
      color: var(--bg-dark);
      padding: 0.8rem 1.5rem;
      border-radius: 4px;
      font-weight: bold;
      flex: 1;
    }
    .submit-btn:hover:not(:disabled) {
      background: var(--accent-gold-hover);
    }
    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .cancel-btn {
      background: transparent;
      border: 1px solid var(--accent-red);
      color: var(--accent-red);
      padding: 0.8rem 1.5rem;
      border-radius: 4px;
      font-weight: bold;
    }
    .cancel-btn:hover {
      background: rgba(231, 76, 60, 0.1);
    }
  `]
})
export class CardFormComponent {
  private cardService = inject(CardService);
  
  isEditMode = false;
  editingId: string | null = null;

  title = '';
  type: CardType = 'event';
  description = '';
  flavor = '';
  isGlobal = false;
  mapRegion = 'mistyhighlans';
  drawLimit: 'unlimited' | 'session' | 'player' = 'unlimited';
  triggerMode: 'immediate' | 'pending' = 'immediate';
  
  options: CardOption[] = [];

  availableCards = this.cardService.cards;

  constructor() {
    effect(() => {
      const card = this.cardService.editingCard();
      if (card) {
        if (this.editingId !== card.id) {
          this.isEditMode = true;
          this.editingId = card.id;
          this.title = card.title;
          this.type = card.type;
          this.description = card.description;
          this.flavor = card.flavor || '';
          this.isGlobal = card.isGlobal || false;
          this.mapRegion = card.mapRegion || 'mistyhighlans';
          // Backward compatibility check inside effect
          this.drawLimit = card.drawLimit || ((card as any).oncePerSession ? 'session' : 'unlimited');
          this.triggerMode = card.triggerMode || 'immediate';
          
          this.options = card.options ? JSON.parse(JSON.stringify(card.options)) : [];
        }
      } else {
        if (this.isEditMode) {
          this.resetForm();
        }
      }
    });
  }

  addOption() {
    this.options.push({ 
      id: crypto.randomUUID(), 
      text: '', 
      requiresDice: false 
    });
  }

  removeOption(index: number) {
    this.options.splice(index, 1);
  }

  onSubmit() {
    if (this.title && this.description) {
      const processedOptions = this.options.map(opt => {
        // Eğer kullanıcı sadece hedef seçip metin yazmayı unuttuysa otomatik doldur
        if ((!opt.text || opt.text.trim() === '') && 
            (opt.nextCardId !== undefined && opt.nextCardId !== 'undefined' || 
             opt.winCardId !== undefined && opt.winCardId !== 'undefined')) {
          return { ...opt, text: 'Devam Et...' };
        }
        return opt;
      }).filter(opt => opt.text && opt.text.trim() !== '');
      
      const cardData = {
        title: this.title,
        type: this.type,
        description: this.description,
        flavor: this.flavor || undefined,
        isGlobal: this.isGlobal,
        mapRegion: this.isGlobal ? undefined : this.mapRegion,
        drawLimit: this.drawLimit,
        triggerMode: this.triggerMode,
        options: processedOptions.length > 0 ? processedOptions : undefined
      };

      if (this.isEditMode && this.editingId) {
        const originalCard = this.cardService.editingCard();
        if (originalCard) {
          this.cardService.updateCard({
            ...originalCard,
            ...cardData
          });
        }
      } else {
        this.cardService.addCard(cardData);
      }
      
      this.resetForm();
    }
  }

  cancelEdit() {
    this.cardService.setEditingCard(null);
  }

  private resetForm() {
    this.isEditMode = false;
    this.editingId = null;
    this.title = '';
    this.type = 'event';
    this.description = '';
    this.flavor = '';
    this.isGlobal = false;
    this.mapRegion = 'mistyhighlans';
    this.drawLimit = 'unlimited';
    this.triggerMode = 'immediate';
    this.options = [];
  }
}
