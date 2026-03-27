import { Component } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-configurador',
  imports: [SidebarComponent],
  templateUrl: './configurador.html',
  styleUrl: './configurador.css'
})
export class Configurador {
  sidebarCollapsed = false;
}
