import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardService } from '../../services/card.service';
import { CardOption } from '../../models/event-card.model';

@Component({
  selector: 'app-card-display',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (activeCard()) {
      <div class="modal-overlay" (click)="closeCard()">
        
        <!-- ==============================
             MERCHANT PANEL
             ============================== -->
        @if (activeCard()!.type === 'merchant') {
          <div class="merchant-panel-container" (click)="$event.stopPropagation()">
            <div class="merchant-panel-inner">
              
              <!-- LEFT SIDE: Merchant Info -->
              <div class="merchant-left">
                <div class="merchant-header-box">
                  <span class="merchant-header-title">Tüccar</span>
                </div>
                
                <div class="merchant-img-container">
                  @if (activeCard()!.merchantImage) {
                    <img [src]="activeCard()!.merchantImage" alt="Merchant" class="merchant-img">
                  } @else {
                    <div class="merchant-placeholder">Tüccar Görseli</div>
                  }
                </div>
                
                <div class="merchant-dialog">
                  <div class="merchant-name">{{ activeCard()!.merchantName || 'İsimsiz Tüccar' }}</div>
                  <div class="merchant-speech">{{ activeCard()!.description || 'Alışverişe hoş geldin!' }}</div>
                </div>
                
                <div class="merchant-actions">
                  <button class="merchant-btn buy-btn">Satın Al 🪙</button>
                  <button class="merchant-btn sell-btn">Sat 💰</button>
                </div>
                
                <div class="merchant-coins-display" style="margin-top: auto;">
                  🪙 
                  <input type="number" 
                         [ngModel]="getMerchantCoins()" 
                         (ngModelChange)="updateMerchantCoins($event)"
                         [readonly]="!cardService.isSessionActive()"
                         class="merchant-coins-input">
                </div>
              </div>
              
              <!-- RIGHT SIDE: Products Grid -->
              <div class="merchant-right">
                <div class="merchant-header-box">
                  <span class="merchant-header-title">Ürünler</span>
                </div>
                
                <div class="merchant-items-grid">
                  <!-- Generate 12 empty slots first, then fill with items -->
                  @for (slot of [0,1,2,3,4,5,6,7,8,9,10,11]; track slot) {
                    <div class="merchant-slot">
                      @if (activeCard()!.merchantItems && activeCard()!.merchantItems![slot]) {
                        <!-- Item exists in this slot -->
                        <div class="merchant-item" 
                             [class.disabled-item]="getMerchantItemCount(activeCard()!.merchantItems![slot]) <= 0"
                             (click)="getMerchantItemCount(activeCard()!.merchantItems![slot]) > 0 ? openItemDetails(activeCard()!.merchantItems![slot]) : null"
                             [title]="activeCard()!.merchantItems![slot].name + '\n' + activeCard()!.merchantItems![slot].description"
                             style="cursor: pointer;">
                          @if (activeCard()!.merchantItems![slot].imageUrl) {
                            <img [src]="activeCard()!.merchantItems![slot].imageUrl" class="merchant-item-img">
                          }
                          <div class="merchant-item-price">🪙 {{ activeCard()!.merchantItems![slot].price }}</div>
                          <div class="merchant-item-count">Stok: {{ getMerchantItemCount(activeCard()!.merchantItems![slot]) }}</div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>

            </div>
            <button class="close-btn mt-3" (click)="closeCard()">Kapat</button>
          </div>
          
          <!-- ITEM DETAILS MODAL -->
          @if (selectedMerchantItem()) {
            <div class="item-modal-overlay" (click)="closeItemDetails(); $event.stopPropagation()">
              <div class="item-modal-container" (click)="$event.stopPropagation()">
                <button class="item-modal-close" (click)="closeItemDetails(); $event.stopPropagation()">✖</button>
                
                <div class="item-modal-title">
                  {{ selectedMerchantItem()!.name }}
                </div>
                
                <div class="item-modal-body">
                  <div class="item-img-box">
                    @if (selectedMerchantItem()!.imageUrl) {
                      <img [src]="selectedMerchantItem()!.imageUrl">
                    }
                  </div>
                  <div class="item-desc-box">
                    <div class="desc-divider-top"></div>
                    <div class="item-desc-text">
                      {{ selectedMerchantItem()!.description || 'Açıklama yok.' }}
                    </div>
                    <div class="desc-divider-bottom"></div>
                  </div>
                </div>
                
                <div class="item-price-bar">
                  Fiyat: <span class="coin-icon">🪙</span> {{ selectedMerchantItem()!.price }}
                  <span style="margin-left: auto; font-size: 1rem; display: flex; align-items: center; gap: 0.3rem;">
                    Stok: 
                    <input type="number" 
                           [ngModel]="getMerchantItemCount(selectedMerchantItem()!)"
                           (ngModelChange)="updateItemCount(selectedMerchantItem()!, $event)"
                           [readonly]="!cardService.isSessionActive()"
                           class="merchant-stock-input">
                  </span>
                </div>
                
                <button class="item-buy-btn" 
                        [disabled]="!cardService.isSessionActive() || getMerchantItemCount(selectedMerchantItem()!) <= 0"
                        (click)="buyItem()">
                  Satın Al
                </button>
              </div>
            </div>
          }
          
        } @else {
        
        <!-- ==============================
             NORMAL EVENT CARD
             ============================== -->
        <div class="scene" (click)="flipCard(); $event.stopPropagation()">
          
          <div class="card-container" [class.is-flipped]="isFlipped()">
            
            <!-- Back of the Card (Cover) -->
            <div class="card-face card-back">
              <img src="assets/card backside.jpeg" alt="Card Back" class="card-bg">
              <div class="click-hint">Tıkla ve Çevir</div>
            </div>
            
            <!-- Front of the Card (Details) -->
            <div class="card-face card-front">
              <img src="assets/card frontside.jpeg" alt="Card Front" class="card-bg">
              
              <!-- Content Overlay -->
              <div class="card-content-overlay">
                <div class="card-inner">
                  <div class="card-header">
                    <span class="card-type">{{ activeCard()!.type | uppercase }}</span>
                  </div>
                  
                  <h2 class="card-title">{{ activeCard()!.title }}</h2>
                  
                  <div class="card-divider"></div>
                  
                  <div class="card-description">
                    <!-- Main Story -->
                    <p class="main-desc">{{ activeCard()!.description }}</p>
                    
                    @if (pendingDiceOption()) {
                      <!-- DICE OUTCOME UI -->
                      <div class="dice-outcome-container">
                        <div class="dice-target-display">
                          🎲 Hedef Zar: <span>{{ pendingDiceOption()!.diceQty || 'Belirtilmedi' }}</span>
                        </div>
                        <p class="dice-instruction">Zarınızı atın ve sonucu seçin:</p>
                        
                        <div class="outcome-actions">
                          <button class="outcome-btn win-btn" (click)="resolveDice('win', $event)">
                            ⚔️ BAŞARILI
                          </button>
                          <button class="outcome-btn fail-btn" (click)="resolveDice('fail', $event)">
                            💀 BAŞARISIZ
                          </button>
                        </div>
                        
                        <button class="back-btn" (click)="cancelDice($event)">↩ Geri Dön</button>
                      </div>
                    } @else {
                      <!-- Options -->
                      <div class="options-container">
                        @for (opt of activeCard()!.options; track opt.id) {
                          <button class="option-btn" (click)="selectOption(opt, $event)">
                            <div class="opt-content">
                              <span class="bullet">✧</span>
                              <span class="opt-text">{{ opt.text }}</span>
                            </div>
                            @if (opt.requiresDice) {
                              <div class="dice-req">
                                🎲 <span class="dice-val">{{ opt.diceQty || 'Zar At' }}</span>
                              </div>
                            }
                          </button>
                        }
                      </div>
                    }
                  </div>
                  
                  @if (activeCard()!.flavor) {
                    <div class="card-flavor">
                      {{ activeCard()!.flavor }}
                    </div>
                  }
                  
                </div>
              </div>
            </div>
          </div>
        </div>

        }
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      animation: fadeIn var(--trans-fast);
    }
    
    .scene {
      width: 540px;
      height: 360px;
      max-width: 95vw;
      perspective: 1200px;
      cursor: pointer;
      margin-bottom: 2rem;
    }

    .card-container {
      width: 100%;
      height: 100%;
      position: relative;
      transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      transform-style: preserve-3d;
      animation: dropIn 0.5s ease-out;
    }

    .card-container.is-flipped {
      transform: rotateY(180deg);
    }

    .card-face {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 15px 35px rgba(0,0,0,0.8), var(--shadow-glow);
      border: 1px solid rgba(212, 175, 55, 0.4);
    }

    .card-bg {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .card-back {
      /* Front side of the 3D element (but it's the visual back of the card) */
    }

    .card-front {
      /* Back side of the 3D element (visual front of the card with text) */
      transform: rotateY(180deg);
    }

    .click-hint {
      position: absolute;
      bottom: 10%;
      width: 100%;
      text-align: center;
      color: var(--accent-gold);
      font-family: var(--font-fantasy);
      font-size: 1.2rem;
      text-shadow: 0 0 10px black, 0 0 20px black;
      animation: pulse 2s infinite;
    }

    .card-content-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
    }
    
    .card-inner {
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 8px;
      padding: 1.5rem;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }
    
    .card-inner::-webkit-scrollbar {
      width: 4px;
    }
    .card-inner::-webkit-scrollbar-thumb {
      background: var(--accent-gold);
      border-radius: 4px;
    }
    
    .card-header {
      display: flex;
      justify-content: center;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      font-family: var(--font-fantasy);
      letter-spacing: 2px;
      color: var(--accent-gold);
      text-shadow: 0 2px 4px black;
    }
    
    .card-title {
      color: #fff;
      font-size: 1.5rem;
      text-align: center;
      margin: 0.5rem 0;
      text-shadow: 0 2px 5px black;
    }
    
    .card-divider {
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--accent-gold), transparent);
      margin: 0.5rem 0;
      opacity: 0.7;
    }
    
    .card-description {
      display: flex;
      flex-direction: column;
      margin-bottom: auto;
    }

    .main-desc {
      font-size: 1.05rem;
      line-height: 1.5;
      text-align: center;
      text-shadow: 0 1px 3px black;
      margin-bottom: 1rem;
    }
    
    .options-container {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .option-btn {
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid var(--accent-gold);
      color: var(--text-main);
      padding: 0.8rem 1rem;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: all 0.2s;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0,0,0,0.5);
    }

    .option-btn:hover {
      background: rgba(212, 175, 55, 0.2);
      transform: translateX(5px);
      box-shadow: -2px 0 10px rgba(212, 175, 55, 0.4);
    }
    
    .opt-content {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      text-align: left;
    }

    .bullet {
      color: var(--accent-gold);
      font-size: 1.2rem;
      line-height: 1;
    }
    
    .opt-text {
      font-size: 0.95rem;
    }
    
    .dice-req {
      align-self: flex-end;
      background: rgba(231, 76, 60, 0.2);
      border: 1px solid var(--accent-red);
      color: #fff;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
    
    .dice-val {
      color: var(--accent-gold);
    }

    /* DICE OUTCOME UI STYLES */
    .dice-outcome-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.6rem;
      padding: 0.8rem;
      background: rgba(0,0,0,0.4);
      border: 1px solid var(--accent-gold);
      border-radius: 8px;
      box-shadow: inset 0 0 15px rgba(0,0,0,0.8);
      animation: fadeIn 0.3s ease-out;
    }

    .dice-target-display {
      font-size: 1rem;
      color: #fff;
      text-shadow: 0 2px 5px black;
      margin-bottom: -0.3rem;
    }
    .dice-target-display span {
      color: var(--accent-gold);
      font-weight: bold;
      font-size: 1.2rem;
    }

    .dice-instruction {
      font-size: 0.8rem;
      color: #ccc;
      margin: 0;
    }

    .outcome-actions {
      display: flex;
      gap: 0.5rem;
      width: 100%;
    }

    .outcome-btn {
      flex: 1;
      padding: 0.5rem;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
      text-shadow: 0 1px 3px black;
      border: 1px solid transparent;
    }

    .win-btn {
      background: linear-gradient(135deg, rgba(46, 204, 113, 0.3), rgba(39, 174, 96, 0.6));
      border-color: rgba(46, 204, 113, 0.5);
      color: #fff;
    }
    .win-btn:hover {
      background: linear-gradient(135deg, rgba(46, 204, 113, 0.5), rgba(39, 174, 96, 0.8));
      transform: scale(1.05);
      box-shadow: 0 0 15px rgba(46, 204, 113, 0.4);
    }

    .fail-btn {
      background: linear-gradient(135deg, rgba(231, 76, 60, 0.3), rgba(192, 57, 43, 0.6));
      border-color: rgba(231, 76, 60, 0.5);
      color: #fff;
    }
    .fail-btn:hover {
      background: linear-gradient(135deg, rgba(231, 76, 60, 0.5), rgba(192, 57, 43, 0.8));
      transform: scale(1.05);
      box-shadow: 0 0 15px rgba(231, 76, 60, 0.4);
    }

    .back-btn {
      background: transparent;
      color: var(--text-muted);
      border: none;
      font-size: 0.8rem;
      text-decoration: underline;
      cursor: pointer;
    }
    .back-btn:hover {
      color: #fff;
    }
    
    .card-flavor {
      font-style: italic;
      color: #ccc;
      text-align: center;
      padding: 0.8rem;
      background: rgba(0,0,0,0.4);
      border-radius: 4px;
      border-left: 2px solid var(--accent-gold);
      font-size: 0.85rem;
      margin-top: 1rem;
    }
    
    .close-btn {
      padding: 1rem 3rem;
      background: rgba(212, 175, 55, 0.2);
      border: 1px solid var(--accent-gold);
      color: var(--accent-gold);
      border-radius: 4px;
      font-size: 1.2rem;
      backdrop-filter: blur(5px);
      text-transform: uppercase;
      letter-spacing: 2px;
      animation: fadeIn 1s;
    }

    .close-btn:hover {
      background: var(--accent-gold);
      color: black;
      box-shadow: 0 0 20px var(--accent-gold);
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes dropIn {
      from { transform: translateY(-500px) scale(0.5); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }

    @keyframes pulse {
      0% { opacity: 0.5; transform: scale(0.95); }
      50% { opacity: 1; transform: scale(1.05); }
      100% { opacity: 0.5; transform: scale(0.95); }
    }
    
    .mt-3 { margin-top: 1.5rem; }

    /* MERCHANT PANEL STYLES */
    .merchant-panel-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      animation: dropIn 0.5s ease-out;
      width: 90vw;
      max-width: 1000px;
    }
    
    .merchant-panel-inner {
      display: flex;
      background: #2a2c33;
      border: 4px solid #1a1a1c;
      border-radius: 8px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5);
      width: 100%;
      height: 650px;
      overflow: hidden;
    }
    
    .merchant-left {
      width: 55%;
      background: #1c1d22;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      border-right: 4px solid #1a1a1c;
    }
    
    .merchant-right {
      width: 45%;
      background: #3b3a32;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .merchant-header-box {
      background: #4a3e2c;
      border: 2px solid #2a2218;
      border-radius: 4px;
      text-align: center;
      padding: 0.5rem;
      margin-bottom: 1rem;
      box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
    }
    
    .merchant-header-title {
      font-family: var(--font-fantasy);
      color: #e8c678;
      font-size: 1.2rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      text-shadow: 1px 1px 2px black;
    }
    
    .merchant-img-container {
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(0,0,0,0.2);
      border-radius: 4px;
      margin-bottom: 1rem;
      overflow: hidden;
      width: 100%;
      aspect-ratio: 510 / 370;
    }
    
    .merchant-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .merchant-placeholder {
      color: #666;
      font-style: italic;
    }
    
    .merchant-dialog {
      background: #dcd0b3;
      color: #332b1f;
      padding: 1rem;
      border-radius: 4px;
      border: 2px solid #2a2218;
      margin-bottom: 1rem;
      box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
      min-height: 80px;
    }
    
    .merchant-name {
      font-weight: bold;
      margin-bottom: 0.5rem;
      font-size: 1.1rem;
    }
    
    .merchant-speech {
      font-size: 0.95rem;
      line-height: 1.4;
    }
    
    .merchant-actions {
      display: flex;
      gap: 1rem;
    }
    
    .merchant-btn {
      flex: 1;
      padding: 0.8rem;
      background: #2a2218;
      color: #e8c678;
      border: 2px solid #1a150e;
      border-radius: 4px;
      font-family: var(--font-fantasy);
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .merchant-btn:hover {
      background: #3c3122;
      color: #fff;
    }
    
    .merchant-items-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.8rem;
    }
    
    .merchant-slot {
      aspect-ratio: 1;
      background: #2b2a24;
      border: 2px solid #1a1a16;
      border-radius: 4px;
      position: relative;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .merchant-item {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
    
    .merchant-item:hover:not(.disabled-item) {
      background: rgba(255,255,255,0.05);
    }
    
    .merchant-item.disabled-item {
      filter: grayscale(100%) brightness(50%);
      cursor: not-allowed !important;
    }
    
    .merchant-item-img {
      width: 75%;
      height: 75%;
      object-fit: contain;
    }
    
    .merchant-item-price {
      position: absolute;
      bottom: 2px;
      right: 4px;
      font-size: 0.8rem;
      color: #e8c678;
      font-weight: bold;
      text-shadow: 1px 1px 2px black;
    }
    
    .merchant-item-count {
      position: absolute;
      top: 2px;
      left: 4px;
      font-size: 0.7rem;
      color: #fff;
      font-weight: bold;
      background: rgba(0,0,0,0.6);
      padding: 1px 4px;
      border-radius: 2px;
    }
    
    .merchant-coins-display {
      margin-top: 1rem;
      background: #1a1a1c;
      color: #e8c678;
      text-align: center;
      padding: 0.5rem;
      border: 2px solid #2a2218;
      border-radius: 4px;
      font-size: 1.2rem;
      font-family: var(--font-fantasy);
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
    }
    
    .merchant-coins-input {
      background: transparent;
      border: none;
      border-bottom: 2px dashed #4a3e2c;
      color: #e8c678;
      font-size: 1.2rem;
      font-family: var(--font-fantasy);
      width: 60px;
      text-align: center;
      outline: none;
    }
    
    .merchant-coins-input::-webkit-outer-spin-button,
    .merchant-coins-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    
    .merchant-stock-input {
      background: transparent;
      border: none;
      border-bottom: 2px dashed #4a3e2c;
      color: #fff;
      font-size: 1.1rem;
      font-family: var(--font-fantasy);
      width: 40px;
      text-align: center;
      outline: none;
    }
    
    .merchant-stock-input::-webkit-outer-spin-button,
    .merchant-stock-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* ITEM POPUP STYLES */
    .item-modal-overlay {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
    }
    .item-modal-container {
      background: #8b7355; 
      border: 6px solid #2c251b; 
      border-radius: 4px;
      width: 350px;
      padding: 1.5rem;
      position: relative;
      box-shadow: 0 10px 25px rgba(0,0,0,0.9), inset 0 0 50px rgba(0,0,0,0.4);
      display: flex;
      flex-direction: column;
      align-items: center;
      font-family: var(--font-fantasy);
    }
    .item-modal-close {
      position: absolute;
      top: -15px;
      right: -15px;
      width: 36px;
      height: 36px;
      background: #5c2c2c;
      border: 3px solid #2c251b;
      color: #e0d0b0;
      font-weight: bold;
      font-size: 1.2rem;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 4px;
    }
    .item-modal-title {
      background: #4a3e2c;
      border: 2px solid #2c251b;
      color: #e8c678;
      width: 80%;
      text-align: center;
      padding: 0.5rem;
      font-size: 1.3rem;
      margin-bottom: 1.5rem;
      box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
    }
    .item-modal-body {
      display: flex;
      width: 100%;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .item-img-box {
      width: 100px;
      height: 100px;
      background: #1a1a1a;
      border: 3px solid #2c251b;
      border-radius: 4px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      flex-shrink: 0;
    }
    .item-img-box img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .item-desc-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .desc-divider-top, .desc-divider-bottom {
      height: 2px;
      background: #2c251b;
      width: 100%;
      position: relative;
    }
    .desc-divider-top::before, .desc-divider-top::after,
    .desc-divider-bottom::before, .desc-divider-bottom::after {
      content: '♦';
      position: absolute;
      top: -8px;
      color: #2c251b;
      font-size: 14px;
    }
    .desc-divider-top::before, .desc-divider-bottom::before { left: -5px; }
    .desc-divider-top::after, .desc-divider-bottom::after { right: -5px; }
    
    .item-desc-text {
      color: #2c251b;
      font-family: var(--font-ui);
      font-size: 0.85rem;
      padding: 0.5rem 0;
      flex: 1;
      display: flex;
      align-items: center;
      font-weight: 500;
    }
    .item-price-bar {
      width: 100%;
      background: #2c251b;
      border: 2px solid #1a1a1a;
      color: #e8c678;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      box-sizing: border-box;
    }
    .item-buy-btn {
      background: #2c251b;
      border: 2px solid #1a1a1a;
      color: #e8c678;
      padding: 0.6rem 2rem;
      font-family: var(--font-fantasy);
      font-size: 1.2rem;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;
    }
    .item-buy-btn:hover:not(:disabled) {
      background: #4a3e2c;
      color: #fff;
    }
    .item-buy-btn:disabled {
      filter: grayscale(100%) brightness(50%);
      cursor: not-allowed;
    }
  `]
})
export class CardDisplayComponent {
  public cardService = inject(CardService);
  
  activeCard = this.cardService.activeCard;
  isFlipped = signal(false);
  pendingDiceOption = signal<CardOption | null>(null);
  selectedMerchantItem = signal<any>(null);

  openItemDetails(item: any) {
    if (!item) return;
    this.selectedMerchantItem.set(item);
  }

  closeItemDetails() {
    this.selectedMerchantItem.set(null);
  }

  getMerchantCoins(): number {
    const card = this.activeCard();
    if (!card) return 0;
    if (this.cardService.isSessionActive()) {
      const state = this.cardService.getMerchantState(card.id);
      if (state) return state.coins;
    }
    return card.merchantCoins || 0;
  }

  getMerchantItemCount(item: any): number {
    if (!item) return 0;
    const card = this.activeCard();
    if (!card) return item.count !== undefined ? item.count : 1;
    
    if (this.cardService.isSessionActive()) {
      const state = this.cardService.getMerchantState(card.id);
      if (state && state.items[item.id] !== undefined) {
        return state.items[item.id];
      }
    }
    return item.count !== undefined ? item.count : 1;
  }

  updateItemCount(item: any, newCount: number) {
    if (!item) return;
    const card = this.activeCard();
    if (!card) return;
    
    if (this.cardService.isSessionActive()) {
      this.cardService.updateMerchantSessionItemCount(card.id, item.id, newCount);
    } else {
      const updatedItems = card.merchantItems?.map(i => i.id === item.id ? { ...i, count: newCount } : i);
      const updatedCard = { ...card, merchantItems: updatedItems };
      this.cardService.updateCard(updatedCard);
      this.cardService.activeCard.set(updatedCard);
    }
  }

  buyItem() {
    const item = this.selectedMerchantItem();
    const card = this.activeCard();
    if (item && card) {
      const count = this.getMerchantItemCount(item);
      if (count <= 0) return;
      
      const price = item.price || 0;
      const currentCoins = this.getMerchantCoins();
      const newAmount = currentCoins + price;
      
      if (this.cardService.isSessionActive()) {
        this.cardService.updateMerchantSessionCoins(card.id, newAmount);
        this.cardService.updateMerchantSessionItemCount(card.id, item.id, count - 1);
      } else {
        // Outside session, update DB directly
        const updatedItems = card.merchantItems?.map(i => i.id === item.id ? { ...i, count: count - 1 } : i);
        const updatedCard = { ...card, merchantCoins: newAmount, merchantItems: updatedItems };
        this.cardService.updateCard(updatedCard);
        this.cardService.activeCard.set(updatedCard);
      }
    }
  }

  updateMerchantCoins(newAmount: number) {
    const card = this.activeCard();
    if (card) {
      if (this.cardService.isSessionActive()) {
        this.cardService.updateMerchantSessionCoins(card.id, newAmount);
      } else {
        const updatedCard = { ...card, merchantCoins: newAmount };
        this.cardService.updateCard(updatedCard);
        this.cardService.activeCard.set(updatedCard);
      }
    }
  }

  flipCard() {
    if (!this.isFlipped()) {
      this.isFlipped.set(true);
    }
  }

  selectOption(opt: CardOption, event: Event) {
    event.stopPropagation(); // Prevent flipCard
    
    if (opt.requiresDice) {
      this.pendingDiceOption.set(opt);
      return; // Stop here, wait for Win/Fail
    }
    
    // Normal Forward Mapping Lookup (No Dice)
    this.routeToCard(opt.nextCardId);
  }

  resolveDice(outcome: 'win' | 'fail', event: Event) {
    event.stopPropagation();
    
    const opt = this.pendingDiceOption();
    if (!opt) return;

    // Dice Forward Mapping Lookup
    const targetCardId = outcome === 'win' ? opt.winCardId : opt.failCardId;
    
    this.routeToCard(targetCardId);
  }

  cancelDice(event: Event) {
    event.stopPropagation();
    this.pendingDiceOption.set(null);
  }

  private routeToCard(nextCardId?: string) {
    this.pendingDiceOption.set(null); // Reset state
    
    if (nextCardId && nextCardId !== 'undefined') {
      const nextCard = this.cardService.cards().find(c => c.id === nextCardId);
      
      // Check if it should be pending
      if (nextCard && nextCard.triggerMode === 'pending' && this.cardService.isSessionActive() && this.cardService.activePlayerId()) {
        this.cardService.addPendingEvent(this.cardService.activePlayerId()!, nextCardId);
        this.closeCard();
        return;
      }

      // Load next card!
      this.isFlipped.set(false);
      // Wait for flip back animation, then load new card
      setTimeout(() => {
        this.cardService.drawCardById(nextCardId);
        // Flip the new card automatically after a short delay
        setTimeout(() => {
          this.isFlipped.set(true);
        }, 100);
      }, 400);
    } else {
      // No link, just close the card
      this.closeCard();
    }
  }

  closeCard() {
    this.isFlipped.set(false);
    this.selectedMerchantItem.set(null); // Reset
    setTimeout(() => {
      this.cardService.closeActiveCard();
      this.pendingDiceOption.set(null); // Reset
    }, 400); // Wait for unflip animation
  }
}
