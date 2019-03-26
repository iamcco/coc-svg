# coc-svg

> fork from https://github.com/lishu/vscode-svg

A Powerful SVG Language Support Extension(beta).
Almost all the features you need to handle SVG.

## Features

- SVG Elements Auto Completion.
- SVG Attributes Auto Completion.
- Document Symbol with SVG Element [id].
- SVG Preview
  > Tip: All Completion list is context, will not show all items.
- Rename Tag Name or Id Reference.
  > Cursor in Tag Name or Id Attribute or url(#id) Hit F2(Windows) Key, Rename it!
- In Id Reference Click Goto id="" element.
  > Hot Ctrl Key and Move mouse to a url(#id), That it!
- SVG Format Support
  > Formatting support using SVGO, which can prettify SVGs and sort tag attributes.
  > SVGO works as a group of plugins that can be activated or desactivated (which is default for most in this extension).
  > Information on the plugins can be found [here](https://www.npmjs.com/package/svgo).

### Minify SVG with SVGO

Open the **Command Palette** (`⇧⌘P` on Mac and `Ctrl+Shift+P` on Win/Linux) and run `Minify SVG`.
This will reduce the filesize by removing all unnecessary code from the image.

## Known Issues

SVG Version 2.0 is not included.

-----------------------------------------------------------------------------------------------------------

## For more information

* [MDN SVG Reference](https://developer.mozilla.org/en-US/docs/Web/SVG)
