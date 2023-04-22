import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { INotebookTracker, NotebookActions } from '@jupyterlab/notebook';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { Menu } from '@lumino/widgets';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { showDialog, Dialog } from '@jupyterlab/apputils';

import { CommandWidget, ISnippet } from './SnippetForm';
import '../style/index.css';
/** 

 * Initialization data for the snippetsexample extension. 

 */
const PLUGIN_ID = 'snippet_jlab:plugin';
const COMMAND_SNIPPET = {
  create: 'snippet_jlab:create'
};

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
    let snippets: ISnippet[] = [];

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

    async function showDialogAddSnippet(): Promise<void> {
      const result = await showDialog({
        title: 'Code snippet',
        body: new CommandWidget(),
        buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'Save' })]
      });

      if (result.button.accept) {
        await settingRegistry.set(PLUGIN_ID, 'snippets', [
          ...snippets,
          result?.value
        ]);
        displayInformation();
      }
    }

    //* Function add command
    const onAddCommand = (item: ISnippet) => {
      commands.addCommand(item?.command, {
        label: item?.label,

        caption: item?.caption || '',

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
      snippets = settings?.composite?.snippets as ISnippet[];
      //* Add command for each code snippet
      snippets?.map((snippet: ISnippet) => {
        onAddCommand(snippet);
      });

      //* Render to ui menu item
      const listCategory = [
        ...new Set(
          (snippets || [])
            ?.map((item: ISnippet) => item.category)
            .filter(Boolean)
        )
      ];

      if (listCategory.length > 0) {
        listCategory?.map((category: string) => {
          const listSnippetByCategory = (snippets || []).filter(
            (item: ISnippet) => item.category === category
          );
          const subMenu = new Menu({ commands });
          subMenu.title.label = category;
          listSnippetByCategory.map((snippet: ISnippet) => {
            subMenu.addItem({ command: snippet.command });
          });
          snippetMenu.addItem({ type: 'submenu', submenu: subMenu });
        });
      }
    };

    const addSnippet = new Menu({ commands });
    commands.addCommand(COMMAND_SNIPPET.create, {
      label: 'Create Code snippet',
      execute: () => {
        showDialogAddSnippet();
      }
    });
    addSnippet.title.label = 'Create';
    addSnippet.addItem({ command: COMMAND_SNIPPET.create });
    mainMenu.addMenu(addSnippet, { rank: 1000 });

    //List code snippet
    const snippetMenu = new Menu({ commands });
    snippetMenu.title.label = 'Code Snippets';
    mainMenu.addMenu(snippetMenu, { rank: 900 });

    //* Update settings
    Promise.all([settingRegistry.load(PLUGIN_ID), app.restored])
      .then(([settings]) => {
        updateSettings(settings);

        settings?.changed.connect(() => {
          updateSettings(settings);
        });
      })
      .catch(err => {
        console.log({ err });
      });
  }
};

export default plugin;

/*
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
*/
