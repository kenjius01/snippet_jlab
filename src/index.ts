import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { INotebookTracker, NotebookActions } from '@jupyterlab/notebook';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { Menu } from '@lumino/widgets';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { PartialJSONObject } from '@lumino/coreutils';

import { Dialog, showDialog } from '@jupyterlab/apputils';
/** 

 * Initialization data for the snippetsexample extension. 

 */
const PLUGIN_ID = 'snippet_jlab:plugin';

type TSnippetItem = {
  command: string;
  label: string;
  content: string;
  caption: string;
};

//* Interface
interface ISnippet extends TSnippetItem, PartialJSONObject {
  category?: string;
  items?: TSnippetItem[];
}

const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,

  autoStart: true,

  requires: [ISettingRegistry, INotebookTracker, IMainMenu],

  activate: (
    app: JupyterFrontEnd,
    settingRegistry: ISettingRegistry,
    tracker: INotebookTracker,
    mainMenu: IMainMenu
  ) => {
    console.log('JupyterLab extension Code snippet is activated!');
    const { commands } = app;

    async function displayInformation(): Promise<void> {
      const result = await showDialog({
        title: 'Code snippet',
        body: 'List code snippet has changed. You will need to reload JupyterLab to see the changes.',
        buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'Reload' })]
      });

      if (result.button.accept) {
        location.reload();
      }
    }

    //* Function add command
    const onAddCommand = (item: TSnippetItem) => {
      commands.addCommand(item?.command, {
        label: item?.label,

        caption: item?.caption,

        execute: () => {
          const current = tracker.currentWidget;

          const notebook = current!.content;

          NotebookActions.insertBelow(notebook);

          const activeCell = notebook.activeCell;

          activeCell!.model.value.text = item?.content;
        }
      });
    };
    const updateSettings = (settings: ISettingRegistry.ISettings): void => {
      const snippets: ISnippet[] =
        (settings?.composite?.snippets as ISnippet[]) || [];

      //* Add command for each code snippet
      snippets?.map((snippet: ISnippet) => {
        if (!snippet.category) {
          onAddCommand(snippet);
          return;
        }
        (snippet.items || []).map((item: TSnippetItem) => {
          onAddCommand(item);
        });
      });

      //* Render to ui menu item
      const snippetMenu = new Menu({ commands });
      snippetMenu.title.label = 'Code Snippets';
      (snippets || []).map((snippet: ISnippet) => {
        if (!snippet.category) {
          snippetMenu.addItem({ command: snippet?.command });
          return;
        }
        const subMenu = new Menu({ commands });
        subMenu.title.label = snippet?.category;
        snippet?.items?.map((item: TSnippetItem) => {
          subMenu.addItem({ command: item?.command });
        });
        snippetMenu.addItem({ type: 'submenu', submenu: subMenu });
      });

      mainMenu.addMenu(snippetMenu, { rank: 300 });
    };

    //* Update settings
    Promise.all([settingRegistry.load(PLUGIN_ID), app.restored])
      .then(([settings]) => {
        updateSettings(settings);

        settings?.changed.connect(() => {
          displayInformation();
          updateSettings(settings);
        });
      })
      .catch(err => {
        console.log({ err });
      });
  }
};

export default plugin;
