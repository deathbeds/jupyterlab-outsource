/*
  Ported from:
  https://github.com/ProseMirror/website/blob/master/example/codemirror/index.js
  MIT License
  Copyright (C) 2015-2017 by Marijn Haverbeke <marijnh@gmail.com> and others
*/
import { Node, Schema } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import {
  Selection,
  EditorState,
  Transaction,
  TextSelection
} from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';

import { exitCode } from 'prosemirror-commands';
import { undo, redo } from 'prosemirror-history';

import CodeMirror from 'codemirror';
import { IOutsourceProsemirror } from '..';

export type TDirection =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'forward'
  | 'backward';

export class CodeBlockView {
  cm: CodeMirror.Editor;
  view: EditorView;
  node: Node;
  getPos: () => number;
  dom: HTMLElement;
  updating: boolean;
  schema: Schema;

  constructor(
    node: Node,
    view: EditorView,
    getPos: () => number,
    schema: Schema
  ) {
    // Store for later
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.schema = schema;

    // Create a CodeMirror instance
    this.cm = new (CodeMirror as any)(null, {
      value: this.node.textContent,
      lineNumbers: true,
      extraKeys: this.codeMirrorKeymap()
    });

    // The editor's outer node is our DOM representation
    this.dom = this.cm.getWrapperElement();
    // CodeMirror needs to be in the DOM to properly initialize, so
    // schedule it to update itself
    setTimeout(() => this.cm.refresh(), 20);

    // This flag is used to avoid an update loop between the outer and
    // inner editor
    this.updating = false;
    // Propagate updates from the code editor to ProseMirror
    this.cm.on('cursorActivity', () => {
      if (!this.updating) {
        this.forwardSelection();
      }
    });
    this.cm.on('changes', () => {
      if (!this.updating) {
        this.valueChanged();
      }
    });
    this.cm.on('focus', () => this.forwardSelection());
  }

  forwardSelection() {
    if (!this.cm.hasFocus()) {
      return;
    }
    let state = this.view.state;
    let selection = this.asProseMirrorSelection(state.doc);
    if (!selection.eq(state.selection)) {
      this.view.dispatch(state.tr.setSelection(selection));
    }
  }

  asProseMirrorSelection(doc: Node) {
    let offset = this.getPos() + 1;
    let anchor = this.cm.indexFromPos(this.cm.getCursor('anchor')) + offset;
    let head = this.cm.indexFromPos(this.cm.getCursor('head')) + offset;
    return TextSelection.create(doc, anchor, head);
  }

  setSelection(anchor: number, head: number) {
    this.cm.focus();
    this.updating = true;
    this.cm.setSelection(
      this.cm.posFromIndex(anchor),
      this.cm.posFromIndex(head)
    );
    this.updating = false;
  }

  valueChanged() {
    let change = computeChange(this.node.textContent, this.cm.getValue());
    if (change) {
      let start = this.getPos() + 1;
      let tr = this.view.state.tr.replaceWith(
        start + change.from,
        start + change.to,
        (change.text ? this.schema.text(change.text) : null) as any
      );
      this.view.dispatch(tr);
    }
  }

  codeMirrorKeymap() {
    let view = this.view;
    let mod = /Mac/.test(navigator.platform) ? 'Cmd' : 'Ctrl';
    return (CodeMirror as any).normalizeKeyMap({
      Up: () => this.maybeEscape('line', -1),
      Left: () => this.maybeEscape('char', -1),
      Down: () => this.maybeEscape('line', 1),
      Right: () => this.maybeEscape('char', 1),
      [`${mod}-Z`]: () => undo(view.state, view.dispatch),
      [`Shift-${mod}-Z`]: () => redo(view.state, view.dispatch),
      [`${mod}-Y`]: () => redo(view.state, view.dispatch),
      'Ctrl-Enter': () => {
        if (exitCode(view.state, view.dispatch)) {
          view.focus();
        }
      }
    });
  }

  maybeEscape(unit: string, dir: number) {
    let pos = this.cm.getCursor();
    if (
      this.cm.somethingSelected() ||
      pos.line !== (dir < 0 ? this.cm.firstLine() : this.cm.lastLine()) ||
      (unit === 'char' &&
        pos.ch !== (dir < 0 ? 0 : this.cm.getLine(pos.line).length))
    ) {
      return CodeMirror.Pass;
    }
    this.view.focus();
    let targetPos = this.getPos() + (dir < 0 ? 0 : this.node.nodeSize);
    let selection = Selection.near(this.view.state.doc.resolve(targetPos), dir);
    this.view.dispatch(
      this.view.state.tr.setSelection(selection).scrollIntoView()
    );
    this.view.focus();
  }

  update(node: Node): boolean {
    if (node.type !== this.node.type) {
      return false;
    }
    this.node = node;
    let change = computeChange(this.cm.getValue(), node.textContent);
    if (change) {
      this.updating = true;
      this.cm.replaceRange(
        change.text,
        this.cm.posFromIndex(change.from),
        this.cm.posFromIndex(change.to)
      );
      this.updating = false;
    }
    return true;
  }

  selectNode() {
    this.cm.focus();
  }

  stopEvent() {
    return true;
  }
}

// computeChange{
export function computeChange(oldVal: string, newVal: string) {
  if (oldVal === newVal) {
    return null;
  }
  let start = 0;
  let oldEnd = oldVal.length;
  let newEnd = newVal.length;
  while (
    start < oldEnd &&
    oldVal.charCodeAt(start) === newVal.charCodeAt(start)
  ) {
    ++start;
  }
  while (
    oldEnd > start &&
    newEnd > start &&
    oldVal.charCodeAt(oldEnd - 1) === newVal.charCodeAt(newEnd - 1)
  ) {
    oldEnd--;
    newEnd--;
  }
  return { from: start, to: oldEnd, text: newVal.slice(start, newEnd) };
}

function arrowHandler(dir: TDirection) {
  return (
    state: EditorState,
    dispatch: (transaction: Transaction) => void,
    view: EditorView
  ) => {
    if (state.selection.empty && view.endOfTextblock(dir)) {
      let side = dir === 'left' || dir === 'up' ? -1 : 1;
      let $head = state.selection.$head;
      let nextPos = Selection.near(
        state.doc.resolve(side > 0 ? $head.after() : $head.before()),
        side
      );
      if (nextPos.$head && nextPos.$head.parent.type.name === 'code_block') {
        dispatch(state.tr.setSelection(nextPos));
        return true;
      }
    }
    return false;
  };
}

export const arrowHandlers = keymap({
  ArrowLeft: arrowHandler('left'),
  ArrowRight: arrowHandler('right'),
  ArrowUp: arrowHandler('up'),
  ArrowDown: arrowHandler('down')
});

export function outsourceExtension(
  schema: Schema
): IOutsourceProsemirror.IExtensionPoints {
  return {
    nodes: {
      code_block: { ...schema.nodes.code_block, isolating: true } as any
    },
    nodeViews: {
      code_block: (node: Node, view: EditorView, getPos: () => number) => {
        return new CodeBlockView(node, view, getPos, schema);
      }
    },
    plugins: [arrowHandlers]
  };
}
