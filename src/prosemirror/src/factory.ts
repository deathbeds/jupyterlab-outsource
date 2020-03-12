import { Widget } from '@lumino/widgets';

import { IOutsourceror } from '@deathbeds/jupyterlab-outsource';

import { IOutsourceProsemirror } from '.';

import { SCHEMA } from './schema';

import * as widget from './widget';

export class ProsemirrorFactory implements IOutsourceProsemirror {
  readonly id = 'prosemirror';
  readonly name = 'ProseMirror';
  readonly iconClass = 'jp-Outsource-ProseMirrorIcon';

  constructor(sourceror: IOutsourceror) {
    widget.SOURCEROR.instance = sourceror;
  }

  isEnabled(sourceror: IOutsourceror) {
    return sourceror.isMarkdownCell || sourceror.isCodeCell;
  }

  addExtension(name: string, extension: IOutsourceProsemirror.IExtension) {
    Private._extensions.set(name, extension);
  }

  getExtensions() {
    return [...Private._resolvedExtensions.values()];
  }

  async createWidget(options: IOutsourceror.IFactoryOptions): Promise<Widget> {
    const { ProseMirrorSource } = await import(
      /* webpackChunkName: "prosemirror" */ './widget'
    );
    await Private.resolveExtensions();
    return new ProseMirrorSource({ ...options, factory: this, schema: SCHEMA });
  }
}

namespace Private {
  export const _extensions = new Map<string, IOutsourceProsemirror.IExtension>();
  export const _resolvedExtensions = new Map<string, IOutsourceProsemirror.IExtend>();

  export async function resolveExtensions() {
    for (const [extName, extension] of Private._extensions.entries()) {
      if (!_resolvedExtensions.has(extName)) {
        _resolvedExtensions.set(extName,  await extension.init());
      }
    }
  }
}
