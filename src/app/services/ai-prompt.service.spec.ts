import { TestBed } from '@angular/core/testing';

import { AiPromptService } from './ai-prompt.service';

describe('AiPromptService', () => {
  let service: AiPromptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiPromptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
