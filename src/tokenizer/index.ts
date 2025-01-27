import MarkdownIt from 'markdown-it/lib';
import annotations from './plugins/annotations';
import frontmatter from './plugins/frontmatter';
import type Token from 'markdown-it/lib/token';
export default class Tokenizer {
  private parser: MarkdownIt;

  constructor(
    config: MarkdownIt.Options & { allowIndentation?: boolean } = {}
  ) {
    this.parser = new MarkdownIt(config);
    this.parser.use(annotations, 'annotations', {});
    this.parser.use(frontmatter, 'frontmatter', {});
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this.parser.use(require('markdown-it-sup'));
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    // this.parser.use(require('markdown-it-footnote'));
    this.parser.disable([
      'lheading',
      // Disable indented `code_block` support https://spec.commonmark.org/0.30/#indented-code-block
      'code',
    ]);
  }

  tokenize(content: string): Token[] {
    return this.parser.parse(content.toString(), {});
  }
}
