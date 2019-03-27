import { RenameProvider, ProviderResult, workspace } from 'coc.nvim';
import {
  TextDocument,
  Position,
  Range,
  CancellationToken,
  TextEdit,
  WorkspaceEdit
} from 'vscode-languageserver-protocol';
import * as utils from './utils';

export class SvgRenameProvider implements RenameProvider {

  showNonameMessage() {
    workspace.showMessage('Rename only work in tag name, id attribute or #id.')
  }

  calcRange(document: TextDocument, start: number | Position, size: number) : Range {
    if(typeof start == 'number') {
      var startPos = document.positionAt(start);
      var endPos = document.positionAt(start + size);
      return Range.create(startPos, endPos);
    } else {
      return this.calcRange(document, document.offsetAt(start), size);
    }
  }

  provideIdRename(
    document: TextDocument,
    oldId: string,
    newId: string,
    token: CancellationToken
  ): ProviderResult<WorkspaceEdit> {
    const body = document.getText();
    const regex = new RegExp(`((id=["']${oldId}["'])|(url\\(#${oldId}\\))|(href=["']#${oldId}["']))`, 'g');
    const textEdits: TextEdit[] = []
    let exp: RegExpExecArray = null;
    while(!token.isCancellationRequested && (exp = regex.exec(body))) {
      if(exp[2]) {
        textEdits.push({
          range: this.calcRange(document, exp.index + 4, oldId.length),
          newText: newId
        })
      } else if(exp[3]) {
        textEdits.push({
          range: this.calcRange(document, exp.index + 5, oldId.length),
          newText: newId
        })
      } else if (exp[4]) {
        textEdits.push({
          range: this.calcRange(document, exp.index + 7, oldId.length),
          newText: newId
        })
      }
    }
    if (textEdits.length) {
      return {
        changes: {
          [document.uri]: textEdits
        }
      };
    }
    return null
  }

  provideRenameStartTag(
    document: TextDocument,
    position: Position,
    oldName: string,
    newName: string
  ) : ProviderResult<WorkspaceEdit> {
    let level = 0;
    let body = document.getText();
    let offset = document.offsetAt(position);

    let tagInfo : utils.ITagMatchInfo = null;
    const textEdits: TextEdit[] = []
    while(tagInfo = utils.getPrevTagFromOffset(body, offset)) {
      if(!tagInfo.tagName.startsWith('/') && !tagInfo.simple){
        level--;
        if(level <=0 ) {
          textEdits.push({
            range: this.calcRange(document, tagInfo.index + 1, oldName.length),
            newText: newName
          })
          textEdits.push({
            range: this.calcRange(document, position, oldName.length),
            newText: newName
          })
          break;
        }
      }
      else if(tagInfo.tagName.startsWith('/')) {
        level++;
      }
      offset = tagInfo.index - 2;
    }
    return {
      changes: {
        [document.uri]: textEdits
      }
    };
  }

  provideRenameEndTag(
    document: TextDocument,
    position: Position,
    oldName: string,
    newName: string
  ) : ProviderResult<WorkspaceEdit> {
    let level = 0;
    let body = document.getText();
    let startOffset = document.offsetAt(position);
    let offset = startOffset + oldName.length;

    let tagInfo : utils.ITagMatchInfo = null;
    const textEdits: TextEdit[] = []
    while(tagInfo = utils.getNextTagFromOffset(body, offset)) {
      // console.log('tagInfo', tagInfo.tagName);
      if(!tagInfo.tagName.startsWith('/') && !tagInfo.simple){
        level++;
      }
      else if(tagInfo.tagName.startsWith('/')) {
        level--;
        if(level <=0 ) {
          textEdits.push({
            range: this.calcRange(document, tagInfo.index + 2, oldName.length),
            newText: newName
          })
          textEdits.push({
            range: this.calcRange(document, position, oldName.length),
            newText: newName
          })
          break;
        }
      }
      offset = tagInfo.index + oldName.length;
    }
    return {
      changes: {
        [document.uri]: textEdits
      }
    };
  }

  provideRenameEdits(
    document: TextDocument,
    position: Position,
    newName: string,
    token: CancellationToken
  ): ProviderResult<WorkspaceEdit> {
    const doc = workspace.getDocument(document.uri)
    // TODO: getWordRangeAtPosition regex pattern support
    let wordRange = doc.getWordRangeAtPosition(position, '(<\/)<#_');
    if(wordRange && !utils.isRangeEmpty(wordRange)) {
      let word = document.getText(wordRange);
      // console.log('word', word);
      if(word.startsWith('</')) {
        return this.provideRenameStartTag(
          document,
          utils.translateRange(wordRange.start, 0, 2),
          word.substr(2),
          newName
        );
      } else if(word.startsWith('/')) {
        return this.provideRenameStartTag(
          document,
          utils.translateRange(wordRange.start, 0, 1),
          word.substr(1),
          newName
        );
      } else if(word.startsWith('<')) {
        return this.provideRenameEndTag(
          document,
          utils.translateRange(wordRange.start, 0, 1),
          word.substr(1),
          newName
        );
      } else if(word.startsWith('#')) {
        return this.provideIdRename(document, word.substr(1), newName, token);
      } else {
        // TODO: /id="[a-zA-Z0-9_]+"/ regex pattern
        wordRange = doc.getWordRangeAtPosition(position, '=_"');
        if(wordRange && !utils.isRangeEmpty(wordRange)) {
          const word = document.getText(wordRange)
          if (/id=["'][a-zA-Z0-9_]+["']/.test(word)) {
            return this.provideIdRename(document, word.slice(4, -1), newName, token);
          }
        }
      }
    }
    return null;
  }
}
