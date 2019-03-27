import { readdirSync } from 'fs';
import { join, extname } from 'path';
import {
  DocumentFormattingEditProvider,
  ProviderResult,
  workspace,
  commands,
  TextDocumentWillSaveEvent,
} from 'coc.nvim';
import {
  Position,
  Range,
  TextDocument,
  CancellationToken,
  FormattingOptions,
  TextEdit,
} from 'vscode-languageserver-protocol';
import vscUri from 'vscode-uri';
import svgo from 'svgo';

export class SvgFormattingProvider implements DocumentFormattingEditProvider {
  private _plugins: string[];

  private disableFormatOnSave: boolean = false;

  private _lastKnownFormatDocument: string;
  private _lastKnownFormatTime: number = 0;
  private _lastKnownFormatChanged = false;

  constructor() {
    var pluginDirs = join(__dirname, '..', '..', '..', 'node_modules', 'svgo', 'plugins');
    this._plugins = readdirSync(pluginDirs)
      .map((file) => file.replace(extname(file), ''));


    workspace.onDidChangeConfiguration(() => {
      this.updateConfiguration();
    });
    this.updateConfiguration();

    workspace.onWillSaveTextDocument(e => {
      const uri = vscUri.parse(e.document.uri)
      if (this.disableFormatOnSave &&
        this._lastKnownFormatChanged &&
        uri.fsPath == this._lastKnownFormatDocument &&
        this._lastKnownFormatTime + 50 > new Date().getTime()
      ) {
        // In Save Format.
        this.restoreUnformatDocument(e);
      }
    }, this);
  }

  updateConfiguration() {
    let svgConf = workspace.getConfiguration('svg');
    this.disableFormatOnSave = svgConf.get<boolean>("disableFormatOnSave");
  }

  restoreUnformatDocument(e: TextDocumentWillSaveEvent) {
    commands.executeCommand('default:undo');
  }

  provideDocumentFormattingEdits(
    document: TextDocument,
    options: FormattingOptions,
    token: CancellationToken
  ): ProviderResult<TextEdit[]> {
    let config = workspace.getConfiguration('svg.format.plugins');
    let plugins = this._plugins
    .map((configName) => {
      let plugin = {};
      plugin[configName] = config[configName] || false;
      return plugin;
    }) as any[];
    let formatter = new svgo({
      plugins: plugins,
      js2svg: { pretty: true }
    });

    return new Promise((resolve) => {
      var oldText = document.getText();
      var p = formatter.optimize(oldText);
      p.then((result) => {
        const textEdit = {
          range: Range.create(
            Position.create(0, 0),
            Position.create(document.lineCount, 0)
          ),
          newText: result.data
        }
        resolve([textEdit]);
        this._lastKnownFormatChanged = (oldText != result.data);
        this._lastKnownFormatDocument = vscUri.parse(document.uri).fsPath
        this._lastKnownFormatTime = new Date().getTime();
      }).catch((err: Error) =>{
        workspace.showMessage(`Unable to format because of an error: ${err.message}`)
        resolve(null)
      });
    });
  }
}
