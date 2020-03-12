import { UUID } from '@lumino/coreutils';

import { MainAreaWidget, ICommandPalette } from '@jupyterlab/apputils';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILabShell,
  IRouter,
} from '@jupyterlab/application';
import { DocumentWidget } from '@jupyterlab/docregistry';
import { IEditorTracker, FileEditor } from '@jupyterlab/fileeditor';
import { NotebookActions, INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';

import { IOutsourceror, PLUGIN_ID, CommandIds } from '.';
import { Sourceror } from './sourceror';
import { NotebookOutsourceButton } from './buttons/notebook';
import { FileEditorOutsourceButton } from './buttons/editor';

const extension: JupyterFrontEndPlugin<IOutsourceror> = {
  id: PLUGIN_ID,
  autoStart: true,
  provides: IOutsourceror,
  requires: [
    JupyterFrontEnd.IPaths,
    ILabShell,
    IRouter,
    ICommandPalette,
    INotebookTracker,
    IEditorTracker,
  ],
  activate: (
    app: JupyterFrontEnd,
    paths: JupyterFrontEnd.IPaths,
    shell: ILabShell,
    router: IRouter,
    palette: ICommandPalette,
    notebooks: INotebookTracker,
    editors: IEditorTracker
  ): IOutsourceror => {
    const { commands } = app;
    const sourceror = new Sourceror({ notebooks, editors });

    sourceror.executeCellRequested.connect((_, cell) => {
      let executed = false;
      notebooks.forEach(async (nb) => {
        if (executed || nb.model == null) {
          return;
        }
        let cellCount = nb.model.cells.length;
        for (let i = 0; i < cellCount; i++) {
          if (cell.id === nb.model.cells.get(i).id) {
            let oldIndex = nb.content.activeCellIndex;
            nb.content.activeCellIndex = i;
            await NotebookActions.run(nb.content, nb.context.sessionContext);
            executed = true;
            nb.content.activeCellIndex = oldIndex;
            break;
          }
        }
      });
    });
    sourceror.executeTextRequested.connect((_, options) => {
      let executed = false;
      editors.forEach(async (ed) => {
        if (executed) {
          return false;
        }
        if (ed.content.id === options.widgetId) {
          commands.execute('console:inject', {
            activate: false,
            code: options.text,
            path: ed.context.path,
          });
          executed = true;
        }
      });
    });

    sourceror.factoryRegistered.connect((_, factory) => {
      const command = `${CommandIds.newSource}-${factory.id}`;
      const category = 'Notebook Cell Operations';
      commands.addCommand(command, {
        label: `Create new ${factory.name} for input`,
        isEnabled: () => (factory.isEnabled ? factory.isEnabled(sourceror) : true),
        execute: async (args: IOutsourceror.IWidgetOptions) => {
          console.log(args);
          shell.activateById(args.widgetId);
          const current = shell.activeWidget as MainAreaWidget;
          console.log(current.id, current);
          if (current == null || current.content == null) {
            return;
          }

          if (
            !(current.content instanceof FileEditor || current instanceof NotebookPanel)
          ) {
            return;
          }

          const model =
            current instanceof NotebookPanel
              ? current.content.activeCell?.model
              : current.content instanceof FileEditor
              ? current.content.model
              : null;

          if (model == null) {
            return;
          }

          const content = await factory.createWidget({
            model,
            sourceror,
            widget: current.content,
          });

          // Create a MainAreaWidget
          const widget = new MainAreaWidget({ content });
          widget.id = `Outsource-${factory.id}-${UUID.uuid4()}`;
          widget.title.label = `${factory.name}`;
          widget.title.icon = factory.iconClass;
          widget.title.caption = current.title.label
            ? `For Notebook: ${current.title.label}`
            : 'For Notebook:';
          widget.addClass('jp-Outsource-outsource');
          app.shell.add(widget, 'main', {
            ref: current.id,
            mode: 'split-left',
          });

          current.disposed.connect(() => widget.dispose());
        },
      });
      palette.addItem({ command, category });
    });

    sourceror.widgetRequested.connect((_, options: IOutsourceror.IWidgetOptions) => {
      commands.execute(`${CommandIds.newSource}-${options.factory}`, options as any);
    });

    app.docRegistry.addWidgetExtension(
      'Notebook',
      new NotebookOutsourceButton({ sourceror })
    );

    app.docRegistry.addWidgetExtension(
      'Editor',
      new FileEditorOutsourceButton({ sourceror })
    );

    const outsourcePattern = new RegExp(`^${paths.urls.tree}/outsource/([^/]+)/?(.*)`);

    app.commands.addCommand(CommandIds.treeOpen, {
      execute: async (args) => {
        const loc = args as IRouter.ILocation;
        const outsourceMatch = loc.path.match(outsourcePattern);
        console.log(args, loc, outsourceMatch);
        if (outsourceMatch == null) {
          return;
        }
        const [factory, path] = outsourceMatch.slice(1);

        setTimeout(async () => {
          const doc = (await commands.execute('docmanager:open', {
            path,
            factory: 'Editor',
          })) as DocumentWidget;

          await doc.context.ready;

          await commands.execute(`${CommandIds.newSource}-${factory}`, {
            widgetId: doc.id,
            factory,
          });
        }, 0);

        router.navigate(paths.urls.app);

        return router.stop;
      },
    });

    router.register({
      command: CommandIds.treeOpen,
      pattern: outsourcePattern,
      rank: 29,
    });

    return sourceror;
  },
};

export default extension;
