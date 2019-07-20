import {JupyterFrontEnd, JupyterFrontEndPlugin} from '@jupyterlab/application';
import {IOutsourcerer} from '@deathbeds/jupyterlab-outsource';

import {IOutsourceBlockly, PLUGIN_ID} from '.';

import {BlocklyFactory} from './factory';

import '../style/index.css';
import 'prosemirror-example-setup/style/style.css';
import 'prosemirror-view/style/prosemirror.css';

const extension: JupyterFrontEndPlugin<IOutsourceBlockly> = {
  id: PLUGIN_ID,
  autoStart: true,
  provides: IOutsourceBlockly,
  requires: [IOutsourcerer],
  activate: (_app: JupyterFrontEnd, sourcerer: IOutsourcerer): IOutsourceBlockly => {
    return sourcerer.register(new BlocklyFactory(sourcerer));
  },
};

export default extension;
