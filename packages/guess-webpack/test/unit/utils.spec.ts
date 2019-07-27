import {
  stripExtension,
  Compilation,
  JSChunk,
  getCompilationMapping
} from '../../src/utils';
import { join } from 'path';

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
            chunks
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
    const res = getCompilationMapping(getComp([]), new Set());
    expect(res.mainName).toBe(null);
    expect(res.fileChunk).toEqual({});
  });

  it('should return mainName', () => {
    const res = getCompilationMapping(
      getComp([
        {
          files: ['chunk.js'],
          initial: true,
          origins: [],
          modules: []
        }
      ]),
      new Set()
    );
    expect(res.mainName).toBe('chunk.js');
    expect(res.fileChunk).toEqual({});
  });

  it('should return mainName with multiple initials', () => {
    const res = getCompilationMapping(
      getComp([
        {
          files: ['a.js'],
          initial: true,
          origins: [],
          modules: []
        },
        {
          files: ['b.js'],
          initial: false,
          origins: [],
          modules: []
        },
        {
          files: ['c.js'],
          initial: true,
          modules: [],
          origins: []
        }
      ]),
      new Set()
    );
    expect(res.mainName).toBe('c.js');
    expect(res.fileChunk).toEqual({});
  });

  it('should return file mapping', () => {
    const res = getCompilationMapping(
      getComp([
        {
          files: ['a.js'],
          initial: true,
          origins: [],
          modules: [
            {
              name: '/a.module.js',
              reasons: []
            }
          ]
        },
        {
          files: ['b.js'],
          initial: false,
          origins: [],
          modules: [
            {
              name: '/b.module.js',
              reasons: []
            }
          ]
        },
        {
          files: ['c.js'],
          initial: true,
          origins: [],
          modules: [
            {
              name: './c.module.js',
              reasons: []
            },
            {
              name: './c1.module.js',
              reasons: []
            },
            {
              name: './c2.module.js',
              reasons: []
            }
          ]
        }
      ]),
      new Set(getAbsolutePaths(['c.module', 'b.module', 'a.module']))
    );
    expect(res.mainName).toBe('c.js');
    const cwd = process.cwd();
    expect(res.fileChunk).toEqual({
      [join(cwd, '/a.module')]: 'a.js',
      [join(cwd, '/b.module')]: 'b.js',
      [join(cwd, '/c.module')]: 'c.js'
    });
  });

  it('should throw when it cannot file the module entry point name', () => {
    expect(
      getCompilationMapping(
        getComp([
          {
            files: ['a.js'],
            initial: true,
            origins: [],
            modules: [
              {
                name: '+1 bar',
                reasons: []
              }
            ]
          }
        ]),
        new Set(['c.module', 'b.module', 'a.module'])
      )
    ).toEqual({ fileChunk: {}, mainName: 'a.js' });
  });

  it('should return file mapping with missing entry points', () => {
    const res = getCompilationMapping(
      getComp([
        {
          files: ['a.js'],
          initial: true,
          origins: [],
          modules: [
            {
              name: '/a.module.js',
              reasons: []
            }
          ]
        },
        {
          files: ['b.js'],
          initial: false,
          origins: [],
          modules: [
            {
              name: '/b.module.js',
              reasons: []
            }
          ]
        },
        {
          files: ['c.js'],
          initial: true,
          origins: [],
          modules: [
            {
              name: './c.module.js',
              reasons: []
            },
            {
              name: './c1.module.js',
              reasons: []
            },
            {
              name: './c2.module.js',
              reasons: []
            }
          ]
        }
      ]),
      new Set(getAbsolutePaths(['not-there.module', 'b.module', 'a.module']))
    );
    expect(res.mainName).toBe('c.js');
    const cwd = process.cwd();
    expect(res.fileChunk).toEqual({
      [join(cwd, '/a.module')]: 'a.js',
      [join(cwd, '/b.module')]: 'b.js'
    });
  });
});
