import { Injectable, signal } from '@angular/core';
import { EventCard } from '../models/event-card.model';
import { Player } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private readonly STORAGE_KEY = 'oziyama_event_cards';

  // Reactive state for the cards
  cards = signal<EventCard[]>([]);
  editingCard = signal<EventCard | null>(null);

  // Session State
  isSessionActive = signal<boolean>(false);
  isSettingUpSession = signal<boolean>(false);
  drawnCardsInSession = signal<Set<string>>(new Set());

  // Players
  players = signal<Player[]>([]);
  activePlayerId = signal<string | null>(null);

  constructor() {
    this.loadCards();
  }

  setEditingCard(card: EventCard | null) {
    this.editingCard.set(card);
  }

  private loadCards(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as EventCard[];
        const migrated = parsed.map(c => ({
          ...c,
          isGlobal: c.isGlobal !== undefined ? c.isGlobal : false,
          mapRegion: c.mapRegion || 'mistyhighlans'
        }));
        this.cards.set(migrated);
      } catch (e) {
        console.error('Failed to parse stored cards', e);
        this.cards.set([]);
      }
    } else {
      // Default dummy data for initial load
      this.cards.set([
        {
          id: '1',
          title: 'Sisli Geçit Pusu',
          description: 'Geçitteki sise gizlenmiş haydutlar aniden karşınıza çıkıyor.',
          options: [
            { id: 'opt_1_1', text: 'Eşyalarının bir kısmını ver.' },
            { id: 'opt_1_2', text: 'Savaşarak geç.', requiresDice: true, diceQty: '15' }
          ],
          flavor: '"Gözünüzü dört açın, sisin içinde sadece gölgeler saklanmaz."',
          type: 'encounter',
          isGlobal: false,
          mapRegion: 'mistyhighlans',
          createdAt: new Date()
        },
        {
          id: '2',
          title: 'Eski Tapınak Keşfi',
          description: 'Ormanın derinliklerinde eski, yosun tutmuş bir tapınak buldunuz.',
          options: [
            { id: 'opt_2_1', text: 'Tapınağa gir ve araştır.' },
            { id: 'opt_2_2', text: 'Dışarıda bekle.' }
          ],
          flavor: '"Eski tanrılar bazen cömerttir, bazen ise sadece aç..."',
          type: 'treasure',
          isGlobal: false,
          mapRegion: 'mistyhighlans',
          createdAt: new Date()
        }
      ]);
      this.saveCards();
    }
  }

  private saveCards(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cards()));
  }

  // ...

  drawCardById(id: string) {
    const card = this.cards().find(c => c.id === id);
    if (card) {
      this.activeCard.set(card);
    } else {
      console.error(`Card with id ${id} not found.`);
    }
  }

  addCard(card: Omit<EventCard, 'id' | 'createdAt'>): void {
    const newCard: EventCard = {
      ...card,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    this.cards.update(cards => [...cards, newCard]);
    this.saveCards();
  }

  updateCard(updatedCard: EventCard): void {
    this.cards.update(cards =>
      cards.map(c => c.id === updatedCard.id ? updatedCard : c)
    );
    this.saveCards();
  }

  deleteCard(id: string): void {
    this.cards.update(cards => cards.filter(c => c.id !== id));
    this.saveCards();
  }

  // ...

  getRandomCard(currentMap: string, playerId?: string | null, markerId?: string): EventCard | null {
    // Haritadan rastgele çekilirken 'chain event' tipli kartlar gelmesin
    // Ve kart global değilse sadece seçilen haritanın kartları gelsin
    const currentCards = this.cards().filter(c => {
      if (c.type === 'chain event') return false;

      // Marker filtrelemesi varsa ve kartın allowedMarkers listesi boş değilse kontrol et
      if (markerId && c.allowedMarkers && c.allowedMarkers.length > 0) {
        if (!c.allowedMarkers.includes(markerId)) return false;
      }

      // Marker türü ve Kart türü eşleşme güvenliği:
      if (markerId) {
        const isMerchantMarker = markerId.startsWith('merch');
        if (isMerchantMarker && c.type !== 'merchant') return false;
        if (!isMerchantMarker && c.type === 'merchant') return false;
      }

      // Session açıksa ve bu kart o map'te zaten bir kez çekildiyse filtrele
      if (this.isSessionActive()) {
        const limit = c.drawLimit || ((c as any).oncePerSession ? 'session' : 'unlimited');

        if (limit === 'session') {
          // Global session limit (across all maps)
          if (this.drawnCardsInSession().has(`${c.id}_session_global`)) {
            return false;
          }
        } else if (limit === 'region') {
          // Region specific limit
          if (this.drawnCardsInSession().has(`${currentMap}_${c.id}_region`)) {
            return false;
          }
        } else if (limit === 'player' && playerId) {
          // Player specific limit (per map)
          if (this.drawnCardsInSession().has(`${currentMap}_${c.id}_player_${playerId}`)) {
            return false;
          }
        }
      }

      if (currentMap === 'fullmap') {
        // Ana haritada global kartlar açılmaz, sadece o haritaya özel kartlar (eğer tanımlandıysa) açılır.
        return c.mapRegion === 'fullmap';
      }

      if (c.isGlobal) return true;
      return c.mapRegion === currentMap;
    });

    if (currentCards.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * currentCards.length);
    return currentCards[randomIndex];
  }

  // Draw state management
  activeCard = signal<EventCard | null>(null);


  addPendingEvent(playerId: string, cardId: string) {
    this.players.update(players => players.map(p => {
      if (p.id === playerId) {
        const pending = p.pendingEvents || [];
        if (!pending.includes(cardId)) {
          return { ...p, pendingEvents: [...pending, cardId] };
        }
      }
      return p;
    }));
  }

  removePendingEvent(playerId: string, cardId: string) {
    this.players.update(players => players.map(p => {
      if (p.id === playerId && p.pendingEvents) {
        return { ...p, pendingEvents: p.pendingEvents.filter(id => id !== cardId) };
      }
      return p;
    }));
  }

  drawRandomCard(currentMap: string, playerId?: string | null, markerId?: string) {
    // Check pending events first
    if (playerId && this.isSessionActive()) {
      const player = this.players().find(p => p.id === playerId);
      if (player && player.pendingEvents && player.pendingEvents.length > 0) {
        // 25% chance to trigger a pending event
        if (Math.random() < 0.30) {
          const pendingIndex = Math.floor(Math.random() * player.pendingEvents.length);
          const pendingCardId = player.pendingEvents[pendingIndex];
          const pendingCard = this.cards().find(c => c.id === pendingCardId);

          if (pendingCard) {
            this.removePendingEvent(playerId, pendingCardId);
            this.activeCard.set(pendingCard);
            return;
          } else {
            // Card might have been deleted from DB but was still in pending list
            this.removePendingEvent(playerId, pendingCardId);
          }
        }
      }
    }

    const card = this.getRandomCard(currentMap, playerId, markerId);
    if (card) {
      if (this.isSessionActive()) {
        const limit = card.drawLimit || ((card as any).oncePerSession ? 'session' : 'unlimited');
        const newSet = new Set(this.drawnCardsInSession());

        if (limit === 'session') {
          newSet.add(`${card.id}_session_global`);
          this.drawnCardsInSession.set(newSet);
        } else if (limit === 'region') {
          newSet.add(`${currentMap}_${card.id}_region`);
          this.drawnCardsInSession.set(newSet);
        } else if (limit === 'player' && playerId) {
          newSet.add(`${currentMap}_${card.id}_player_${playerId}`);
          this.drawnCardsInSession.set(newSet);
        }
      }
      this.activeCard.set(card);
    } else {
      alert('Bu haritaya ait geçerli/çekilebilir bir olay kartı bulunamadı!');
    }
  }

  startSession(playersData: Omit<Player, 'id'>[]) {
    this.isSessionActive.set(true);
    this.drawnCardsInSession.set(new Set());

    const newPlayers = playersData.map((p, index) => ({
      id: `p${index + 1}_${Date.now()}`,
      name: p.name,
      color: p.color,
      pendingEvents: []
    }));

    this.players.set(newPlayers);

    if (newPlayers.length > 0) {
      this.activePlayerId.set(newPlayers[0].id);
    }
  }

  endSession() {
    this.isSessionActive.set(false);
    this.drawnCardsInSession.set(new Set());
    this.players.set([]);
    this.activePlayerId.set(null);
    this.closeActiveCard();
  }

  setActivePlayer(id: string) {
    this.activePlayerId.set(id);
  }

  closeActiveCard() {
    this.activeCard.set(null);
  }
}
