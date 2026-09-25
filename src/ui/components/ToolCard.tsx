import type { Tool } from '../tools';
import { IconContainer } from './IconContainer';
import { Tag } from './Tag';

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
          <IconContainer size="medium">
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              dangerouslySetInnerHTML={{ __html: tool.iconPaths }}
            />
          </IconContainer>
          <span class="tool-card-title">{tool.title}</span>
          {tool.status === 'new' && <Tag variant="new">NOUVEAU</Tag>}
          {tool.status === 'disabled' && <Tag variant="tertiary">BIENTÔT</Tag>}
        </div>
        <p class="tool-card-desc">{tool.desc}</p>
      </div>
      <div class="tool-card-tags">
        <Tag variant="default">{tool.category}</Tag>
      </div>
    </div>
  );
}
