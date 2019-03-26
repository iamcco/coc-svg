import {
  Hover,
  TextDocument,
  Position,
  Range,
  CancellationToken,
  MarkupContent,
  MarkedString,
} from 'vscode-languageserver-protocol';

// cover cb type async function to promise
export function pcb(
  cb: (...args: any[]) => void,
): (...args: any[]) => Promise<any> {
  return function(...args: any[]): Promise<any> {
    return new Promise((resolve) => {
      cb(...args, function(error: NodeJS.ErrnoException, ...args: any[]) {
        resolve([error, ...args])
      })
    })
  }
}

/**
 * 通过 lineDelta 和 characterDelta 和 position 返回新的 position
 */
export function translateRange(
  p: Position,
  lineDelta: number = 0,
  characterDelta: number = 0
): Position {
  return {
    line: p.line + lineDelta,
    character: p.character + characterDelta
  }
}

/**
 * 判断 range.start 是否和 range.end 相等
 */
export function isRangeEmpty(range: Range): boolean {
  const { start, end } = range
  return start.line === end.line && start.character === end.character
}

/**
 * 判断两个 position 是否相等
 */
export function positionEqual(pre: Position, next: Position): boolean {
  return pre.line === next.line && pre.character === next.character
}

/**
 * 判断 pre 是否在 next 前面
 */
export function positionIsBefore(pre: Position, next: Position): boolean {
  return pre.line < next.line || (pre.line === next.line && pre.character < next.character)
}

export function createHover(
  contents: MarkupContent | MarkedString | MarkedString[],
  range?: Range
): Hover {
  return {
    contents,
    range
  }
}

/**
 * 从数组删除一个成员
 * @param {Array<T>} array 要删除成员的数组。
 * @param {T} item 要删除的成员。
 * @returns {number} 如果删除成功，返回成员原来在数组中的索引，否则返回 -1。
 */
export function removeItem<T>(array: Array<T>, item: T): number {
  let idx = array.indexOf(item);
  if (idx > -1) {
    array.splice(idx, 1);
  }
  return idx;
}

/**
 * 描述查找标签的匹配信息。
 */
export interface ITagMatchInfo {
  /**
   * 找到的标签的开头 `<` 所在索引。
   */
  index: number,

    /**
     * 标签名称，如果是结束标签，它会以 `/` 开头。
     */
    tagName: string,

    /**
     * 标签的属性段信息，如果是独立标签如 `<br/>`，它会以 `/` 结尾。
     */
    tagAttrs?: string,

    /**
     * 标签是否为独立标签，如 `<br/>`。
     */
    simple: boolean
}

/**
 * 描述查找标签属性的匹配信息
 */
export interface ITagAttributeMatchInfo extends ITagMatchInfo {

  /**
   * 属性名称
   */
  attrName: string;

  /**
   * 属性值
   */
  attrValue?: string;

  /**
   * 属性值的开始和结束位置
   */
  attrValueRange?: [number, number];
}

/**
 * 返回上一个 XML 标签的位置和名称，它可能是一个开始标签、结束标签。
 * @param {TextDocument} document 当前文档。
 * @param {Position} position 相对位置
 */
export function getPrevTag(document: TextDocument, position: Position): ITagMatchInfo {
  let doc = document.getText();
  return getPrevTagFromOffset(doc, document.offsetAt(position));
}

/**
 * 返回上一个 XML 标签的位置和名称，它可能是一个开始标签、结束标签。
 * @param {TextDocument} document 当前文档。
 * @param {Position} position 相对位置
 */
export function getPrevTagFromOffset(body: string, offset: number): ITagMatchInfo {
  let doc = body.substr(0, offset);
  let match = /<([\/\!\?]?[\w\-]*)(\s*[^>]*)>[^>]*?$/gi.exec(doc);
  if (match && match.length > 1) {
    let attrs = match[2];
    return {
      index: match.index,
      tagName: match[1],
      tagAttrs: attrs,
      simple: attrs && attrs.endsWith('/')
    };
  }
  return undefined;
}

export function getNextTagFromOffset(body: string, offset: number): ITagMatchInfo {
  let doc = body.substr(offset);
  let match = /(^[^<]*?)<([\/\!\?]?[\w\-]*)(\s*[^>]*)>/gi.exec(doc);
  if (match && match.length > 1) {
    let attrs = match[3];
    return {
      index: match[1].length + offset,
      tagName: match[2],
      tagAttrs: attrs,
      simple: attrs && attrs.endsWith('/')
    };
  }
  return undefined;
}

/**
 * 返回父级 XML 标签的位置和名称。
 */
export function getParentTag(token: CancellationToken, document: TextDocument, position: Position): ITagMatchInfo {
  let doc = document.getText();
  return getParentTagFromOffset(token, doc, document.offsetAt(position));
}

/**
 * 返回父级 XML 标签的位置和名称。
 */
export function getParentTagFromOffset(token: CancellationToken, body: string, offset: number): ITagMatchInfo {

  let stack = [];
  let tag: { index: number, tagName: string, simple: boolean } = null;
  while (tag = getPrevTagFromOffset(body, offset)) {
    if (token.isCancellationRequested) {
      return undefined;
    }
    offset = tag.index;
    if (tag.simple === true) {
      continue;
    } else if (tag.tagName[0] == '/') {
      stack.push(tag.tagName.substr(1));
    } else if (stack.length == 0) {
      return tag;
    } else {
      stack.pop();
    }
  }
  return undefined;
}

/**
 * 如果当前在一个标签头内，返回 XML 标签信息，否则返回 undefined。
 */
export function getInStartTag(
  token: CancellationToken,
  doc: TextDocument,
  position: Position
): ITagMatchInfo {
  return getInStartTagFromOffset(token, doc.getText(), doc.offsetAt(position));
}

/**
 * 如果当前在一个标签头内，返回 XML 标签信息，否则返回 undefined。
 */
export function getInStartTagFromOffset(
  token: CancellationToken,
  body: string,
  offset: number
): ITagMatchInfo {
  let doc = body.substr(0, offset);
  let match = /<([\/\!\?]?[\w\-]*)(\s*[^>]*?)$/gi.exec(doc);
  if (match && match.length > 1) {
    let attrs = match[2];
    return {
      index: match.index,
      tagName: match[1],
      tagAttrs: attrs,
      simple: attrs && attrs.endsWith('/')
    };
  }
  return undefined;
}

/**
 * 如果当前的标签在一个属性值信息内（有或没有开头双引号），返回 XML 标签属性信息，否则返回 undefined。
 */
export function getInAttirubte(token: CancellationToken, doc: TextDocument, position: Position): ITagAttributeMatchInfo {
  return getInAttirubteFromOffset(token, doc.getText(), doc.offsetAt(position));
}

/**
 * 如果当前的标签在一个属性值信息内（有或没有开头双引号），返回 XML 标签属性信息，否则返回 undefined。
 */
export function getInAttirubteFromOffset(token: CancellationToken, body: string, offset: number): ITagAttributeMatchInfo {
  let tagMatchInfo = getInStartTagFromOffset(token, body, offset);
  if(tagMatchInfo && tagMatchInfo.tagAttrs) {
    let attrMatch = /([\w\-\:]*)=("[^"]*)$/gi.exec(tagMatchInfo.tagAttrs);
    if(attrMatch.length){
      let attrValueStart = tagMatchInfo.index + tagMatchInfo.tagName.length + 1 + attrMatch.index + attrMatch[1].length + 1 ;
      return {
        index: tagMatchInfo.index,
        tagName: tagMatchInfo.tagName,
        tagAttrs: tagMatchInfo.tagAttrs,
        simple: tagMatchInfo.simple,
        attrName: attrMatch[1],
        attrValue: attrMatch[2],
        attrValueRange: [attrValueStart, attrValueStart + attrMatch[2].length]
      };
    }
  }
  return undefined;
}

export function getOffsetString(doc: TextDocument, position:Position, offset?: number) :string {
  if(typeof offset != 'number') {
    offset = 1;
  }
  let curOffset = doc.offsetAt(position);
  curOffset += offset;
  let newPosition = doc.positionAt(curOffset);
  if(positionEqual(newPosition, position)) {
    return undefined;
  }
  if(positionIsBefore(newPosition, position)) {
    return doc.getText(Range.create(newPosition, position));
  } else {
    return doc.getText(Range.create(position, newPosition));
  }
}
