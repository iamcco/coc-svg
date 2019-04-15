# coc-svg

> fork from https://github.com/lishu/vscode-svg

A Powerful SVG Language Support Extension for coc.nvim.
Almost all the features you need to handle SVG.

![image](https://user-images.githubusercontent.com/5492542/55062310-a7ba9580-50b0-11e9-9f4a-5e09de32bdb8.png)

## Install

`CocInstall coc-svg`

## Features

- SVG Elements Auto Completion.
- SVG Attributes Auto Completion.
- Document Symbol with SVG Element [id].
- SVG Preview
  > Tip: All Completion list is context, will not show all items.
- Rename Tag Name or Id Reference.
  > Cursor in Tag Name or Id Attribute or `url(#id)` or `href="#id"`
- In Id Reference Click Goto `id=""` element.
  > Move cursor to a `url(#id)` or `href="#id"`, That it!
- SVG Format Support
  > Formatting support using SVGO, which can prettify SVGs and sort tag attributes.
  > SVGO works as a group of plugins that can be activated or desactivated (which is default for most in this extension).
  > Information on the plugins can be found [here](https://www.npmjs.com/package/svgo).

## Commands

- `svg.prettySvg` pretty svg.
- `svg.minifySvg` This will reduce the filesize by removing all unnecessary code from the image.
- `svg.showSvg` open browser to preview current svg.

## Config

``` jsonc
{
    "svg.completion.insertCloseTagSign": {
      "title": "Insert close tag sign",
      "type": "boolean",
      "default": true,
      "description": "Specifies whether insert close tag sign '>'"
    },
    "svg.completion.showAdvanced": {
      "title": "Show advanced items in completion list.",
      "type": "boolean",
      "default": false,
      "description": "Specifies whether advanced items that are not commonly used are displayed in the AutoComplete list."
    },
    "svg.completion.showDeprecated": {
      "title": "Show deprecated items in completion list.",
      "type": "boolean",
      "default": false,
      "description": "Specifies whether advanced items that are deprecated are displayed in the AutoComplete list."
    },
    "svg.disableFormatOnSave": {
      "title": "[Experimental]Disable SVGO Format on save",
      "type": "boolean",
      "default": false,
      "description": "Focus Disable SVGO Format On Save event if editor.formatOnSave is true"
    },
    "svg.format.plugins": {
      "title": "SVGO plugins array.",
      "type": "object",
      "default": {
        "sortAttrs": true
      },
      "description": "Each items corresponds to a plugin that should be enabled, the rest is disabled."
    },
    "svg.preview.background": {
      "title": "Svg Preview Background",
      "type": "string",
      "enum": [
        "transparent",
        "white",
        "black",
        "custom"
      ],
      "default": "transparent",
      "description": "Specifies the Svg Preview Background"
    },
    "svg.preview.backgroundCustom": {
      "title": "Svg Preview Custom Background",
      "type": "string",
      "default": "#eee",
      "description": "Specifies the Svg Preview Custom Background"
    },
    "svg.version": {
      "title": "SVG Version",
      "enum": [
        "1.1",
        "2.0"
      ],
      "description": "Specifies the SVG standard version that will be used for autocompletion and validation.",
      "default": "1.1"
    },
    "svg.priority": {
      "type": "integer",
      "default": 99
    }
}
```

## Known Issues

SVG Version 2.0 is not included.

## For more information

- [MDN SVG Reference](https://developer.mozilla.org/en-US/docs/Web/SVG)

### Buy Me A Coffee ☕️

![btc](https://img.shields.io/keybase/btc/iamcco.svg?style=popout-square)

![image](https://user-images.githubusercontent.com/5492542/42771079-962216b0-8958-11e8-81c0-520363ce1059.png)
