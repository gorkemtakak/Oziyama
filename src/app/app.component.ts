import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CardDisplayComponent } from './components/card-display/card-display.component';
import { CardFormComponent } from './components/card-form/card-form.component';
import { CardListComponent } from './components/card-list/card-list.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { PlayerSetupComponent } from './components/player-setup/player-setup.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NavbarComponent, CardDisplayComponent, CardFormComponent, CardListComponent, MapViewComponent, PlayerSetupComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'oziyama-app';
  currentView: 'map' | 'manager' = 'map';

  onViewChange(view: 'map' | 'manager') {
    this.currentView = view;
  }
}
