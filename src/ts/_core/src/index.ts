import {Token} from '@phosphor/coreutils';
import {Widget} from '@phosphor/widgets';
import {ISignal} from '@phosphor/signaling';

import {ICellModel} from '@jupyterlab/cells';
import {INotebookTracker} from '@jupyterlab/notebook';

export const PLUGIN_ID = '@deathbeds/jupyterlab-outsource';

/* tslint:disable */
/**
 * The notebook source manager
 */
export const IOutsourcerer = new Token<IOutsourcerer>(PLUGIN_ID);
/* tslint:enable */

export interface IOutsourcerer {
  ready: Promise<void>;
  register(factory: IOutsourceFactory): IOutsourceFactory;
  factoryRegistered: ISignal<IOutsourcerer, IOutsourceFactory>;
  widgetRequested: ISignal<IOutsourcerer, string>;
  isMarkdownCell: boolean;
  isCodeCell: boolean;
  executeRequested: ISignal<IOutsourcerer, ICellModel>;
  execute(cell: ICellModel): void;
  factories: IOutsourceFactory[];
  factory(id: string): IOutsourceFactory;
  requestWidget(factoryName: string): void;
}

export interface IOutsourcererOptions {
  notebooks?: INotebookTracker;
}

export interface IOutsourceFactory {
  readonly name: string;
  readonly iconClass: string;
  readonly id: string;
  createWidget(options: IOutsourceFactoryOptions): Promise<Widget>;
  isEnabled?(sourceror?: IOutsourcerer): boolean;
}

export interface IOutsourceFactoryOptions {
  // FIXME: probably some other upstream model
  model: ICellModel;
  sourceror?: IOutsourcerer;
}

export const CSS = {
  icon: 'jp-OutsourceIcon',
};
