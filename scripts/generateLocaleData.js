import find from "lodash/find";
import fs from "fs-extra";
import get from "lodash/get";
import produce from "immer";
import recursive from "recursive-readdir";

// use as base template
import emojiData from "../vendors/emoji-button/src/data/emoji";

const annoations = {};
const compareEmoji = (a, b) => {
  return a.trim() === b.trim();
};

const parsedLocaleFromFileName = file =>
  file
    .replace(".js", "")
    .replaceAll("src/", "");

fs.emptyDirSync("dist");

recursive("src").then(files => {
  const index = files.map(parsedLocaleFromFileName);
  fs.writeFileSync('dist/index.js', `export const availableLocale = ${JSON.stringify(index)};`)

  files.forEach(file => {
    const locale = parsedLocaleFromFileName(file);
    const { default: emojis } = require(`../${file}`);

    const content = produce(emojiData, draftEmojiData => {
      draftEmojiData.emoji.forEach(eachEmoji => {
        const emoji = eachEmoji.emoji;
        const match = find(emojis, data => {
          const isTTS = get(data, ["$", "type"]) === "tts";
          const target = get(data, ["$", "cp"]);
          return isTTS && compareEmoji(target, emoji);
        });

        // fallback
        const fallback = find(emojis, data => {
          const target = get(data, ["$", "cp"]);
          return (
            get(data, ["$", "type"]) !== "tts" && compareEmoji(target, emoji)
          );
        });

        eachEmoji.name =
          get(match, ["_"]) || get(fallback, ["_"]) || eachEmoji.name;
      });
    });

    const fileContent = `export default ${JSON.stringify(content)};`;
    fs.writeFileSync(`dist/${locale}.js`, fileContent, "utf-8");
  });
});

// recursive("vendors/cldr/common/annotations", function(err, files) {
//   files.forEach(file => {
//     const locale = parsedLocaleFromFileName(file);
//     fs.readFile(file, (err, data) => {
//       parseString(data, (error, parsedData) => {
//         if (parsedData.ldml && parsedData.ldml.annotations) {
//           const emojis = parsedData.ldml.annotations[0].annotation;
//           annoations[locale] = emojis;
//           // const content = produce(emojiData, draftEmojiData => {
//           //   draftEmojiData.emoji.forEach(eachEmoji => {
//           //     const emoji = eachEmoji.emoji;
//           //     const match = find(emojis, (data) => {
//           //       const isTTS = get(data, ['$', 'type']) === 'tts';
//           //       const target = get(data, ['$', 'cp']);
//           //       return isTTS && compareEmoji(target, emoji);
//           //     });
//           //
//           //     // fallback
//           //     const fallback = find(emojis, (data) => {
//           //       const target = get(data, ['$', 'cp']);
//           //       return get(data, ['$', 'type']) !== 'tts' && compareEmoji(target, emoji);
//           //     });
//           //
//           //     eachEmoji.name = get(match, ['_']) || get(fallback, ['_']) || eachEmoji.name;
//           //   });
//           // });
//           // const data = `export default ${JSON.stringify(content)};`;
//           // fs.writeFileSync(`dist/${locale}.js`, data, 'utf-8');
//         }
//       });
//     });
//   });
// });
//
//
//
