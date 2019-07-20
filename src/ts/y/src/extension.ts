import {JupyterFrontEnd, JupyterFrontEndPlugin} from '@jupyterlab/application';
import { ILauncher } from '@jupyterlab/launcher';

import {IOutsourceY, PLUGIN_ID} from '.';


import '../style/index.css';

const CMD = 'outsource-y:scratch-path';

const extension: JupyterFrontEndPlugin<IOutsourceY> = {
  id: PLUGIN_ID,
  autoStart: true,
  provides: IOutsourceY,
  requires: [ILauncher],
  activate: (_app: JupyterFrontEnd, launcher: ILauncher): IOutsourceY => {
    _app.commands.addCommand(CMD, {
      label: 'Y',
      execute: async (_args: any) => {
        (window as any).ws = WebSocket;
        const {makeWidget} = await import(/* webpackChunkName: "yjs" */ './widget');
        const widget = await makeWidget();
        _app.shell.add(widget, 'main');
        console.log('added widget');
      }
    });

    launcher.add({
      command: CMD,
      category: 'Other'
    });

    return {};
  },
};

export default extension;
