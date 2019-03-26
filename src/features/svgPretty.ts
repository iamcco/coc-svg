import {
  Range,
  Position
} from 'vscode-languageserver-protocol';
import {
  workspace
} from 'coc.nvim';
import svgo from 'svgo';

export async function svgPretty() {
  let optimizer = new svgo({
    js2svg: {pretty: true}
  });
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
