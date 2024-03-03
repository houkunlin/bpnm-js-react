import translations from './zh-CN'

// customTranslate('Append {element}', {element: 'Gateway'}); // Returns 'Append Gateway'
export default function customTranslate(template: string | number, replacements: Record<string, any>) {
  const replacement = replacements || {}
  // Translate
  const result = translations[template] || `${template}`;

  // console.debug('_translate', 'translations[' + template + '] = ' + template)
  // Replace
  const re = result.replace(/{([^}]+)}/g, function (_, key) {
    let str = replacement[key];
    if (translations[str] !== null && translations[str] !== undefined && translations[str] !== 'undefined') {
      str = translations[str];
    } else {
    }
    // console.debug('_translate.replace', 'replacements[' + key + '] = ' + replacement[key], ' result=' + str);
    return str || '{' + key + '}';
  })
  if (template === re) {
    // console.debug('_translate', replacements, 'translations[' + template + '] = ' + re);
  }

  return re;
}
