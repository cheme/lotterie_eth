import { ParamsModule } from './params.module';

describe('ParamsModule', () => {
  let paramsModule: ParamsModule;

  beforeEach(() => {
    paramsModule = new ParamsModule();
  });

  it('should create an instance', () => {
    expect(paramsModule).toBeTruthy();
  });
});
