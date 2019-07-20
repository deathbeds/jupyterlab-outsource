import {IDisposable, DisposableDelegate} from '@phosphor/disposable';

// import {ISignal, Signal} from '@phosphor/signaling';

// import {ToolbarButton} from '@jupyterlab/apputils';

import {DocumentRegistry} from '@jupyterlab/docregistry';

// import {IObservableJSON} from '@jupyterlab/observables';

import {NotebookPanel, INotebookModel} from '@jupyterlab/notebook';

// import {CSS} from '.';

import {IOutsourcerer} from '.';
import {OutsourcePicker} from './picker';

/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export class NotebookOutsourceButton
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  // readonly widgetRequested: ISignal<any, void> = new Signal<any, void>(this);
  /**
   * Create a new extension object.
   */
  sourcerer: IOutsourcerer;

  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    let picker = new OutsourcePicker();
    let model = new OutsourcePicker.Model();
    model.sourcerer = this.sourcerer;
    picker.model = model;

    // panel.model.metadata.changed.connect(metaUpdated);
    // metaUpdated(panel.model.metadata);

    panel.toolbar.insertItem(9, 'outsource', picker);

    return new DisposableDelegate(() => {
      picker.dispose();
    });
  }
}
