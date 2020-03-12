/**
 * Executable code block model, extension of the CodeMirror prose mirror integration
 * in `editor.ts`
 */

import { Schema, Node } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { IOutsourceProsemirror } from '..';
import { ProseMirrorSource } from '../widget';
import { CodeBlockView, arrowHandlers } from './editor';

export class ExecuteCodeBlockView extends CodeBlockView {
  protected widget: ProseMirrorSource;
  constructor(
    node: Node,
    view: EditorView,
    getPos: () => number,
    schema: Schema,
    widget: ProseMirrorSource
  ) {
    super(node, view, getPos, schema);
    this.widget = widget;
  }

  codeMirrorKeymap() {
    const { keymap } = super.codeMirrorKeymap();
    return {
      ...keymap,
      [`Shift-Enter`]: () => this.onExecute()
    };
  }

  onExecute() {
    let text = this.cm.getSelection();
    this.widget.execute(text);
  }

  update(node: Node) {
    const mode = this.node.attrs['params'];
    if (this.cm.getOption('mode') !== mode) {
      this.cm.setOption('mode', mode);
    }
    return super.update(node);
  }
}

export function executeExtension(
  api: IOutsourceProsemirror.IAPI
): IOutsourceProsemirror.IExtensionPoints {
  return {
    nodes: {
      code_block: { ...api.schema.nodes.code_block, isolating: true } as any
    },
    nodeViews: {
      code_block: (node: Node, view: EditorView, getPos: () => number) => {
        return new ExecuteCodeBlockView(
          node,
          view,
          getPos,
          api.schema,
          api.widget
        );
      }
    },
    plugins: [arrowHandlers]
  };
}
