import {Widget} from '@phosphor/widgets';

import {ICodeCellModel} from '@jupyterlab/cells';

import {IOutsourceFactoryOptions, IOutsourcerer} from '@deathbeds/jupyterlab-outsource';

import Blockly, {IWorkspace} from 'node-blockly/browser';

import {CSS, PLUGIN_ID, IBlocklyMetadata, START_BLOCKLY, END_BLOCKLY} from '.';

// tslint:disable
import DEFAULT_TOOLBOX from '!!raw-loader!../xml/toolbox.xml';
// tslint:enable

export const SOURCEROR: {
  instance: IOutsourcerer;
} = {
  instance: null,
};

const _onKeyDown = Blockly.onKeyDown_;
Blockly.onKeyDown_ = (evt: KeyboardEvent) => {
  const {code, ctrlKey} = evt;
  const cell = Workspaces.cellForWorkspace(Blockly.getMainWorkspace());

  if (ctrlKey && code === 'Enter') {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    return SOURCEROR.instance.execute(cell);
  }

  return _onKeyDown(evt);
};

export class BlocklySource extends Widget {
  private _cellModel: ICodeCellModel;
  private _wrapper: HTMLDivElement;
  private _workspace: IWorkspace;
  private _lastXml: string;

  constructor(options: IOutsourceFactoryOptions) {
    super();
    this.addClass(CSS.OUTER_WRAPPER);
    this._cellModel = options.model as ICodeCellModel;
    this._cellModel.metadata.changed.connect(this._metadataChanged, this);

    this.node.appendChild((this._wrapper = document.createElement('div')));
    this._wrapper.className = CSS.WRAPPER;
    setTimeout(() => {
      this._workspace = Blockly.inject(this._wrapper, {
        toolbox: this.metadata.toolbox || (DEFAULT_TOOLBOX as string),
        zoom: {
          controls: true,
          wheel: true,
        },
      });
      Workspaces.setByCell(this._cellModel, this._workspace);
      this._metadataToWorkspace();
      this._workspace.addChangeListener(() => this._workspaceChanged());
    }, 1);
  }

  private _metadataToWorkspace() {
    const xml = this.metadata.workspace;
    if (!xml) {
      return;
    }
    this._workspace.clear();
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), this._workspace);
  }

  dispose() {
    super.dispose();
    this._cellModel.metadata.changed.disconnect(this._metadataChanged, this);
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
      workspace: xml,
    };
  }

  get metadata(): IBlocklyMetadata {
    return (this._cellModel.metadata.get(PLUGIN_ID) as IBlocklyMetadata) || {};
  }

  set metadata(metadata: IBlocklyMetadata) {
    this._cellModel.metadata.set(PLUGIN_ID, metadata as any);
  }

  private _metadataChanged() {
    let oldSource = this._cellModel.value.text || '';
    let origSource = oldSource;
    let header = '';
    let footer = '';

    if (oldSource.indexOf(START_BLOCKLY.python) > -1) {
      [header, oldSource] = oldSource.split(START_BLOCKLY.python, 2);
    }

    if (oldSource.indexOf(END_BLOCKLY.python) > -1) {
      [oldSource, footer] = oldSource.split(END_BLOCKLY.python, 2);
    }

    if (this._lastXml !== this.metadata.workspace) {
      this._metadataToWorkspace();
      return;
    }

    (Blockly.Python as any).INDENT = '    ';

    let source = Blockly.Python.workspaceToCode(this._workspace).trim();

    source = `${header}${START_BLOCKLY.python}\n${source}\n${
      END_BLOCKLY.python
    }${footer}`;

    if (origSource !== source) {
      this._cellModel.value.text = source;
    }
  }
}

namespace Workspaces {
  const _Workspaces = new Map<ICodeCellModel, IWorkspace[]>();

  export function setByCell(cell: ICodeCellModel, workspace: IWorkspace) {
    _Workspaces.set(cell, [...getByCell(cell), workspace]);
  }

  export function getByCell(cell: ICodeCellModel) {
    return _Workspaces.get(cell) || [];
  }

  export function cellForWorkspace(workspace: IWorkspace) {
    for (const cell of _Workspaces.keys()) {
      if (_Workspaces.get(cell).indexOf(workspace) > -1) {
        return cell;
      }
    }
  }
}
