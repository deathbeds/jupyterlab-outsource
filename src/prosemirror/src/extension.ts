import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';

import { IOutsourceror } from '@deathbeds/jupyterlab-outsource';

import { IOutsourceProsemirror, PLUGIN_ID } from '.';

import { ProsemirrorFactory } from './factory';

const extension: JupyterFrontEndPlugin<IOutsourceProsemirror> = {
  id: PLUGIN_ID,
  autoStart: true,
  provides: IOutsourceProsemirror,
  requires: [IOutsourceror],
  activate: (
    _app: JupyterFrontEnd,
    sourceror: IOutsourceror
  ): IOutsourceProsemirror => {
    const prosemirror = new ProsemirrorFactory(sourceror);
    sourceror.register(prosemirror);
    return prosemirror;
  },
};

const codeBlock: JupyterFrontEndPlugin<void> = {
  id: `${PLUGIN_ID}-block-codemirror-execute`,
  autoStart: true,
  requires: [IOutsourceProsemirror],
  activate: (_app: JupyterFrontEnd, prosemirror: IOutsourceProsemirror): void => {

    async function init() {
      const {executeExtension} = await import('./blocks/execute');
      return executeExtension;
    }

    prosemirror.addExtension('code_block', {
      init: init
    });
  },
};

export default [extension, codeBlock];
