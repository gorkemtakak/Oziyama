import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardService } from '../../services/card.service';
import { CardOption } from '../../models/event-card.model';

@Component({
  selector: 'app-card-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (activeCard()) {
      <div class="modal-overlay">
        <!-- 3D Scene Container -->
        <div class="scene" (click)="flipCard()">
          
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

        @if (isFlipped()) {
          <button class="close-btn" (click)="closeCard()">Kapat</button>
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
  `]
})
export class CardDisplayComponent {
  private cardService = inject(CardService);
  
  activeCard = this.cardService.activeCard;
  isFlipped = signal(false);
  pendingDiceOption = signal<CardOption | null>(null);

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
    setTimeout(() => {
      this.cardService.closeActiveCard();
      this.pendingDiceOption.set(null); // Reset
    }, 400); // Wait for unflip animation
  }
}
