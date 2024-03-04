import translations from './zh-CN';

export default function customTranslate(
  template: string | number,
  replacements: Record<string, any>,
) {
  const replacement = replacements || {};
  // Translate
  const result = translations[template] || `${template}`;

  // console.debug('_translate', 'translations[' + template + '] = ' + template)
  // Replace
  const re = result.replace(/{([^}]+)}/g, function (_, key) {
    let str = replacement[key];
    if (
      translations[str] !== null &&
      translations[str] !== undefined &&
      translations[str] !== 'undefined'
    ) {
      str = translations[str];
    } else {
    }
    // console.debug('_translate.replace', 'replacements[' + key + '] = ' + replacement[key], ' result=' + str);
    return str || '{' + key + '}';
  });
  // if (template === re && re !== translations[template]) {
  //   console.debug('_translate', replacements, `'${template}': '${template}',`);
  //   if (!window['customTranslate']) {
  //     window['customTranslate'] = {};
  //   }
  //   window['customTranslate'][template] = template;
  // }
  // if (Object.keys(replacement).length > 0) {
  //   console.log('_translate', replacement, `'${template}': '${re}',`);
  // }

  return re;
}

// console.log(JSON.stringify(translations), customTranslate('Append {element}', {element: 'Gateway'}));
