import type { Tool } from '../tools';

interface Props {
  tool: Tool;
  onNavigate?: (panelId: string, title: string) => void;
}

export function ToolCard({ tool, onNavigate }: Props) {
  function handleClick() {
    if (tool.status === 'active' && tool.panelId) {
      onNavigate?.(tool.panelId, tool.title);
    }
  }

  return (
    <div
      class={`tool-card${tool.status === 'disabled' ? ' disabled' : ''}`}
      onClick={handleClick}
    >
      <div class="tool-card-content">
        <div class="tool-card-header">
          <div class="tool-pastille">
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              dangerouslySetInnerHTML={{ __html: tool.iconPaths }}
            />
          </div>
          <span class="tool-card-title">{tool.title}</span>
          {tool.status === 'new' && <span class="tag-new">NOUVEAU</span>}
          {tool.status === 'disabled' && <span class="tag-soon">BIENTÔT</span>}
        </div>
        <p class="tool-card-desc">{tool.desc}</p>
      </div>
      <div class="tool-card-tags">
        <span class="tag-category">{tool.category}</span>
      </div>
    </div>
  );
}
