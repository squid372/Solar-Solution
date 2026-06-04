import { CSSResultGroup, css } from 'lit';

// The futuristic card ships its own scoped styles inside the rendered template,
// so the element only needs a minimal host base here.
export const styles: CSSResultGroup = css`
  :host {
    display: block;
  }
`;
