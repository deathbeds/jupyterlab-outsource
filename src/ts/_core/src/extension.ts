import {UUID} from '@phosphor/coreutils';

import {JupyterFrontEnd, JupyterFrontEndPlugin} from '@jupyterlab/application';
import {NotebookActions, INotebookTracker, NotebookPanel} from '@jupyterlab/notebook';

import {MainAreaWidget, ICommandPalette} from '@jupyterlab/apputils';

import {IOutsourcerer, PLUGIN_ID} from '.';
import {Sourcerer} from './sourcerer';
import {NotebookOutsourceButton} from './button';

import '../style/index.css';

const extension: JupyterFrontEndPlugin<IOutsourcerer> = {
  id: PLUGIN_ID,
  autoStart: true,
  provides: IOutsourcerer,
  requires: [ICommandPalette, INotebookTracker],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    notebooks: INotebookTracker
  ): IOutsourcerer => {
    const {commands} = app;
    const sourcerer = new Sourcerer({notebooks});

    // Get the current widget and activate unless the args specify otherwise.
    function getCurrent(): NotebookPanel | null {
      return notebooks.currentWidget;
    }

    sourcerer.executeRequested.connect((_, cell) => {
      let executed = false;
      notebooks.forEach(async (nb) => {
        if (executed) {
          return;
        }
        let cellCount = nb.model.cells.length;
        for (let i = 0; i < cellCount; i++) {
          if (cell.id === nb.model.cells.get(i).id) {
            let oldIndex = nb.content.activeCellIndex;
            nb.content.activeCellIndex = i;
            await NotebookActions.run(nb.content, nb.context.session);
            executed = true;
            nb.content.activeCellIndex = oldIndex;
            break;
          }
        }
      });
    });

    sourcerer.factoryRegistered.connect((_, factory) => {
      const command = `${CommandIds.newSource}-${factory.id}`;
      const category = 'Notebook Cell Operations';
      commands.addCommand(command, {
        label: `Create new ${factory.name} for input`,
        isEnabled: () => (factory.isEnabled ? factory.isEnabled(sourcerer) : true),
        execute: async () => {
          // Clone the OutputArea
          const current = getCurrent();
          const nb = current.content;
          const model = nb.activeCell.model;
          const content = await factory.createWidget({model});

          // Create a MainAreaWidget
          const widget = new MainAreaWidget({content});
          widget.id = `Outsource-${factory.id}-${UUID.uuid4()}`;
          widget.title.label = `${factory.name}`;
          widget.title.icon = factory.iconClass;
          widget.title.caption = current.title.label
            ? `For Notebook: ${current.title.label}`
            : 'For Notebook:';
          widget.addClass('jp-Outsource-outsource');
          current.context.addSibling(widget, {
            ref: current.id,
            mode: 'split-left',
          });

          // Remove the output view if the parent notebook is closed.
          nb.disposed.connect(widget.dispose);
        },
      });
      palette.addItem({command, category});
    });

    sourcerer.widgetRequested.connect((_, factoryId) => {
      commands.execute(`${CommandIds.newSource}-${factoryId}`);
    });

    const outsourceButton = new NotebookOutsourceButton();
    outsourceButton.sourcerer = sourcerer;

    app.docRegistry.addWidgetExtension('Notebook', outsourceButton);
    return sourcerer;
  },
};

export default extension;

namespace CommandIds {
  export const newSource = 'outsource:new-outsource';
}
