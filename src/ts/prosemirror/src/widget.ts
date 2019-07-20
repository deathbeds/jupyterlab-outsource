import {Widget} from '@phosphor/widgets';
import {IObservableString} from '@jupyterlab/observables';

import {IMarkdownCellModel} from '@jupyterlab/cells';

import {EditorState, Transaction} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import * as Markdown from 'prosemirror-markdown';
import {IOutsourceFactoryOptions} from '@deathbeds/jupyterlab-outsource';
import * as exampleSetup from 'prosemirror-example-setup';

import {CSS} from '.';

export class ProseMirrorSource extends Widget {
  private _model: IMarkdownCellModel;
  private _wrapper: HTMLDivElement;
  private _view: EditorView<any>;
  private _lastSource: string = '';

  constructor(options: IOutsourceFactoryOptions) {
    super();
    this.addClass(CSS.OUTER_WRAPPER);
    this.addClass('jp-RenderedHTMLCommon');
    this._model = options.model as IMarkdownCellModel;
    this._model.value.changed.connect(this._contentChanged, this);

    this.node.appendChild((this._wrapper = document.createElement('div')));
    this._wrapper.className = CSS.WRAPPER;

    let that = this;
    let source = this._model.toJSON().source;

    this._view = new EditorView(this._wrapper, {
      state: EditorState.create({
        doc: (Markdown as any).defaultMarkdownParser.parse(
          typeof source === 'string' ? source : source.join('')
        ),
        plugins: (exampleSetup as any).exampleSetup({schema: (Markdown as any).schema}),
      }),
      dispatchTransaction(transaction: Transaction) {
        that._pmChanged(transaction);
      },
    });
  }

  dispose() {
    this._model.value.changed.disconnect(this._contentChanged, this);
    super.dispose();
  }

  private _pmChanged(transaction: Transaction) {
    const newState = this._view.state.apply(transaction);
    this._view.updateState(newState);
    this._lastSource = (Markdown as any).defaultMarkdownSerializer.serialize(
      this._view.state.doc
    );
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
        doc: (Markdown as any).defaultMarkdownParser.parse(source),
        plugins: (exampleSetup as any).exampleSetup({schema: (Markdown as any).schema}),
      })
    );
  }
}
