import { Token, ReadonlyPartialJSONObject } from '@lumino/coreutils';
import { Widget } from '@lumino/widgets';
import { ISignal } from '@lumino/signaling';

import { ICellModel } from '@jupyterlab/cells';
import { INotebookTracker } from '@jupyterlab/notebook';
import { CodeEditor } from '@jupyterlab/codeeditor';
import { IEditorTracker } from '@jupyterlab/fileeditor';

export const PLUGIN_ID = '@deathbeds/jupyterlab-outsource';

export const IOutsourceror = new Token<IOutsourceror>(PLUGIN_ID);

export interface IOutsourceror {
  ready: Promise<void>;
  register(factory: IOutsourceror.IFactory): IOutsourceror.IFactory;
  factoryRegistered: ISignal<IOutsourceror, IOutsourceror.IFactory>;
  widgetRequested: ISignal<IOutsourceror, IOutsourceror.IWidgetOptions>;
  isMarkdownCell: boolean;
  isCodeCell: boolean;
  executeCellRequested: ISignal<IOutsourceror, ICellModel>;
  executeTextRequested: ISignal<IOutsourceror, IOutsourceror.IConsoleExecuteOptions>;
  executeCell(cell: ICellModel): void;
  executeText(options: IOutsourceror.IConsoleExecuteOptions): void;
  factories: IOutsourceror.IFactory[];
  factory(id: string): IOutsourceror.IFactory | null;
  requestWidget(options: IOutsourceror.IWidgetOptions): void;
}

export namespace IOutsourceror {
  export interface IOptions {
    notebooks?: INotebookTracker;
    editors?: IEditorTracker;
  }

  export interface IConsoleExecuteOptions {
    text: string;
    widgetId: string;
  }

  export interface IFactory {
    readonly name: string;
    readonly iconClass: string;
    readonly id: string;
    createWidget(options: IFactoryOptions): Promise<Widget>;
    isEnabled?(sourceror?: IOutsourceror): boolean;
  }

  export interface IFactoryOptions {
    model: CodeEditor.IModel;
    sourceror: IOutsourceror;
    widget: Widget;
  }

  export interface IWidgetOptions extends ReadonlyPartialJSONObject {
    factory: string;
    widgetId: string;
  }
}

export const CSS = {
  icon: 'jp-OutsourceIcon'
};

export namespace CommandIds {
  export const newSource = 'outsource:new-outsource';
  export const treeOpen = 'outsource:tree-open';
}
