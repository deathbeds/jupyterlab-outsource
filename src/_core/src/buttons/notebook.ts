import { IDisposable, DisposableDelegate } from '@lumino/disposable';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { NotebookPanel, INotebookModel } from '@jupyterlab/notebook';

import { IOutsourceror } from '..';
import { OutsourcePicker } from '../picker';

/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export class NotebookOutsourceButton
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  /**
   * Create a new extension object.
   */
  sourceror: IOutsourceror;

  constructor(options: NotebookOutsourceButton.IOptions) {
    this.sourceror = options.sourceror;
  }

  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    let picker = new OutsourcePicker({
      sourceror: this.sourceror,
      widgetId: panel.id
    });

    panel.toolbar.insertItem(9, 'outsource', picker);

    return new DisposableDelegate(() => {
      picker.dispose();
    });
  }
}

export namespace NotebookOutsourceButton {
  export interface IOptions {
    sourceror: IOutsourceror;
  }
}
