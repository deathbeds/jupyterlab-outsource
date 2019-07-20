import {PromiseDelegate} from '@phosphor/coreutils';
import {Signal} from '@phosphor/signaling';
import {INotebookTracker} from '@jupyterlab/notebook';
import {MarkdownCell, CodeCell, ICellModel} from '@jupyterlab/cells';

import {IOutsourcerer, IOutsourcererOptions, IOutsourceFactory} from '.';

export class Sourcerer implements IOutsourcerer {
  private _ready = new PromiseDelegate<void>();
  private _factoryRegistered = new Signal<this, IOutsourceFactory>(this);
  private _executeRequested = new Signal<this, ICellModel>(this);
  private _widgetRequested = new Signal<this, string>(this);
  private _notebooks: INotebookTracker;

  constructor(options: IOutsourcererOptions) {
    this._notebooks = options.notebooks;
    this._ready.resolve(void 0);
  }

  get ready() {
    return this._ready.promise;
  }

  get executeRequested() {
    return this._executeRequested;
  }

  get widgetRequested() {
    return this._widgetRequested;
  }

  requestWidget(factoryName: string) {
    this._widgetRequested.emit(factoryName);
  }

  get factoryRegistered() {
    return this._factoryRegistered;
  }

  get isMarkdownCell() {
    const {activeCell} = this._notebooks;
    return activeCell instanceof MarkdownCell;
  }

  get isCodeCell() {
    const {activeCell} = this._notebooks;
    return activeCell instanceof CodeCell;
  }

  register(factory: IOutsourceFactory) {
    Private.register(factory);
    this._factoryRegistered.emit(factory);
    return factory;
  }

  get factories() {
    return Array.from(Private.factories());
  }

  factory(id: string) {
    return Private.factory(id);
  }

  execute(cell: ICellModel) {
    this._executeRequested.emit(cell);
  }
}

namespace Private {
  const _factories = new Map<string, IOutsourceFactory>();

  export function register(factory: IOutsourceFactory): void {
    _factories.set(factory.id, factory);
  }

  export function factory(id: string) {
    return _factories.get(id);
  }

  export function factories() {
    return _factories.values();
  }
}
