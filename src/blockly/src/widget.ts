import { Widget } from '@lumino/widgets';

import { ICodeCellModel, CodeCellModel } from '@jupyterlab/cells';

import { CodeEditor } from '@jupyterlab/codeeditor';

import { IOutsourceror } from '@deathbeds/jupyterlab-outsource';

import Blockly from 'blockly';

import 'blockly/python';

import '../style/index.css';
import 'prosemirror-example-setup/style/style.css';
import 'prosemirror-view/style/prosemirror.css';

import { CSS, PLUGIN_ID, IBlocklyMetadata, IOutsourceBlockly } from '.';

// tslint:disable
import DEFAULT_TOOLBOX from '!!raw-loader!../xml/toolbox.xml';
// tslint:enable

export const SOURCEROR: {
  instance: IOutsourceror | null;
} = {
  instance: null
};

const _onKeyDown = Blockly.onKeyDown;
Blockly.onKeyDown = (evt: KeyboardEvent) => {
  const { code, ctrlKey, shiftKey, metaKey } = evt;
  const model = Workspaces.modelForWorkspace(
    Blockly.getMainWorkspace() as Blockly.WorkspaceSvg
  );

  if (model == null || SOURCEROR.instance == null) {
    return;
  }

  if ((ctrlKey || shiftKey || metaKey) && code === 'Enter') {
    if (!(model instanceof CodeCellModel)) {
      console.warn('TODO: execute plain-old-code model');
      return;
    }
    evt.preventDefault();
    evt.stopImmediatePropagation();
    return SOURCEROR.instance.executeCell(model);
  }

  return _onKeyDown(evt);
};

export class BlocklySource extends Widget {
  private _model: CodeEditor.IModel;
  private _wrapper: HTMLDivElement;
  private _workspace: Blockly.WorkspaceSvg;
  private _lastXml: string;
  private _blockly: IOutsourceBlockly;

  constructor(options: IOutsourceBlockly.IFactoryOptions) {
    super();
    this.addClass(CSS.OUTER_WRAPPER);
    this._model = options.model;
    this._blockly = options.factory;

    this.cellModel?.metadata.changed.connect(this._metadataChanged, this);

    this.node.appendChild((this._wrapper = document.createElement('div')));
    this._wrapper.className = CSS.WRAPPER;
    setTimeout(() => {
      this._workspace = Blockly.inject(this._wrapper, {
        toolbox: this.metadata.toolbox || (DEFAULT_TOOLBOX as string),
        zoom: {
          controls: true,
          wheel: true
        }
      });
      Workspaces.setByModel(this._model, this._workspace);
      this._metadataToWorkspace();
      this._workspace.addChangeListener(() => this._workspaceChanged());
    }, 1);
  }

  get cellModel(): ICodeCellModel | null {
    return this._model instanceof CodeCellModel ? this._model : null;
  }

  private _metadataToWorkspace() {
    const { metadata, generator } = this;

    let xml: string | null = null;

    if (metadata.workspace) {
      xml = metadata.workspace;
    } else if (generator) {
      let r: RegExpExecArray | null;
      /* tslint:disable */
      while ((r = generator.workspace.exec(this._model.value.text))) {
        xml = r[1];
        break;
      }
      /* tslint:enable */
    }

    if (!xml) {
      return;
    }

    this._workspace.clear();
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), this._workspace);
  }

  dispose() {
    super.dispose();
    this.cellModel?.metadata.changed.disconnect(this._metadataChanged, this);
  }

  onResize() {
    if (!this._workspace) {
      return;
    }
    Blockly.svgResize(this._workspace);
  }

  private _workspaceChanged() {
    const meta = this.metadata;
    const xml = Blockly.Xml.domToText(
      Blockly.Xml.workspaceToDom(this._workspace)
    ).trim();
    if (xml === this._lastXml) {
      return;
    }
    this._lastXml = xml;

    if (meta.workspace === this._lastXml) {
      return;
    }

    this.metadata = {
      ...meta,
      workspace: xml
    };
  }

  get generator() {
    return this._blockly.generatorForMimeType(this._model.mimeType);
  }

  get metadata(): IBlocklyMetadata {
    return (this.cellModel?.metadata.get(PLUGIN_ID) as IBlocklyMetadata) || {};
  }

  set metadata(metadata: IBlocklyMetadata) {
    const { cellModel } = this;

    if (cellModel) {
      this.cellModel?.metadata.set(PLUGIN_ID, metadata as any);
    } else {
      this._update(metadata);
    }
  }

  private _metadataChanged() {
    this._update();
  }

  private async _update(metadata?: IBlocklyMetadata) {
    const storeInSource = metadata != null;

    metadata = metadata || this.metadata;

    let oldSource = this._model.value.text || '';
    let origSource = oldSource;
    let header = '';
    let footer = '';

    const { generator } = this;

    if (generator == null) {
      return;
    }

    if (generator.start.test(oldSource)) {
      [header, oldSource] = oldSource.split(generator.start, 2);
    }

    if (generator.end.test(oldSource)) {
      [oldSource, footer] = oldSource.split(generator.end, 2);
    }

    if (this._lastXml !== metadata.workspace) {
      this._metadataToWorkspace();
      return;
    }

    const source = await generator.toSource({
      blockly: Blockly,
      workspace: this._workspace,
      header,
      footer,
      xml: storeInSource ? metadata.workspace : null
    });

    if (origSource.trim() !== source.trim()) {
      this._model.value.text = source;
    }
  }
}

namespace Workspaces {
  const _workspaces = new Map<CodeEditor.IModel, Blockly.WorkspaceSvg[]>();

  export function setByModel(
    model: CodeEditor.IModel,
    workspace: Blockly.WorkspaceSvg
  ) {
    _workspaces.set(model, [...getByModel(model), workspace]);
  }

  export function getByModel(cell: CodeEditor.IModel) {
    return _workspaces.get(cell) || [];
  }

  export function modelForWorkspace(workspace: Blockly.WorkspaceSvg) {
    for (const cell of _workspaces.keys()) {
      const candidate = _workspaces.get(cell);
      if (candidate && candidate.indexOf(workspace) > -1) {
        return cell;
      }
    }
  }
}
