import { Routes } from '@angular/router';
import { EventPageComponent } from './features/public-event/pages/event-page/event-page.component';

export const routes: Routes = [
  {
    path: 'photos',
    component: EventPageComponent,
    data: { initialSection: 'photos' }
  },
  {
    path: '',
    component: EventPageComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
