import { useMutation } from '@tanstack/react-query';
import { AIService } from '../ai.service';
import type { AIOperation, AIRequest, AIResponse, MockExample } from '../ai.types';

export function useAIRun(examples: MockExample[]) {
  return useMutation({
    mutationFn: ({
      operation,
      request,
    }: {
      operation: AIOperation;
      request: Omit<AIRequest, 'operation'>;
    }) => AIService.run(examples, operation, request),
  });
}

export function useAIComplete(examples: MockExample[]) {
  return useMutation({
    mutationFn: (request: AIRequest | Omit<AIRequest, 'operation'>) =>
      AIService.complete(examples, request),
  });
}

export function useAIStatus(examples: MockExample[]) {
  return AIService.getStatus(examples);
}
