import { tagName } from './shared';
import type { createElement, Fragment, ReactNode } from 'react';
import type { RenderableTreeNodes, Scalar } from '../../types';

type ReactShape = Readonly<{
  createElement: typeof createElement;
  Fragment: typeof Fragment;
}>;

export default function dynamic(
  node: RenderableTreeNodes,
  React: ReactShape,
  { components = {} } = {},
  raw?: (content: string, inline: boolean) => ReactNode
) {
  function deepRender(value: any): any {
    if (value == null || typeof value !== 'object') return value;

    if (Array.isArray(value)) return value.map((item) => deepRender(item));

    if (['Tag', 'Raw'].includes(value.$$mdtype)) return render(value);

    if (typeof value !== 'object') return value;

    const output: Record<string, Scalar> = {};
    for (const [k, v] of Object.entries(value)) output[k] = deepRender(v);
    return output;
  }

  function render(node: RenderableTreeNodes): ReactNode {
    if (Array.isArray(node))
      return React.createElement(React.Fragment, null, ...node.map(render));

    if (node === null || typeof node !== 'object') return node;

    if (node.$$mdtype === 'Raw') return raw?.(node.content, node.inline);

    const {
      name,
      attributes: { class: className, ...attrs } = {},
      children = [],
    } = node;

    if (className) attrs.className = className;

    return React.createElement(
      tagName(name, components),
      Object.keys(attrs).length == 0 ? null : deepRender(attrs),
      ...children.map(render)
    );
  }

  return render(node);
}
