import { DocumentSymbolProvider } from 'coc.nvim'
import {
  Range,
  SymbolKind,
  SymbolInformation,
  TextDocument,
  CancellationToken
} from 'vscode-languageserver-protocol';

export class SvgSymbolProvider implements DocumentSymbolProvider {
  provideDocumentSymbols(document: TextDocument, token: CancellationToken): SymbolInformation[]
  {
    var body = document.getText();
    if(token.isCancellationRequested) {
      return undefined;
    }

    let regex = /<([\w\-]+)\s+[^>]*?id=\"([^\"]+)\"[^>]*?>/gi;
    let symbols = [];
    let e: RegExpExecArray = null;
    while(!token.isCancellationRequested && (e = regex.exec(body))) {
      let name = e[1]+'#'+e[2];
      let sP = document.positionAt(e.index)
      let r = Range.create(sP.line, sP.character, sP.line, sP.character + 1)
      symbols.push(
        SymbolInformation.create(
          name,
          SymbolKind.Object,
          r,
          document.uri,
        )
      );
    }
    return symbols;
  }
}
