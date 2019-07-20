import {Token} from '@phosphor/coreutils';

export const PLUGIN_ID = '@deathbeds/jupyterlab-outsource:prosemirror';

/*
@import url("prosemirror-view/style/prosemirror.css");
@import url("prosemirror-menu/style/menu.css");
*/

// import 'prosemirror-view/style/prosemirror.css';
// import 'prosemirror-menu/style/menu.css';
import '../style/index.css';

/* tslint:disable */
/**
 * The notebook source manager
 */
export const IOutsourceProsemirror = new Token<IOutsourceProsemirror>(PLUGIN_ID);
/* tslint:enable */

export interface IOutsourceProsemirror {}

export const CSS = {
  OUTER_WRAPPER: `jp-Outsource-ProseMirror`,
  WRAPPER: `jp-Outsource-ProseMirror-wrapper`,
};
