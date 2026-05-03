export type CardType = 'event' | 'encounter' | 'treasure' | 'curse' | 'chain event';

export interface CardOption {
  id: string; // Unique ID for the option
  text: string;
  requiresDice?: boolean;
  diceQty?: string; // e.g. "15" or "2d6"
  nextCardId?: string; // used if requiresDice is false
  winCardId?: string; // used if requiresDice is true
  failCardId?: string; // used if requiresDice is true
}

export interface EventCard {
  id: string;
  title: string;
  description: string;
  flavor?: string;
  type: CardType;
  tags?: string[];
  options?: CardOption[];
  isGlobal?: boolean;
  mapRegion?: string;
  createdAt: Date;
}
