import { HoverProvider, Document, workspace } from 'coc.nvim';
import { TextDocument, Position, CancellationToken, Hover } from 'vscode-languageserver-protocol';

import {
  ISvgJson,
  getSvgJson
} from './svg';

import * as utils from './utils';

let svg : ISvgJson = null;

export class SvgHoverProvider implements HoverProvider {

  constructor() {
    if(svg == null) {
      svg = getSvgJson();
    }
  }

  provideHover(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Hover {
    const doc: Document = workspace.getDocument(document.uri)
    let range = doc.getWordRangeAtPosition(position);

    let prevChar = utils.getOffsetString(document, range.start, -1);
    let nextChar = utils.getOffsetString(document, range.end, 1);
    let tag = null, attribute = null;
    if(prevChar == '<' && nextChar == ' ') {
      tag = document.getText(range);
    }
    else if(/\s/.test(prevChar) && nextChar == '=') {
      attribute = document.getText(range);
    }

    if(tag) {
      if(svg.elements[tag]){
        let ele = svg.elements[tag];
        utils.createHover({
          language: 'markdown',
          value: '<' + tag +'>\n' + ele.documentation
        })
      }
    }

    if(attribute) {
      if(svg.attributes[attribute]){
        let ele = svg.attributes[attribute];
        utils.createHover({
          language: 'markdown',
          value: '[' + attribute +']\n' + ele.documentation
        })
      }
    }

    return undefined;
  }
}
