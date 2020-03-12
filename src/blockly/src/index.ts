import { Token } from '@lumino/coreutils';
import Blockly from 'blockly';
import { IOutsourceror } from '@deathbeds/jupyterlab-outsource/src';

export const PLUGIN_ID = '@deathbeds/jupyterlab-outsource:blockly';

export const IOutsourceBlockly = new Token<IOutsourceBlockly>(PLUGIN_ID);

const NS = 'jp-Outsource-Blockly';

export const CSS = {
  OUTER_WRAPPER: NS,
  WRAPPER: `${NS}-wrapper`
};

export interface IBlocklyMetadata {
  workspace?: string;
  toolbox?: string;
}

export interface IOutsourceBlockly extends IOutsourceror.IFactory {
  addGenerator(generator: IOutsourceBlockly.IGenerator): void;
  generatorForMimeType(mimeType: string): IOutsourceBlockly.IGenerator | null;
}

export namespace IOutsourceBlockly {
  export interface IGenerator {
    name: string;
    mimeTypes: string[];
    start: RegExp;
    end: RegExp;
    workspace: RegExp;
    toSource(options: ISourceOptions): Promise<string>;
  }

  export interface ISourceOptions {
    blockly: typeof Blockly;
    workspace: Blockly.Workspace;
    xml?: string | null;
    header: string;
    footer: string;
  }

  export interface IFactoryOptions extends IOutsourceror.IFactoryOptions {
    factory: IOutsourceBlockly;
  }
}
