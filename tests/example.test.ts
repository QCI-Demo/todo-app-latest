import { main, scaffoldMessage } from '../src/index';

describe('example', () => {
  it('returns scaffold message', () => {
    expect(scaffoldMessage()).toBe('Backend scaffold ready');
  });

  it('logs scaffold message from main', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    main();
    expect(log).toHaveBeenCalledWith('Backend scaffold ready');
    log.mockRestore();
  });
});
