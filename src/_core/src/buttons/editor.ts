import { IDisposable, DisposableDelegate } from '@lumino/disposable';

import {
  DocumentRegistry,
  DocumentWidget,
  DocumentModel
} from '@jupyterlab/docregistry';

import { IOutsourceror } from '..';
import { OutsourcePicker } from '../picker';

export class FileEditorOutsourceButton
  implements DocumentRegistry.IWidgetExtension<DocumentWidget, DocumentModel> {
  sourceror: IOutsourceror;

  constructor(options: FileEditorOutsourceButton.IOptions) {
    this.sourceror = options.sourceror;
  }

  createNew(
    panel: DocumentWidget,
    context: DocumentRegistry.IContext<DocumentModel>
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

export namespace FileEditorOutsourceButton {
  export interface IOptions {
    sourceror: IOutsourceror;
  }
}
