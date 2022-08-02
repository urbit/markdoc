import { tagName } from './shared';
import type { RenderableTreeNode, RenderableTreeNodes } from '../../types';

export default function reactStatic(
  node: RenderableTreeNodes,
  raw?: (content: string, inline: boolean) => string
): string {
  function renderArray(children: RenderableTreeNode[]): string {
    return children.map(render).join(', ');
  }

  function deepRender(value: any): any {
    if (value == null || typeof value !== 'object')
      return JSON.stringify(value);

    if (Array.isArray(value))
      return `[${value.map((item) => deepRender(item)).join(', ')}]`;

    if (['Tag', 'Raw'].includes(value.$$mdtype)) return render(value);

    if (typeof value !== 'object') return JSON.stringify(value);

    const object = Object.entries(value)
      .map(([k, v]) => [JSON.stringify(k), deepRender(v)].join(': '))
      .join(', ');

    return `{${object}}`;
  }

  function render(node: RenderableTreeNodes): string {
    if (Array.isArray(node))
      return `React.createElement(React.Fragment, null, ${renderArray(node)})`;

    if (node === null || typeof node !== 'object') return JSON.stringify(node);

    if (node.$$mdtype === 'Raw') return raw?.(node.content, node.inline) ?? '';

    const {
      name,
      attributes: { class: className, ...attrs } = {},
      children = [],
    } = node;

    if (className) attrs.className = className;

    return `React.createElement(
    tagName(${JSON.stringify(name)}, components),
    ${Object.keys(attrs).length == 0 ? 'null' : deepRender(attrs)},
    ${renderArray(children)})`;
  }

  return `
  (({components = {}} = {}) => {
    ${tagName}
    return ${render(node)};
  })
`;
}
