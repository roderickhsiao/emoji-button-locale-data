import { parseString } from "xml2js";
import find from "lodash/find";
import fs from "fs-extra";
import get from 'lodash/get';
import produce from "immer";
import recursive from "recursive-readdir";
import emojiUnicode from 'emoji-unicode';

// use as base template
import emojiData from "../vendors/emoji-button/src/data/emoji";

const availableLocale = new Set();
const compareEmoji = (a, b) => {
  return emojiUnicode(a.trim()) === emojiUnicode(b.trim());
};

fs.emptyDirSync('dist');

recursive("vendors/cldr/common/annotations", function(err, files) {
  files.forEach(file => {
    const locale = file
      .split("/")
      .pop()
      .replace(".xml", "")
      .replaceAll("_", "-");
    availableLocale.add(locale);
    fs.readFile(file, (err, data) => {
      parseString(data, (error, parsedData) => {
        if (parsedData.ldml && parsedData.ldml.annotations) {
          const emojis = parsedData.ldml.annotations[0].annotation;
          const content = produce(emojiData, draftEmojiData => {
            draftEmojiData.emoji.forEach(eachEmoji => {
              const emoji = eachEmoji.emoji;
              const match = find(emojis, (data) => {
                const isTTS = get(data, ['$', 'type']) === 'tts';
                const target = get(data, ['$', 'cp']);
                return isTTS && compareEmoji(target, emoji);
              });

              // fallback
              const fallback = find(emojis, (data) => {
                const target = get(data, ['$', 'cp']);
                return get(data, ['$', 'type']) !== 'tts' && compareEmoji(target, emoji);
              });

              eachEmoji.name = get(match, ['_']) || get(fallback, ['_']) || eachEmoji.name;
            });
          });
          const data = `export default ${JSON.stringify(content)};`;
          fs.writeFileSync(`dist/${locale}.js`, data, 'utf-8');
        }
      });
    });
  });
});

fs.writeFileSync('dist/index.js', `export const availableLocale = ${JSON.stringify(Array.from(availableLocale))};`)
