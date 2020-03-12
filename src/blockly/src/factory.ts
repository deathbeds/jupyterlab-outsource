import { Widget } from '@lumino/widgets';

import { IOutsourceror } from '@deathbeds/jupyterlab-outsource';

import * as widget from './widget';
import { IOutsourceBlockly } from '.';

export class BlocklyFactory implements IOutsourceBlockly {
  readonly id = 'blockly';
  readonly name = 'Blockly';
  readonly iconClass = 'jp-Outsource-BlocklyIcon';

  constructor(sourceror: IOutsourceror) {
    widget.SOURCEROR.instance = sourceror;
  }

  isEnabled(sourceror: IOutsourceror) {
    return sourceror.isCodeCell;
  }

  addGenerator(generator: IOutsourceBlockly.IGenerator) {
    Private.generators.set(generator.name, generator);
  }

  generatorForMimeType(mimeType: string) {
    for (const generator of Private.generators.values()) {
      if (generator && generator.mimeTypes.indexOf(mimeType) !== -1) {
        return generator;
      }
    }
    return null;
  }

  async createWidget(
    options: IOutsourceBlockly.IFactoryOptions
  ): Promise<Widget> {
    const { BlocklySource } = await import(
      /* webpackChunkName: "blockly" */ './widget'
    );
    return new BlocklySource({ ...options, factory: this });
  }
}

namespace Private {
  export const generators = new Map<string, IOutsourceBlockly.IGenerator>();
}
