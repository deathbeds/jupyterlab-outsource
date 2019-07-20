import {Widget} from '@phosphor/widgets';

import {
  IOutsourceFactory,
  IOutsourceFactoryOptions,
  IOutsourcerer,
} from '@deathbeds/jupyterlab-outsource';

import * as widget from './widget';

export class BlocklyFactory implements IOutsourceFactory {
  readonly id = 'blockly';
  readonly name = 'Blockly';
  readonly iconClass = 'jp-Outsource-BlocklyIcon';

  constructor(sourceror: IOutsourcerer) {
    widget.SOURCEROR.instance = sourceror;
  }

  isEnabled(sourceror: IOutsourcerer) {
    return sourceror.isCodeCell;
  }

  async createWidget(options: IOutsourceFactoryOptions): Promise<Widget> {
    const {BlocklySource} = await import(/* webpackChunkName: "blockly" */ './widget');
    return new BlocklySource(options);
  }
}
