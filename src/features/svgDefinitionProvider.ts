import {
  DefinitionProvider,
  ProviderResult,
  workspace
} from 'coc.nvim';
import {
  TextDocument,
  Position,
  CancellationToken,
  Definition,
  Location
} from 'vscode-languageserver-protocol';
import * as utils from './utils';

export class SvgDefinitionProvider implements DefinitionProvider {
  provideDefinition(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): ProviderResult<Definition> {
    const doc = workspace.getDocument(document.uri)
    let idRefRange = doc.getWordRangeAtPosition(position, '="\'(#)');
    if(idRefRange && !utils.isRangeEmpty(idRefRange)) {
      const word = document.getText(idRefRange)
      if (/url\(#[^\)\r\n]+\)/.test(word)) {
        let m = word.match(/url\(#([^)]+)\)/)
        if (m && m['1']) {
          let id = m['1'].trim()
          let body = document.getText();
          let definePoint = body.indexOf(' id="'+id+'"');
          if(definePoint > 0) {
            let startTag = utils.getInStartTagFromOffset(token, body, definePoint);
            if(startTag) {
              let pos = document.positionAt(startTag.index);
              return Location.create(document.uri, { start: pos, end: pos });
            }
          }
        }
      } else if (/href=("|')[^\1]+\1/.test(word)) {
        let body = document.getText();
        let idRef = document.getText(idRefRange);
        let id = idRef.slice(7, -1)
        let definePoint = body.indexOf(' id="' + id + '"');
        if (definePoint <= 0 ) {
          definePoint = body.indexOf(" id='" + id + "'");
        }
        if(definePoint > 0) {
          let startTag = utils.getInStartTagFromOffset(token, body, definePoint);
          if(startTag) {
            let pos = document.positionAt(startTag.index);
            return Location.create(document.uri, { start: pos, end: pos });
          }
        }
      }
    }
    return null;
  }
}
