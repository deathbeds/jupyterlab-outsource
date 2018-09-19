import {Token} from '@phosphor/coreutils';

export const PLUGIN_ID = '@deathbeds/jupyterlab-outsource:blockly';

import '../style/index.css';

/* tslint:disable */
/**
 * The notebook source manager
 */
export const IOutsourceBlockly = new Token<IOutsourceBlockly>(PLUGIN_ID);
/* tslint:enable */

export interface IOutsourceBlockly {}

const NS = 'jp-Outsource-Blockly';

export const CSS = {
  OUTER_WRAPPER: NS,
  WRAPPER: `${NS}-wrapper`,
};
