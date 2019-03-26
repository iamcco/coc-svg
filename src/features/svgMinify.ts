import { workspace } from 'coc.nvim';
import {
  Range,
  Position,
} from 'vscode-languageserver-protocol';
import svgo from 'svgo';

export async function svgMinify() {
  let optimizer = new svgo({});
  const { document } = await workspace.getCurrentState()

  optimizer.optimize(document.getText()).then((result) => {
    let range = Range.create(
      Position.create(0, 0),
      Position.create(document.lineCount, 0)
    )
    const doc = workspace.getDocument(document.uri)
    doc.applyEdits(workspace.nvim, [{
      range,
      newText: result.data
    }])
  });
}
