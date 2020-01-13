import { text, number, boolean } from '@storybook/addon-knobs';
import { SharedComponentsModule } from '../shared-components.module';
import { InfoBoxComponent } from './info-box.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export default {
  title: 'InfoBoxComponent'
};

export const primary = () => ({
  moduleMetadata: {
    imports: [MatCardModule, MatIconModule]
  },
  component: InfoBoxComponent,
  props: {
    icon: text('icon', ''),
    message: text('message', '')
  }
});
