import { detect } from '../src/detector';
import { ProjectType } from '../../common/interfaces';

describe('detect', () => {
  describe('angular', () => {
    it('should detect an Angular app', () => {
      expect(detect('packages/guess-parser/test/fixtures/angular')!.type).toBe(ProjectType.AngularCLI);
    });
  });

  describe('create-react-app', () => {
    it('should detect an create-react-app', () => {
      expect(detect('packages/guess-parser/test/fixtures/react-app')!.type).toBe(ProjectType.CreateReactApp);
    });
  });

  describe('create-react-app-ts', () => {
    it('should detect an create-react-app-ts', () => {
      expect(detect('packages/guess-parser/test/fixtures/react-app-ts')!.type).toBe(
        ProjectType.CreateReactAppTypeScript
      );
    });
  });

  describe('gatsby', () => {
    it('should detect an gatsby', () => {
      expect(detect('packages/guess-parser/test/fixtures/gatsby')!.type).toBe(ProjectType.Gatsby);
    });
  });

  describe('unknown', () => {
    it('should not detect unknown app', () => {
      expect(detect('packages/guess-parser/test/fixtures/unknown')).toBe(undefined);
    });
  });
});
