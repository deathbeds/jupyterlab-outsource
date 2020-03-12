import { Widget } from '@lumino/widgets';
import { IObservableString } from '@jupyterlab/observables';

import { CodeEditor } from '@jupyterlab/codeeditor';

import { EditorState, Transaction, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { exampleSetup } from 'prosemirror-example-setup';

import { CSS, IOutsourceProsemirror } from '.';

import '../style/index.css';
import 'prosemirror-example-setup/style/style.css';
import 'prosemirror-view/style/prosemirror.css';

import { SCHEMA, PARSE, SERIALIZE } from './schema';
import { IOutsourceror } from '@deathbeds/jupyterlab-outsource/src';

export const SOURCEROR: {
  instance: IOutsourceror | null;
} = {
  instance: null,
};

export class ProseMirrorSource extends Widget {
  private _model: CodeEditor.IModel;
  private _wrapper: HTMLDivElement;
  private _view: EditorView<any>;
  private _lastSource: string = '';
  private _factory: IOutsourceProsemirror;
  private _widget: Widget;

  constructor(options: IOutsourceProsemirror.IFactoryOptions) {
    super();
    this.addClass(CSS.OUTER_WRAPPER);
    this.addClass('jp-RenderedHTMLCommon');
    this._factory = options.factory;
    this._model = options.model;
    this._model.value.changed.connect(this._contentChanged, this);
    this._widget = options.widget;

    this.node.appendChild((this._wrapper = document.createElement('div')));
    this._wrapper.className = CSS.WRAPPER;

    let that = this;
    let source = this._model.value.text;

    const { nodeViews, nodes, plugins } = this.create();

    SCHEMA.nodes = {
      ...SCHEMA.nodes,
      ...nodes,
    };

    this._view = new EditorView(this._wrapper, {
      nodeViews,
      state: EditorState.create({
        doc: PARSE(source),
        plugins: [...exampleSetup({ schema: SCHEMA }), ...(plugins || [])],
      }),
      dispatchTransaction(transaction: Transaction) {
        that._pmChanged(transaction);
      },
    });
  }

  execute(text: string) {
    SOURCEROR.instance?.executeText({
      widgetId: this._widget.id,
      text: text,
    });
  }

  create() {
    let nodeViews = {};
    let plugins = [] as Plugin<any, any>[];
    let nodes = {};

    for (const extension of this._factory.getExtensions()) {
      const ep = extension({
        schema: SCHEMA,
        widget: this,
      });
      nodeViews = { ...nodeViews, ...ep.nodeViews };
      if (plugins != null) {
        plugins = [...plugins, ...(ep.plugins || [])] as any;
      }
      nodes = { ...nodes, ...ep.nodes };
    }

    return { nodeViews, nodes, plugins };
  }

  dispose() {
    this._model.value.changed.disconnect(this._contentChanged, this);
    super.dispose();
  }

  private _pmChanged(transaction: Transaction) {
    const newState = this._view.state.apply(transaction);
    this._view.updateState(newState);
    this._lastSource = SERIALIZE(this._view.state.doc);
    if (this._lastSource.trim() === this._model.value.text.trim()) {
      return;
    }
    this._model.value.text = this._lastSource;
  }

  private _contentChanged(
    model: IObservableString,
    change: IObservableString.IChangedArgs
  ) {
    let source = this._model.value.text || '';
    if (this._lastSource && this._lastSource.trim() === source.trim()) {
      return;
    }
    this._lastSource = source;
    this._view.updateState(
      EditorState.create({
        doc: PARSE(source),
        plugins: [...exampleSetup({ schema: SCHEMA })],
        selection: this._view.state.selection
      })
    );
  }
}
