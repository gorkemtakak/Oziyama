import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardService } from '../../services/card.service';
import { CardType, CardOption, MerchantItem } from '../../models/event-card.model';
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
          @if (type !== 'merchant') {
            <div class="form-group">
              <label>Title</label>
              <input type="text" [(ngModel)]="title" name="title" required placeholder="e.g. Goblin Ambush">
            </div>
          }
          
          <div class="form-group">
            <label>Type</label>
            <select [(ngModel)]="type" name="type" required>
              <option value="event">Event</option>
              <option value="encounter">Encounter</option>
              <option value="treasure">Treasure</option>
              <option value="curse">Curse</option>
              <option value="chain event">Chain Event</option>
              <option value="merchant">Merchant</option>
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


            @if (!isGlobal) {
              <div class="mt-3 marker-selector-section">
                <button type="button" class="toggle-map-btn" (click)="showMapSelector = true">
                  📍 Spawn Noktalarını Seç ({{ allowedMarkers.length }})
                </button>
                
                @if (showMapSelector) {
                  <div class="map-picker-modal-overlay" (click)="showMapSelector = false">
                    <div class="map-picker-modal-content" (click)="$event.stopPropagation()">
                      <div class="modal-header">
                        <h4>Spawn Noktası Seçimi</h4>
                        <button type="button" class="close-modal-btn" (click)="showMapSelector = false">×</button>
                      </div>
                      <p class="map-hint">Kartın hangi ikonlarda çıkabileceğini seçin. Hiçbirini seçmezseniz tüm ikonlarda çıkabilir.</p>
                      <div class="map-scroll-area">
                        <div class="mini-map-wrapper">
                          <img [src]="'assets/' + mapRegion + '.jpeg'" class="mini-map-img">
                          @for (m of getMarkersForRegion(); track m.id) {
                            <div class="mini-marker" 
                                 [class.selected]="allowedMarkers.includes(m.id)"
                                 [style.left.%]="m.x" 
                                 [style.top.%]="m.y"
                                 (click)="toggleMarker(m.id)"
                                 [title]="m.id">
                            </div>
                          }
                        </div>
                      </div>
                      <div class="modal-footer">
                         <button type="button" class="save-modal-btn" (click)="showMapSelector = false">Seçimi Tamamla</button>
                      </div>
                    </div>
                  </div>
                }
              </div>
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
                <input type="radio" [(ngModel)]="drawLimit" name="drawLimit" value="region">
                Harita bölgesi başına sadece 1 kez
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
          
          @if (type !== 'merchant') {
            <div class="form-group">
              <label>Story / Description</label>
              <textarea [(ngModel)]="description" name="description" required rows="3" placeholder="What happens in this card?"></textarea>
            </div>
          }
          
          @if (type === 'merchant') {
            <div class="form-group mt-3" style="background: rgba(243, 156, 18, 0.1); padding: 1.5rem; border: 1px solid var(--accent-gold); border-radius: 6px;">
              <h4 style="color: var(--accent-gold); margin-top: 0; margin-bottom: 1rem;">Tüccar Bilgileri</h4>
              
              <div class="form-row" style="flex-wrap: wrap;">
                <div class="form-group" style="flex: 1 1 200px;">
                  <label>Tüccar Adı</label>
                  <input type="text" [(ngModel)]="merchantName" name="merchantName" placeholder="Örn: sir ribbit the third">
                </div>
                <div class="form-group" style="flex: 1 1 200px;">
                  <label>Tüccar Altını</label>
                  <input type="number" [(ngModel)]="merchantCoins" name="merchantCoins" placeholder="Örn: 345">
                </div>
              </div>
              
              <div class="form-group mt-3">
                <label>Karşılama / Konuşma</label>
                <textarea [(ngModel)]="description" name="merchantDesc" rows="2" placeholder="Örn: Selamlar! Harika mallarıma bir göz at!"></textarea>
              </div>
              
              <div class="form-group mt-3">
                <label>Tüccar Resmi Yükle</label>
                <input type="file" accept="image/*" (change)="onMerchantImageSelected($event)" class="file-input">
                @if (merchantImage) {
                  <div class="mt-2 preview-img-container">
                    <img [src]="merchantImage" class="preview-img">
                  </div>
                }
              </div>
              
              <div class="mt-4">
                <div class="section-header">
                  <label>Satılan Ürünler ({{ merchantItems.length }}/12)</label>
                  <button type="button" class="add-btn" (click)="openItemModal()" [disabled]="merchantItems.length >= 12">+ Ürün Ekle</button>
                </div>
                
                <div class="merchant-items-grid mt-2">
                  @for (item of merchantItems; track item.id; let i = $index) {
                    <div class="merchant-item-card">
                      <div class="item-img" [style.background-image]="item.imageUrl ? 'url(' + item.imageUrl + ')' : 'none'">
                        @if (!item.imageUrl) {
                          <span>Görsel Yok</span>
                        }
                      </div>
                      <div class="item-info">
                        <div class="item-name">{{ item.name }}</div>
                        <div class="item-price">🪙 {{ item.price }}</div>
                      </div>
                      <div class="item-actions">
                        <button type="button" (click)="openItemModal(item)">✎</button>
                        <button type="button" class="text-red" (click)="removeMerchantItem(i)">×</button>
                      </div>
                    </div>
                  }
                  @if (merchantItems.length === 0) {
                    <p class="empty-hint">Henüz ürün eklenmemiş. En fazla 12 ürün eklenebilir.</p>
                  }
                </div>
              </div>
            </div>
          }
        </div>
        
        @if (type !== 'merchant') {
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
        }
        
        <div class="form-actions">
          <button type="submit" [disabled]="!cardForm.form.valid" class="submit-btn">
            {{ isEditMode ? 'Update Card' : 'Add Card' }}
          </button>
          
          @if (isEditMode) {
            <button type="button" class="cancel-btn" (click)="cancelEdit()">Cancel</button>
          }
        </div>
      </form>
      
      <!-- ITEM EDIT MODAL -->
      @if (showItemModal) {
        <div class="map-picker-modal-overlay" (click)="closeItemModal()">
          <div class="map-picker-modal-content" style="max-width: 500px;" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h4>{{ editingItem ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle' }}</h4>
              <button type="button" class="close-modal-btn" (click)="closeItemModal()">×</button>
            </div>
            
            <div class="form-group mt-2">
              <label>Ürün Adı</label>
              <input type="text" [(ngModel)]="tempItem.name" placeholder="Ürün adı">
            </div>
            
            <div class="form-group mt-2">
              <label>Açıklama</label>
              <textarea [(ngModel)]="tempItem.description" rows="3" placeholder="Ürün açıklaması"></textarea>
            </div>
            
            <div class="form-group mt-2" style="display: flex; gap: 1rem;">
              <div style="flex: 1;">
                <label>Fiyat (Altın)</label>
                <input type="number" [(ngModel)]="tempItem.price" placeholder="0">
              </div>
              <div style="flex: 1;">
                <label>Stok Adedi</label>
                <input type="number" [(ngModel)]="tempItem.count" placeholder="1">
              </div>
            </div>
            
            <div class="form-group mt-2">
              <label>Ürün Resmi Yükle</label>
              <input type="file" accept="image/*" (change)="onItemImageSelected($event)" class="file-input">
              @if (tempItem.imageUrl) {
                <div class="mt-2 preview-img-container" style="max-height: 100px;">
                  <img [src]="tempItem.imageUrl" class="preview-img" style="max-height: 100px;">
                </div>
              }
            </div>
            
            <div class="modal-footer mt-3">
              <button type="button" class="cancel-btn" (click)="closeItemModal()" style="margin-right: 1rem;">İptal</button>
              <button type="button" class="save-modal-btn" (click)="saveItem()">Kaydet</button>
            </div>
          </div>
        </div>
      }
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
    .file-input {
      background: rgba(0,0,0,0.2) !important;
      padding: 0.5rem !important;
      cursor: pointer;
    }
    .file-input::file-selector-button {
      background: var(--accent-gold);
      color: var(--bg-dark);
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
      margin-right: 1rem;
    }
    .preview-img-container {
      background: rgba(0,0,0,0.3);
      padding: 0.5rem;
      border-radius: 4px;
      display: flex;
      justify-content: center;
      border: 1px dashed rgba(255,255,255,0.2);
    }
    .preview-img {
      max-height: 150px;
      max-width: 100%;
      object-fit: contain;
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
    .mt-3 { margin-top: 1rem; }
    
    .marker-selector-section {
      background: rgba(0, 0, 0, 0.2);
      padding: 1rem;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .toggle-map-btn {
      width: 100%;
      background: rgba(52, 152, 219, 0.1);
      color: var(--accent-blue);
      border: 1px solid var(--accent-blue);
      padding: 0.6rem;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
    }
    .toggle-map-btn:hover {
      background: var(--accent-blue);
      color: #fff;
    }
    
    .map-picker-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.8);
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
      backdrop-filter: blur(5px);
    }
    .map-picker-modal-content {
      background: var(--bg-panel);
      border: 1px solid var(--accent-gold);
      border-radius: 8px;
      padding: 1.5rem;
      width: 90vw;
      max-width: 1200px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .modal-header h4 {
      margin: 0;
      color: var(--accent-gold);
      font-size: 1.2rem;
    }
    .close-modal-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.8rem;
      cursor: pointer;
      line-height: 1;
    }
    .close-modal-btn:hover {
      color: var(--accent-red);
    }
    .map-hint {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
      font-style: italic;
    }
    .map-scroll-area {
      flex: 1;
      overflow: hidden;
      border: 1px solid var(--accent-gold);
      border-radius: 4px;
      background: var(--bg-dark);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0.5rem;
    }
    .mini-map-wrapper {
      position: relative;
      display: inline-block;
      max-height: 100%;
      max-width: 100%;
    }
    .mini-map-img {
      display: block;
      max-width: 100%;
      max-height: 65vh;
      width: auto;
      height: auto;
    }
    .modal-footer {
      margin-top: 1.5rem;
      display: flex;
      justify-content: flex-end;
    }
    .save-modal-btn {
      background: var(--accent-gold);
      color: var(--bg-dark);
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
    }
    .save-modal-btn:hover {
      background: var(--accent-gold-hover);
    }
    .mini-marker {
      position: absolute;
      width: 20px;
      height: 20px;
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid #fff;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      cursor: pointer;
      transition: all 0.2s;
    }
    .mini-marker:hover {
      background: rgba(255, 255, 255, 0.5);
      transform: translate(-50%, -50%) scale(1.3);
    }
    .mini-marker.selected {
      background: var(--accent-gold);
      border-color: #fff;
      box-shadow: 0 0 10px var(--accent-gold);
    }

    .bg-alt {
      background: rgba(0,0,0,0.2);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 6px;
      padding: 1rem;
    }
    .merchant-items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 1rem;
    }
    .merchant-item-card {
      background: rgba(0,0,0,0.4);
      border: 1px solid var(--accent-gold);
      border-radius: 4px;
      padding: 0.5rem;
      position: relative;
    }
    .item-img {
      width: 100%;
      height: 80px;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      background-color: rgba(255,255,255,0.05);
      margin-bottom: 0.5rem;
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      color: #666;
    }
    .item-info {
      text-align: center;
    }
    .item-name {
      font-size: 0.8rem;
      font-weight: bold;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .item-price {
      font-size: 0.85rem;
      color: var(--accent-gold);
      margin-top: 0.2rem;
    }
    .item-actions {
      position: absolute;
      top: -5px;
      right: -5px;
      display: flex;
      gap: 0.2rem;
      background: var(--bg-dark);
      border: 1px solid var(--accent-gold);
      border-radius: 4px;
      padding: 2px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .merchant-item-card:hover .item-actions {
      opacity: 1;
    }
    .item-actions button {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      font-size: 0.8rem;
      padding: 2px 4px;
    }
    .text-red { color: var(--accent-red) !important; }

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
    input[type="text"], input[type="number"], select, textarea {
      background: var(--bg-dark);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-main);
      padding: 0.8rem;
      border-radius: 4px;
      font-family: var(--font-ui);
      width: 100%;
      box-sizing: border-box;
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
  drawLimit: 'unlimited' | 'session' | 'player' | 'region' = 'unlimited';
  triggerMode: 'immediate' | 'pending' = 'immediate';
  
  options: CardOption[] = [];
  allowedMarkers: string[] = [];
  showMapSelector = false;

  availableCards = this.cardService.cards;

  // Merchant fields
  merchantName = '';
  merchantImage = '';
  merchantCoins = 0;
  merchantItems: MerchantItem[] = [];
  
  showItemModal = false;
  editingItem: MerchantItem | null = null;
  tempItem: Partial<MerchantItem> = {};

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
          this.allowedMarkers = card.allowedMarkers ? [...card.allowedMarkers] : [];
          
          if (card.type === 'merchant') {
            this.merchantName = card.merchantName || '';
            this.merchantImage = card.merchantImage || '';
            this.merchantCoins = card.merchantCoins || 0;
            this.merchantItems = card.merchantItems ? JSON.parse(JSON.stringify(card.merchantItems)) : [];
          } else {
            this.merchantName = '';
            this.merchantImage = '';
            this.merchantCoins = 0;
            this.merchantItems = [];
          }
        }
      } else {
        if (this.isEditMode) {
          this.resetForm();
        }
      }
    });
  }

  toggleMarker(markerId: string) {
    if (this.allowedMarkers.includes(markerId)) {
      this.allowedMarkers = this.allowedMarkers.filter(id => id !== markerId);
    } else {
      this.allowedMarkers.push(markerId);
    }
  }

  getMarkersForRegion() {
    // Ideally this comes from a service, but for now let's use the hardcoded ones
    // Matching what's in MapViewComponent
    let markers: any[] = [];
    if (this.mapRegion === 'mistyhighlans') {
      markers = [
        { id: 'event1', x: 8, y: 41 }, { id: 'event2', x: 34, y: 25 }, { id: 'event3', x: 38, y: 36 },
        { id: 'event4', x: 34, y: 53 }, { id: 'event5', x: 47, y: 44 }, { id: 'event6', x: 64, y: 13 },
        { id: 'event7', x: 82, y: 7 }, { id: 'event8', x: 76, y: 17 }, { id: 'event9', x: 59, y: 36 },
        { id: 'event10', x: 70, y: 45 }, { id: 'event11', x: 86, y: 35 }, { id: 'event12', x: 37, y: 63 },
        { id: 'event13', x: 40, y: 72 }, { id: 'event14', x: 56, y: 66 }, { id: 'event15', x: 18, y: 69 },
        { id: 'event16', x: 30, y: 80 }, { id: 'event17', x: 26, y: 86 }, { id: 'event18', x: 35, y: 86 },
        { id: 'event19', x: 46, y: 85 }, { id: 'event21', x: 88, y: 60 }, { id: 'event22', x: 83, y: 73 },
        { id: 'event23', x: 13, y: 35 }, { id: 'event24', x: 19, y: 43 }, { id: 'event25', x: 12, y: 58 },
        { id: 'event26', x: 22, y: 61 }, { id: 'event27', x: 7, y: 76 }, { id: 'event28', x: 45, y: 41 },
        { id: 'merch1', x: 14, y: 45 }, { id: 'merch2', x: 19, y: 78 }, { id: 'merch3', x: 29, y: 62 },
        { id: 'merch4', x: 38, y: 45 }, { id: 'merch5', x: 38, y: 58 }, { id: 'merch6', x: 40, y: 26 },
        { id: 'merch7', x: 49, y: 44 }, { id: 'merch8', x: 51, y: 56 }, { id: 'merch9', x: 56, y: 76 },
        { id: 'merch10', x: 59, y: 27 }, { id: 'merch11', x: 65, y: 40 }, { id: 'merch12', x: 68, y: 16 },
        { id: 'merch13', x: 71, y: 33 }, { id: 'merch14', x: 73, y: 68 }, { id: 'merch15', x: 78, y: 25 }
      ];
    } else if (this.mapRegion === 'fullmap') {
      markers = [];
    }
    // Filter based on the selected card type
    if (this.type === 'merchant') {
      return markers.filter(m => m.id.startsWith('merch'));
    } else {
      // Diğer standart event, encounter, treasure vb. kartlar için 'event' (misty) veya 'f' (fullmap) ile başlayanları döndür
      return markers.filter(m => m.id.startsWith('event') || m.id.startsWith('f'));
    }
  }

  onMerchantImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.merchantImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onItemImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.tempItem.imageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
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

  // Item Modal functions
  openItemModal(item?: MerchantItem) {
    if (item) {
      this.editingItem = item;
      this.tempItem = { ...item };
    } else {
      this.editingItem = null;
      this.tempItem = { id: crypto.randomUUID(), name: '', description: '', price: 0, count: 1, imageUrl: '' };
    }
    this.showItemModal = true;
  }

  closeItemModal() {
    this.showItemModal = false;
    this.editingItem = null;
  }

  saveItem() {
    if (!this.tempItem.name) return;
    
    if (this.editingItem) {
      const idx = this.merchantItems.findIndex(i => i.id === this.editingItem!.id);
      if (idx !== -1) {
        this.merchantItems[idx] = this.tempItem as MerchantItem;
      }
    } else {
      this.merchantItems.push(this.tempItem as MerchantItem);
    }
    this.closeItemModal();
  }

  removeMerchantItem(index: number) {
    this.merchantItems.splice(index, 1);
  }

  onSubmit() {
    // Eğer merchant ise, kartın title alanını otomatik olarak tüccar adıyla doldur
    if (this.type === 'merchant') {
      this.title = this.merchantName || 'İsimsiz Tüccar';
    }

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
        allowedMarkers: this.allowedMarkers.length > 0 ? this.allowedMarkers : undefined,
        options: processedOptions.length > 0 ? processedOptions : undefined,
        
        merchantName: this.type === 'merchant' ? this.merchantName : undefined,
        merchantImage: this.type === 'merchant' ? this.merchantImage : undefined,
        merchantCoins: this.type === 'merchant' ? this.merchantCoins : undefined,
        merchantItems: this.type === 'merchant' && this.merchantItems.length > 0 ? this.merchantItems : undefined
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
    this.allowedMarkers = [];
    this.showMapSelector = false;
    
    this.merchantName = '';
    this.merchantImage = '';
    this.merchantCoins = 0;
    this.merchantItems = [];
    this.showItemModal = false;
  }
}
