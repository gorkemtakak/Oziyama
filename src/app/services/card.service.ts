import { Injectable, signal } from '@angular/core';
import { EventCard } from '../models/event-card.model';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private readonly STORAGE_KEY = 'oziyama_event_cards';
  
  // Reactive state for the cards
  cards = signal<EventCard[]>([]);
  editingCard = signal<EventCard | null>(null);

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
  
  getRandomCard(currentMap: string): EventCard | null {
    // Haritadan rastgele çekilirken 'chain event' tipli kartlar gelmesin
    // Ve kart global değilse sadece seçilen haritanın kartları gelsin
    const currentCards = this.cards().filter(c => {
      if (c.type === 'chain event') return false;
      if (c.isGlobal) return true;
      return c.mapRegion === currentMap;
    });
    
    if (currentCards.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * currentCards.length);
    return currentCards[randomIndex];
  }

  // Draw state management
  activeCard = signal<EventCard | null>(null);

  drawRandomCard(currentMap: string) {
    const card = this.getRandomCard(currentMap);
    if (card) {
      this.activeCard.set(card);
    } else {
      alert('Bu haritaya ait geçerli bir olay kartı bulunamadı!');
    }
  }

  closeActiveCard() {
    this.activeCard.set(null);
  }
}
