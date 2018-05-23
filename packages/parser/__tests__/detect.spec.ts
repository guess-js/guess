import { detect } from '../src/detector';
import { ProjectType } from '../../common/interfaces';

describe('detect', () => {
  describe('angular', () => {
    it('should detect an Angular app', () => {
      expect((detect('packages/parser/__tests__/fixtures/angular') as any).type).toBe(ProjectType.AngularCLI);
    });
  });

  describe('create-react-app', () => {
    it('should detect an create-react-app', () => {
      expect((detect('packages/parser/__tests__/fixtures/react-app') as any).type).toBe(ProjectType.CreateReactApp);
    });
  });

  describe('create-react-app-ts', () => {
    it('should detect an create-react-app-ts', () => {
      expect((detect('packages/parser/__tests__/fixtures/react-app-ts') as any).type).toBe(
        ProjectType.CreateReactAppTypeScript
      );
    });
  });

  describe('gatsby', () => {
    it('should detect an gatsby', () => {
      expect((detect('packages/parser/__tests__/fixtures/gatsby') as any).type).toBe(ProjectType.Gatsby);
    });
  });

  describe('preact', () => {
    it('should detect an preact', () => {
      expect((detect('packages/parser/__tests__/fixtures/preact-app') as any).type).toBe(ProjectType.PreactCLI);
    });
  });

  describe('unknown', () => {
    it('should not detect unknown app', () => {
      expect(detect('packages/parser/__tests__/fixtures/unknown')).toBe(undefined);
    });
  });
});
