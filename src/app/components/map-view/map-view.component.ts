import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardService } from '../../services/card.service';

interface MapMarker {
  id: string;
  x: number; // percentage
  y: number; // percentage
  type: 'castle' | 'travel';
  targetMap?: 'mistyhighlans' | 'fullmap'; // Used if type is 'travel'
}

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-wrapper">
      
      @if (currentMap !== 'fullmap') {
        <button class="back-btn" (click)="switchMap('fullmap')">
          <span class="icon">🔙</span> Dünya Haritasına Dön
        </button>
      }

      <!-- Players Panel -->
      @if (cardService.isSessionActive()) {
        <div class="players-panel">
          <h4>Mevcut Oyuncular</h4>
          <div class="player-list">
            @for (player of cardService.players(); track player.id) {
              <div class="player-card" 
                   [class.active]="player.id === cardService.activePlayerId()"
                   (click)="cardService.setActivePlayer(player.id)"
                   [style.border-left-color]="player.color">
                <span class="player-name">{{ player.name }}</span>
                @if (player.id === cardService.activePlayerId()) {
                  <span class="active-dot">●</span>
                }
              </div>
            }
          </div>
          <p class="helper-text">
            Kart çekmek için önce oyuncuyu seçin, sonra haritaya tıklayın.
          </p>
        </div>
      }

      <div class="map-container">
        <img [src]="'assets/' + currentMap + '.jpeg'" [alt]="currentMap" class="map-image" 
             (error)="onImageError($event)">
        
        <!-- Markers -->
        @for (marker of getMarkers(); track marker.id) {
          
          @if (marker.type === 'castle') {
            <!-- Castle Marker (Invisible Hotspot) -->
            <div class="marker castle-marker"
                 [style.left.%]="marker.x"
                 [style.top.%]="marker.y"
                 (click)="triggerEvent(marker)"
                 title="Olay Kartı Çek">
            </div>
          }
          
          @if (marker.type === 'travel') {
            <!-- Travel Marker (Yellow Circle) -->
            <div class="marker travel-marker"
                 [style.left.%]="marker.x"
                 [style.top.%]="marker.y"
                 (click)="switchMap(marker.targetMap!)"
                 title="Bölgeye Git">
              <span class="travel-pulse"></span>
            </div>
          }
          
        }
      </div>
    </div>
  `,
  styles: [`
    .map-wrapper {
      width: 100%;
      height: calc(100vh - 80px); /* Adjust based on navbar height */
      overflow: auto;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--bg-dark);
      position: relative;
    }

    .back-btn {
      position: absolute;
      top: 1rem;
      left: 1rem;
      z-index: 100;
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid var(--accent-gold);
      color: var(--text-main);
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      backdrop-filter: blur(5px);
    }

    .back-btn:hover {
      background: rgba(212, 175, 55, 0.2);
      color: var(--accent-gold);
    }

    .players-panel {
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 100;
      background: rgba(0, 0, 0, 0.85);
      border: 1px solid var(--accent-gold);
      border-radius: 8px;
      padding: 1rem;
      min-width: 200px;
      backdrop-filter: blur(5px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    }
    .players-panel h4 {
      color: var(--accent-gold);
      margin-top: 0;
      margin-bottom: 1rem;
      font-size: 1.1rem;
      border-bottom: 1px solid rgba(212, 175, 55, 0.3);
      padding-bottom: 0.5rem;
    }
    .player-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .player-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.6rem;
      background: rgba(255,255,255,0.05);
      border-radius: 4px;
      border-left: 4px solid #fff;
      cursor: pointer;
      transition: all 0.2s;
    }
    .player-card:hover {
      background: rgba(255,255,255,0.1);
    }
    .player-card.active {
      background: rgba(212, 175, 55, 0.2);
    }
    .player-name {
      color: var(--text-main);
      font-weight: bold;
    }
    .active-dot {
      color: var(--accent-green);
      font-size: 1.2rem;
      line-height: 1;
    }
    .helper-text {
      margin-top: 1rem;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-style: italic;
      line-height: 1.3;
    }

    .map-container {
      position: relative;
      max-width: 100%;
      max-height: 100%;
      box-shadow: 0 0 20px rgba(0,0,0,0.8);
      border: 2px solid var(--accent-gold);
    }

    .map-image {
      display: block;
      max-width: 100%;
      max-height: calc(100vh - 85px);
      object-fit: contain;
    }

    .map-image.fallback {
      width: 800px;
      height: 600px;
      background: #1e222a;
    }

    .marker {
      position: absolute;
      transform: translate(-50%, -50%);
      cursor: pointer;
      border-radius: 50%;
      z-index: 10;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    /* Castle Marker Styles (Invisible Clickable Area) */
    .castle-marker {
      width: 40px; /* Slightly larger to make clicking easier */
      height: 40px;
      background-color: transparent;
      border: none;
      /* Optional subtle hover effect to show it's clickable */
      transition: background-color 0.2s;
    }

    .castle-marker:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    /* Travel Marker (Yellow Circle) Styles */
    .travel-marker {
      width: 45px;
      height: 45px;
      background-color: rgba(241, 196, 15, 0.3);
      border: 3px dashed var(--accent-gold-hover);
      box-shadow: 0 0 15px rgba(241, 196, 15, 0.5);
      transition: transform 0.2s;
    }

    .travel-marker:hover {
      transform: translate(-50%, -50%) scale(1.1);
      background-color: rgba(241, 196, 15, 0.5);
    }

    .travel-pulse {
      position: absolute;
      width: 100%;
      height: 100%;
      background: var(--accent-gold-hover);
      border-radius: 50%;
      animation: pulseAnim 2.5s infinite;
      opacity: 0;
    }

    @keyframes pulseAnim {
      0% { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(2.5); opacity: 0; }
    }
  `]
})
export class MapViewComponent {
  public cardService = inject(CardService);

  // Start at the World Map
  currentMap: 'mistyhighlans' | 'fullmap' = 'fullmap';

  // Sample markers for Misty Highlands
  mistyMarkers: MapMarker[] = [
    { id: 'm1', x: 8, y: 41, type: 'castle' },
    { id: 'm2', x: 34, y: 25, type: 'castle' },
    { id: 'm3', x: 38, y: 36, type: 'castle' },
    { id: 'm4', x: 34, y: 53, type: 'castle' },
    { id: 'm5', x: 47, y: 44, type: 'castle' },
    { id: 'm6', x: 64, y: 13, type: 'castle' },
    { id: 'm7', x: 82, y: 7, type: 'castle' },
    { id: 'm8', x: 76, y: 17, type: 'castle' },
    { id: 'm9', x: 59, y: 36, type: 'castle' },
    { id: 'm10', x: 70, y: 45, type: 'castle' },
    { id: 'm11', x: 86, y: 35, type: 'castle' },
    { id: 'm12', x: 37, y: 63, type: 'castle' },
    { id: 'm13', x: 40, y: 72, type: 'castle' },
    { id: 'm14', x: 56, y: 66, type: 'castle' },
    { id: 'm15', x: 18, y: 69, type: 'castle' },
    { id: 'm16', x: 30, y: 80, type: 'castle' },
    { id: 'm17', x: 26, y: 86, type: 'castle' },
    { id: 'm18', x: 35, y: 86, type: 'castle' },
    { id: 'm19', x: 46, y: 85, type: 'castle' },
    { id: 'm21', x: 88, y: 60, type: 'castle' },
    { id: 'm22', x: 83, y: 73, type: 'castle' }
  ];

  // Sample markers for Full Map
  fullMapMarkers: MapMarker[] = [
    { id: 'f1', x: 24, y: 57, type: 'castle' }, // Ironhold
    { id: 'f2', x: 54, y: 34, type: 'castle' }, // City of Dragons
    { id: 'f3', x: 24, y: 24, type: 'castle' }, // Ellowyne
    { id: 'f4', x: 88, y: 65, type: 'castle' }, // Vornhelm
    
    // Travel Marker to go to Misty Highlands (Approximate coordinates)
    { id: 'travel-misty', x: 74, y: 78, type: 'travel', targetMap: 'mistyhighlans' }
  ];

  getMarkers(): MapMarker[] {
    return this.currentMap === 'mistyhighlans' ? this.mistyMarkers : this.fullMapMarkers;
  }

  switchMap(map: 'mistyhighlans' | 'fullmap') {
    this.currentMap = map;
  }

  onImageError(event: any) {
    event.target.classList.add('fallback');
  }

  triggerEvent(marker: MapMarker) {
    if (marker.type === 'castle') {
      console.log('Marker clicked:', marker);
      this.cardService.drawRandomCard(this.currentMap, this.cardService.activePlayerId(), marker.id);
    }
  }
}
