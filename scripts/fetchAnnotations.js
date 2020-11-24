import { parseString } from 'xml2js';
import fs from "fs-extra";
import recursive from "recursive-readdir";

const annoations = {};
const parsedLocaleFromFileName = file => file
  .split("/")
  .pop()
  .replace(".xml", "")
  .replaceAll("_", "-")

fs.emptyDirSync('src');

// Merge annotations and annotationsDerived
Promise.all([
  recursive("vendors/cldr/common/annotations"),
  recursive("vendors/cldr/common/annotationsDerived")
]).then(([a, b]) => {
  const mergedArray = a.concat(b);

  mergedArray.forEach(file => {
    const locale = parsedLocaleFromFileName(file);
    fs.readFile(file, (err, data) => {
      parseString(data, (error, parsedData) => {
        if (parsedData.ldml && parsedData.ldml.annotations) {
          const emojis = parsedData.ldml.annotations[0].annotation;
          if (!annoations[locale]) {
            annoations[locale] = emojis;
          } else {
            annoations[locale] = annoations[locale].concat(emojis);
          }
          const data = `export default ${JSON.stringify(annoations[locale])};`;
          fs.writeFileSync(`src/${locale}.js`, data, 'utf-8');
        }
      });
    });
  });
});
