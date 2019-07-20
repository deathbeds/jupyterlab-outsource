import React from 'react';

import {IOutsourcerer} from '.';

import {VDomModel, VDomRenderer} from '@jupyterlab/apputils';

export class OutsourcePicker extends VDomRenderer<OutsourcePicker.Model> {
  protected render(): React.ReactElement<any> {
    let m = this.model;

    // Bail if there is no model.
    if (!m || !m.sourcerer) {
      return;
    }

    return (
      <select
        className="jp-mod-styled jp-Outsource-Picker"
        value={m.value}
        onChange={this.onChange}
      >
        <option value="" />
        {m.sourcerer.factories.map(({name, id}) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    );
  }

  onChange = (evt: React.FormEvent<any>) => {
    const {value} = evt.currentTarget;
    if (value == null) {
      return;
    }
    this.model.sourcerer.requestWidget(value);
    this.model.value = '';
  };
}

export namespace OutsourcePicker {
  export class Model extends VDomModel {
    private _sourcerer: IOutsourcerer;
    private _value: string = '';

    get value() {
      return this._value;
    }

    set value(value: string) {
      this._value = value;
      this.stateChanged.emit(void 0);
    }

    get sourcerer() {
      return this._sourcerer;
    }

    set sourcerer(sourcerer: IOutsourcerer) {
      this._sourcerer = sourcerer;
      sourcerer.factoryRegistered.connect(() => this.stateChanged.emit(void 0));
      this.stateChanged.emit(void 0);
    }
  }
}
