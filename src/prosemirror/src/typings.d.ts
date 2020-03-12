
declare module 'prosemirror-example-setup' {
  import { Plugin } from 'prosemirror-state';
  import { Schema } from 'prosemirror-model';
  export interface IOptions {
    schema: Schema;
    mapKeys?: any;
    menuBar?: boolean;
    floatingMenu?: boolean;
    menuContent?: any;
    history?: boolean;
  }
  export function exampleSetup(options: IOptions): Plugin[];
}
