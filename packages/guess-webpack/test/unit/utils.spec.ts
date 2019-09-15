import {
  stripExtension,
  Compilation,
  JSChunk,
  getCompilationMapping
} from '../../src/utils';
import { join } from 'path';
import { Logger } from '../../../common/logger';

describe('stripExtension', () => {
  it('should strip .js, .jsx, .tsx, .ts extensions', () => {
    expect(stripExtension('/foo.js')).toBe('/foo');
    expect(stripExtension('/bar/foo.jsx')).toBe('/bar/foo');
    expect(stripExtension('/bar/foo.tsx')).toBe('/bar/foo');
    expect(stripExtension('/bar/foo/.tsx')).toBe('/bar/foo/');
  });

  it('should strip not strip other extensions', () => {
    expect(stripExtension('/foo.css')).toBe('/foo.css');
    expect(stripExtension('/foo.json')).toBe('/foo.json');
    expect(stripExtension('/foo.sass')).toBe('/foo.sass');
  });
});

const getComp = (chunks: JSChunk[]): Compilation => {
  return {
    getStats() {
      return {
        toJson() {
          return {
            chunks,
            modules: []
          };
        }
      };
    }
  };
};

const getAbsolutePaths = (paths: string[]) => {
  return paths.map(p => join(process.cwd(), p));
};

describe('getCompilationMapping', () => {
  it('should work', () => {
    const res = getCompilationMapping(getComp([]), new Set(), new Logger());
    expect(res.mainName).toBe(null);
    expect(res.fileChunk).toEqual({});
  });

  it('should return mainName', () => {
    const res = getCompilationMapping(
      getComp([
        {
          id: 1,
          files: ['chunk.js'],
          initial: true,
          origins: [],
          modules: []
        }
      ]),
      new Set(),
      new Logger()
    );
    expect(res.mainName).toBe('chunk.js');
    expect(res.fileChunk).toEqual({});
  });

  it('should return mainName with multiple initials', () => {
    const res = getCompilationMapping(
      getComp([
        {
          id: 1,
          files: ['a.js'],
          initial: true,
          origins: [],
          modules: []
        },
        {
          id: 1,
          files: ['b.js'],
          initial: false,
          origins: [],
          modules: []
        },
        {
          id: 2,
          files: ['c.js'],
          initial: true,
          modules: [],
          origins: []
        }
      ]),
      new Set(),
      new Logger()
    );
    expect(res.mainName).toBe('a.js');
    expect(res.fileChunk).toEqual({});
  });

  it('should return file mapping', () => {
    const res = getCompilationMapping(
      getComp([
        {
          id: 0,
          files: ['a.js'],
          initial: true,
          origins: [],
          modules: [
            {
              id: '',
              chunks: [],
              name: '/a.module.js',
              reasons: []
            }
          ]
        },
        {
          id: 1,
          files: ['b.js'],
          initial: false,
          origins: [],
          modules: [
            {
              id: '',
              chunks: [],
              name: '/b.module.js',
              reasons: []
            }
          ]
        },
        {
          id: 2,
          files: ['c.js'],
          initial: true,
          origins: [],
          modules: [
            {
              id: '',
              chunks: [],
              name: './c.module.js',
              reasons: []
            },
            {
              id: '',
              chunks: [],
              name: './c1.module.js',
              reasons: []
            },
            {
              id: '',
              chunks: [],
              name: './c2.module.js',
              reasons: []
            }
          ]
        }
      ]),
      new Set(getAbsolutePaths(['c.module', 'b.module', 'a.module'])),
      new Logger()
    );
    expect(res.mainName).toBe('a.js');
    const cwd = process.cwd();
    expect(res.fileChunk).toEqual({
      [join(cwd, '/a.module')]: {
        deps: undefined,
        file: 'a.js'
      },
      [join(cwd, '/b.module')]: {
        deps: undefined,
        file: 'b.js'
      },
      [join(cwd, '/c.module')]: {
        deps: undefined,
        file: 'c.js'
      }
    });
  });

  it('should throw when it cannot file the module entry point name', () => {
    expect(
      getCompilationMapping(
        getComp([
          {
            id: 0,
            files: ['a.js'],
            initial: true,
            origins: [],
            modules: [
              {
                id: '',
                chunks: [],
                name: '+1 bar',
                reasons: []
              }
            ]
          }
        ]),
        new Set(['c.module', 'b.module', 'a.module']),
        new Logger()
      )
    ).toEqual({ fileChunk: {}, mainName: 'a.js' });
  });

  it('should return file mapping with missing entry points', () => {
    const res = getCompilationMapping(
      getComp([
        {
          id: 0,
          files: ['a.js'],
          initial: true,
          origins: [],
          modules: [
            {
              id: '',
              chunks: [],
              name: '/a.module.js',
              reasons: []
            }
          ]
        },
        {
          id: 1,
          files: ['b.js'],
          initial: false,
          origins: [],
          modules: [
            {
              id: '',
              chunks: [],
              name: '/b.module.js',
              reasons: []
            }
          ]
        },
        {
          id: 2,
          files: ['c.js'],
          initial: true,
          origins: [],
          modules: [
            {
              id: '',
              chunks: [],
              name: './c.module.js',
              reasons: []
            },
            {
              id: '',
              chunks: [],
              name: './c1.module.js',
              reasons: []
            },
            {
              id: '',
              chunks: [],
              name: './c2.module.js',
              reasons: []
            }
          ]
        }
      ]),
      new Set(getAbsolutePaths(['not-there.module', 'b.module', 'a.module'])),
      new Logger()
    );
    expect(res.mainName).toBe('a.js');
    const cwd = process.cwd();
    expect(res.fileChunk).toEqual({
      [join(cwd, '/a.module')]: {
        deps: undefined,
        file: 'a.js'
      },
      [join(cwd, '/b.module')]: {
        deps: undefined,
        file: 'b.js'
      }
    });
  });

  it('should pick the right bundle priority', () => {
    expect(
      getCompilationMapping(
        getComp([
          {
            id: 0,
            files: ['foo.js'],
            initial: true,
            origins: [],
            modules: [
              {
                id: '',
                name: 'foo',
                reasons: [],
                chunks: []
              }
            ]
          },
          {
            id: 1,
            files: ['main.js'],
            initial: true,
            origins: [],
            modules: [
              {
                id: '',
                name: 'main',
                reasons: [],
                chunks: []
              }
            ]
          }
        ]),
        new Set(['c.module', 'b.module', 'a.module']),
        new Logger()
      )
    ).toEqual({ fileChunk: {}, mainName: 'main.js' });
  });
});
