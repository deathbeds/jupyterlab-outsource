import {Widget} from '@phosphor/widgets';

import {
  IOutsourceFactory,
  IOutsourceFactoryOptions,
  IOutsourcerer,
} from '@deathbeds/jupyterlab-outsource';

export class ProsemirrorFactory implements IOutsourceFactory {
  readonly id = 'prosemirror';
  readonly name = 'ProseMirror';
  readonly iconClass = 'jp-Outsource-ProseMirrorIcon';

  isEnabled(sourceror: IOutsourcerer) {
    return sourceror.isMarkdownCell || sourceror.isCodeCell;
  }

  async createWidget(options: IOutsourceFactoryOptions): Promise<Widget> {
    const {
      ProseMirrorSource,
    } = await import(/* webpackChunkName: "prosemirror" */ './widget');
    return new ProseMirrorSource(options);
  }
}
