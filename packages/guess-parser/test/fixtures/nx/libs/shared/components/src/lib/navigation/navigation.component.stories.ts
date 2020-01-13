
import { SharedComponentsModule } from '../shared-components.module';
import { NavigationComponent } from './navigation.component';

export default {
  title: 'NavigationComponent'
}

export const primary = () => ({
  moduleMetadata: {
    imports: []
  },
  component: NavigationComponent,
  props: {
  }
})
