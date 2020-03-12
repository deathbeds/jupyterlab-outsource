import * as Markdown from 'prosemirror-markdown';
import { Schema } from 'prosemirror-model';

export const SCHEMA = (Markdown as any).schema as Schema;
export function PARSE(text: string) {
    return Markdown.defaultMarkdownParser.parse(text);
};
export const SERIALIZE = (content: any, options?: any) => Markdown.defaultMarkdownSerializer.serialize(content, options);
