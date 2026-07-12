# ADR-005: Use Tailwind CSS for Styling

## Status

Accepted

## Context

EngineerOS needs a CSS framework for building a responsive, accessible UI.

## Decision

Use Tailwind CSS 4 as the styling framework, providing:
- Utility-first approach
- Dark mode support
- Responsive design
- Customizable design system

## Consequences

### Positive
- Rapid UI development
- Consistent design system
- Excellent dark mode support
- Small production bundle

### Negative
- HTML can become verbose
- Learning curve for new developers
- Less semantic HTML
- Potential for inconsistent styling

## Alternatives Considered

1. **CSS Modules:** Rejected due to slower development
2. **Styled Components:** Rejected due to runtime overhead
3. **Bootstrap:** Rejected due to design limitations

## References

- Tailwind CSS Documentation
- Tailwind UI
