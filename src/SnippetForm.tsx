import { ReactWidget, UseSignal } from '@jupyterlab/apputils';

import { Signal } from '@lumino/signaling';

import { style } from 'typestyle';
import React from 'react';
import { PartialJSONObject } from '@lumino/coreutils';
import '../style/index.css';

//* Interface
export interface ISnippet extends PartialJSONObject {
  category: string;
  command: string;
  label: string;
  content: string;
  caption?: string;
}

export interface IProps {
  callback: (value: ISnippet) => void;
}

const wrapperClass = style({
  marginTop: '6px',
  marginBottom: '0',

  borderBottom: 'var(--jp-border-width) solid var(--jp-border-color2)'
});

const filterInputClass = style({
  boxSizing: 'border-box',
  marginBottom: '12px',

  width: '100%',
  height: '2em',

  /* top | right | bottom | left */
  padding: '1px 18px 2px 7px',

  color: 'var(--jp-ui-font-color1)',
  fontSize: 'var(--jp-ui-font-size1)',
  fontWeight: 300,

  backgroundColor: 'var(--jp-layout-color1)',

  border: 'var(--jp-border-width) solid var(--jp-border-color2)',
  borderRadius: '3px',

  $nest: {
    '&:active': {
      border: 'var(--jp-border-width) solid var(--jp-brand-color1)'
    },
    '&:focus': {
      border: 'var(--jp-border-width) solid var(--jp-brand-color1)'
    }
  }
});
const filterTextareaClass = style({
  boxSizing: 'border-box',
  marginBottom: '12px',

  width: '100%',
  /* top | right | bottom | left */
  padding: '1px 18px 2px 7px',

  color: 'var(--jp-ui-font-color1)',
  fontSize: 'var(--jp-ui-font-size1)',
  fontWeight: 300,

  backgroundColor: 'var(--jp-layout-color1)',

  border: 'var(--jp-border-width) solid var(--jp-border-color2)',
  borderRadius: '3px',

  $nest: {
    '&:active': {
      border: 'var(--jp-border-width) solid var(--jp-brand-color1)'
    },
    '&:focus': {
      border: 'var(--jp-border-width) solid var(--jp-brand-color1)'
    }
  }
});

export class CommandWidget extends ReactWidget {
  constructor() {
    super();
  }

  getValue(): ISnippet {
    const command = this._label
      ? this._label.toLowerCase().split(' ').join('-') + `-${Date.now()}`
      : '';

    return {
      caption: this._caption,
      command,
      content: this._content,
      label: this._label,
      category: this._category
    };
  }

  protected render(): React.ReactElement<any> {
    return (
      <form className={wrapperClass}>
        <label>
          Command
          <UseSignal signal={this._signal}>
            {(): JSX.Element => (
              <input
                type="text"
                className={filterInputClass}
                value={this.getValue().command}
                disabled
              />
            )}
          </UseSignal>
        </label>
        <label>
          Label <span style={{ color: 'red' }}>*</span>
          <input
            required
            type="text"
            id="label"
            className={filterInputClass}
            onChange={e => {
              this._label = e.target.value;
              this._signal.emit();
            }}
          />
        </label>
        <label>
          Category <span style={{ color: 'red' }}>*</span>
          <input
            required
            type="text"
            id="category"
            className={filterInputClass}
            onChange={e => {
              this._category = e.target.value;
              this._signal.emit();
            }}
          />
        </label>
        <label>
          Caption
          <input
            type="text"
            id="caption"
            className={filterInputClass}
            onChange={e => {
              this._caption = e.target.value;
              this._signal.emit();
            }}
          />
        </label>
        <label>
          Content <span style={{ color: 'red' }}>*</span>
          <textarea
            rows={10}
            required
            id="content"
            className={filterTextareaClass}
            onChange={e => {
              this._content = e.target.value;
              this._signal.emit();
            }}
          />
        </label>
      </form>
    );
  }

  private _category = '';
  private _caption = '';
  private _label = '';
  private _content = '';

  private _signal = new Signal<this, void>(this);
}
