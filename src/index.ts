import { languages, commands, ExtensionContext, workspace } from 'coc.nvim';
import { DocumentSelector } from 'vscode-languageserver-protocol';

import { SVGCompletionItemProvider } from './features/svgCompletionItemProvider';
import { SvgSymbolProvider } from './features/svgSymbolProvider';
import { SvgHoverProvider } from './features/svgHoverProvider';
import { SvgRenameProvider } from './features/svgRenameProvider';
import { SvgDefinitionProvider } from './features/svgDefinitionProvider';
import { SvgFormattingProvider } from './features/svgFormattingProvider';
import { svgMinify } from './features/svgMinify';
import { svgPretty } from './features/svgPretty';
import { svgPreviewer } from './features/svgPreviewer';

const SVG_MODE : DocumentSelector = [
  {
    scheme: "file",
    language: "svg"
  },
  {
    scheme: "untitled",
    language: "svg"
  },
  {
    scheme: "file",
    language: "xml",
    pattern: "*.svg"
  }
];

export function activate(context: ExtensionContext) {
  const priority = workspace.getConfiguration('svg').get<number>('priority')

  let d1 = languages.registerCompletionItemProvider(
    'svg',
    'svg',
    ['svg', 'xml'],
    new SVGCompletionItemProvider(),
    ["<", " ", "=", "\""],
    priority
  )
  let d2 = languages.registerDocumentSymbolProvider(SVG_MODE, new SvgSymbolProvider());
  let d3 = languages.registerHoverProvider(SVG_MODE, new SvgHoverProvider());
  let d4 = languages.registerRenameProvider(SVG_MODE, new SvgRenameProvider());
  let d5 = languages.registerDefinitionProvider(SVG_MODE, new SvgDefinitionProvider());
  let d6 = languages.registerDocumentFormatProvider(SVG_MODE, new SvgFormattingProvider());

  let d7 = commands.registerCommand('svg.showSvg', svgPreviewer);
  let d8 = commands.registerCommand('svg.minifySvg', svgMinify);
  let d9 = commands.registerCommand('svg.prettySvg', svgPretty);

  context.subscriptions.push(d1, d2, d3, d4, d5, d6, d7, d8, d9);
}

// this method is called when your extension is deactivated
export function deactivate() {}
