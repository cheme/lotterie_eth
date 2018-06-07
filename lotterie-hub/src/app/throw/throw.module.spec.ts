import { ThrowModule } from './throw.module';

describe('ThrowModule', () => {
  let throwModule: ThrowModule;

  beforeEach(() => {
    throwModule = new ThrowModule();
  });

  it('should create an instance', () => {
    expect(throwModule).toBeTruthy();
  });
});
