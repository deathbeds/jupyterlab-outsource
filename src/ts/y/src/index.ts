import {Token} from '@phosphor/coreutils';

export const PLUGIN_ID = '@deathbeds/jupyterlab-outsource:y';

/* tslint:disable */
export const IOutsourceY = new Token<IOutsourceY>(PLUGIN_ID);
/* tslint:enable */

export interface IOutsourceY {}

export const CSS = {};

export const API = '/y/ws/';
