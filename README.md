# emoji-button-locale-data
Localized Emoji data from [CLDR](https://github.com/unicode-org/cldr) annotations and annotationsDerived for [@joeattardi/emoji-button](https://github.com/joeattardi/emoji-button)

* Note, not all locale and emoji data are in CLDR data base

## Usage

### Install

```bash
yarn add @roderickhsiao/emoji-button-locale-data
```

### Available Locale

Available locale can be access by importing `availableLocale`.

```js
import { availableLocale } from '@roderickhsiao/emoji-button-locale-data'; // Array of locale
```

### Integrations

```js
import { EmojiButton } from '@joeattardi/emoji-button';
import frEmojiData from '@roderickhsiao/emoji-button-locale-data/dist/fr';

const emojiButton = new EmojiButton({
  emojiData: frEmojiData
});
```
