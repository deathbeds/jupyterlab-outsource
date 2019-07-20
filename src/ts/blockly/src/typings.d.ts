declare module 'node-blockly/browser' {
  export interface IWorkspace {
    addChangeListener(callback: Function): void;
    clear(): void;
  }
  export interface ILanguage {
    workspaceToCode(workspace: IWorkspace): string;
    INDENT: string;
  }
  /*
  collapse:	boolean	Allows blocks to be collapsed or expanded. Defaults to true if the toolbox has categories, false otherwise.
  comments:	boolean	Allows blocks to have comments. Defaults to true if the toolbox has categories, false otherwise.
  css:	boolean	If false, don't inject CSS (providing CSS becomes the document's responsibility). Defaults to true.
  disable:	boolean	Allows blocks to be disabled. Defaults to true if the toolbox has categories, false otherwise.
  grid:	object	Configures a grid which blocks may snap to. See Grid...
  horizontalLayout:	boolean	If true toolbox is horizontal, if false toolbox is vertical. Defaults to false.
  maxBlocks:	number	Maximum number of blocks that may be created. Useful for student exercises. Defaults to Infinity.
  media:	string	Path from page (or frame) to the Blockly media directory. Defaults to "https://blockly-demo.appspot.com/static/media/".
  oneBasedIndex:	boolean	If true list and string operations should index from 1, if false index from 0. Defaults to true.
  readOnly:	boolean	If true, prevent the user from editing. Supresses the toolbox and trashcan. Defaults to false.
  rtl:	boolean	If true, mirror the editor (for Arabic or Hebrew locales). See RTL demo. Defaults to false.
  scrollbars:	boolean	Sets whether the workspace is scrollable or not. Defaults to true if the toolbox has categories, false otherwise.
  sounds:	boolean	If false, don't play sounds (e.g. click and delete). Defaults to true.
  toolbox:	XML nodes or string	Tree structure of categories and blocks available to the user. See below for more information.
  toolboxPosition:	string	If "start" toolbox is on top (if horizontal) or left (if vertical and LTR) or right (if vertical and RTL). If "end" toolbox is on opposite side. Defaults to "start".
  trashcan:	boolean	Displays or hides the trashcan. Defaults to true if the toolbox has categories, false otherwise.
  zoom:	object	Configures zooming behaviour. See Zoom...
  */

  export interface IInjectOptions {
    collapse?: boolean;
    comments?: boolean;
    css?: boolean;
    grid?: object;
    horizontalLayout?: boolean;
    maxBlocks?: number;
    media?: string;
    oneBasedIndex?: boolean;
    rtl?: boolean;
    scrollbars?: boolean;
    sounds?: boolean;
    toolbox?: HTMLElement | string;
    toolboxPosition?: 'start' | 'end';
    trashcan?: boolean;
    zoom?: IZoom;
  }
  export interface IZoom {
    controls?: boolean;
    wheel?: boolean;
  }
  export interface IXml {
    workspaceToDom(workspace: IWorkspace): HTMLElement;
    domToWorkspace(node: Element, workspace: IWorkspace): string[];
    domToText(node: Element): string;
    clearWorkspaceAndLoadFromXml(node: Element, workspace: IWorkspace): string[];
    textToDom(xml: string): Element;
  }

  export interface IBlockly {
    inject(node: HTMLElement, opts?: IInjectOptions): IWorkspace;
    Python: ILanguage;
    Xml: IXml;
    svgResize(workspace: IWorkspace): void;
    bindEventWithChecks_(
      node: HTMLElement,
      event: string,
      context: any,
      callback: Function
    ): any[][];
    onKeyDown_(evt: Event): any;
    getMainWorkspace(): IWorkspace;
  }
  const blocklyStatic: IBlockly;
  export default blocklyStatic;
}

declare module '!!raw-loader!../xml/toolbox.xml' {

}
