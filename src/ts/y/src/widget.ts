import {Widget} from '@phosphor/widgets';
import {MainAreaWidget} from '@jupyterlab/apputils';
import { ServerConnection } from '@jupyterlab/services';
import {URLExt} from '@jupyterlab/coreutils';

import io from 'socket.io-client';

import Y from 'yjs/src/y';
import YWebSocket from 'y-websockets-client/src/Websockets-client';
import YArray from 'y-array/src/Array';
import YMap from 'y-map/src/Map';
import YText from 'y-text/src/Text';
import YMemory from 'y-memory/src/Memory';

import {API} from '.';

let id = 0;

[YWebSocket, YMemory, YArray, YMap, YText].map((fn: any) => fn(Y));

function xsrf() {
  return document.cookie.match('\\b_xsrf=([^;]*)\\b');
}

export class YTextArea extends Widget {
  private settings: ServerConnection.ISettings;
  private _y: any;

  constructor(options?: Widget.IOptions, settings?: ServerConnection.ISettings) {
    options = options || {};
    options.node = document.createElement('textarea');
    super(options);
    this.settings = settings || ServerConnection.makeSettings();
  }

  protected makeSocket(url: string) {
    const socket = (io as any)(url, {
      path: url.split(window.location.origin)[1],
      transportOptions: {
        polling: {
          extraHeaders: {
            'X-CSRFToken': xsrf()
          }
        }
      }
    });
    console.log('socket', socket);
    return socket;
  }

  protected async makeY(socket: any, url: string) {
    const y = await (Y as any)({
      db: {name: 'memory'},
      connector: {
        name: 'websockets-client',
        room: 'hello-jupyter',
        socket,
        url,
      },
      share: {textarea: 'Text'}
    });
    console.log('y', y);
    return y;
  }

  protected onY(y: any) {
    // bind the textarea to a shared text element
    y.share.textarea.bindTextarea(this.node);
    console.log('bound');
  }

  async onAfterShow() {
    if (this._y) {
      console.log('already shown');
      return;
    }

    const url = URLExt.join(this.settings.baseUrl, API);
    const socket = this.makeSocket(url);

    try {
      this._y = await this.makeY(socket, url);
      this.onY(this._y);
      console.log(this._y);
    } catch (err) {
      console.error(err);
    }
  }
}

export async function makeWidget() {
  const content = new YTextArea();
  const _id = id++;

  content.title.label = `Y ${_id}`;

  const w = new MainAreaWidget({content});
  w.id = `id-y-${_id}`;

  return w;
}
