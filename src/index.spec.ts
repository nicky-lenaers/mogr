import { PageArgsMap, PageType, queryPage, Registry } from './index';

describe('index', () => {
  it('should export Registry', () => {
    expect(Registry).toBeTruthy();
  });

  it('should export PageType', () => {
    expect(PageType).toBeTruthy();
  });

  it('should export PageArgsMap', () => {
    expect(PageArgsMap).toBeTruthy();
  });

  it('should export queryPage', () => {
    expect(queryPage).toBeTruthy();
  });
});
