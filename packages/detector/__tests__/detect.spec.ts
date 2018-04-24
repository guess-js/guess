import { detect } from '../detect';
import { ProjectType } from '../../common/interfaces';

describe('detect', () => {
  describe('angular', () => {
    it('should detect an Angular app', () => {
      expect(detect('packages/detector/__tests__/fixtures/angular').type).toBe(ProjectType.AngularCLI);
    });
  });

  describe('create-react-app', () => {
    it('should detect an create-react-app', () => {
      expect(detect('packages/detector/__tests__/fixtures/react-app').type).toBe(ProjectType.CreateReactApp);
    });
  });

  describe('create-react-app-ts', () => {
    it('should detect an create-react-app-ts', () => {
      expect(detect('packages/detector/__tests__/fixtures/react-app-ts').type).toBe(
        ProjectType.CreateReactAppTypeScript
      );
    });
  });

  describe('gatsby', () => {
    it('should detect an gatsby', () => {
      expect(detect('packages/detector/__tests__/fixtures/gatsby').type).toBe(ProjectType.Gatsby);
    });
  });

  describe('unknown', () => {
    it('should not detect unknown app', () => {
      expect(detect('packages/detector/__tests__/fixtures/unknown')).toBe(undefined);
    });
  });
});
