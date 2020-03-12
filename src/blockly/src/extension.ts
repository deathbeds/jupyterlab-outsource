import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IOutsourceror } from '@deathbeds/jupyterlab-outsource';

import { IOutsourceBlockly, PLUGIN_ID } from '.';

import { BlocklyFactory } from './factory';
import Blockly from 'blockly';

const extension: JupyterFrontEndPlugin<IOutsourceBlockly> = {
  id: PLUGIN_ID,
  autoStart: true,
  provides: IOutsourceBlockly,
  requires: [IOutsourceror],
  activate: (
    _app: JupyterFrontEnd,
    sourceror: IOutsourceror
  ): IOutsourceBlockly => {
    const blockly = new BlocklyFactory(sourceror);
    sourceror.register(blockly);
    return blockly;
  }
};

const python: JupyterFrontEndPlugin<void> = {
  id: `${PLUGIN_ID}-blockly`,
  autoStart: true,
  requires: [IOutsourceBlockly],
  activate: (_app: JupyterFrontEnd, blockly: IOutsourceBlockly): void => {
    blockly.addGenerator({
      name: 'Python',
      mimeTypes: ['text/x-python'],
      start: /^\s*### start blockly/,
      end: /^\s*### end blockly/,
      workspace: /^\s*### workspace: (.*)$/gm,
      toSource: async (options: IOutsourceBlockly.ISourceOptions) => {
        await import('blockly/python');
        const generator = (options.blockly as any).Python as Blockly.Generator;
        generator.INDENT = '    ';
        let source = generator.workspaceToCode(options.workspace).trim();
        source = `${options.header}### start blockly\n${source}\n### end blockly\n`;
        if (options.xml != null) {
          source = `${source}### workspace: ${options.xml}\n`;
        }
        return `${source}${options.footer}`;
      }
    });
  }
};

export default [extension, python];
