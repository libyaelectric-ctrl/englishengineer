# ADR-004: Use Anthropic Claude for AI

## Status

Accepted

## Context

EngineerOS needs an AI provider for the coaching feature.

## Decision

Use Anthropic Claude (Haiku 4.5) as the AI provider, providing:

- Natural language understanding
- Educational content generation
- Conversation management
- Safety features

## Consequences

### Positive

- High-quality AI responses
- Strong safety features
- Good educational content generation
- Competitive pricing

### Negative

- API dependency
- Rate limits
- Cost per token
- Response latency

## Alternatives Considered

1. **OpenAI GPT:** Rejected due to safety concerns
2. **Gemini:** Rejected due to availability
3. **Local LLM:** Rejected due to quality concerns

## References

- Anthropic Documentation
- Claude API Guide
