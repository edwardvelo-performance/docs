export function Mermaid({ code }) {
  return <div dangerouslySetInnerHTML={{ __html: `<div class="mermaid">${code}</div>` }} />;
}