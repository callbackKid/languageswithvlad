import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

import ts from 'typescript';
import { type Plugin } from 'vite';

const LANGUAGES = ['en', 'ru', 'fr', 'de', 'es', 'pt', 'it'] as const;
const VIRTUAL_MODULE = 'virtual:interface-catalogs';
const RESOLVED_MODULE = '\0' + VIRTUAL_MODULE;
// These routes already have their own bundles. Their catalogs should stay with them.
const DEFERRED_CATALOGS = new Set(['pages/news/i18n/news.ts', 'pages/tutorial/i18n/tutorial.ts']);

type Dictionary = Record<string, string | Record<string, string>>;
type Catalog = Record<string, Dictionary>;

const sourceFiles = (folder: string): string[] =>
  readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return entry.isFile() && entry.name.endsWith('.ts') ? [path] : [];
  });

const propertyName = (property: ts.PropertyAssignment) => {
  const { name } = property;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  throw new Error('Interface catalog keys must be literal names.');
};

const entriesOf = (object: ts.ObjectLiteralExpression) =>
  object.properties.map((property) => {
    if (!ts.isPropertyAssignment(property)) {
      throw new Error('Interface catalogs must use explicit properties.');
    }
    return [propertyName(property), property.initializer] as const;
  });

const textOf = (node: ts.Expression) => {
  if (ts.isStringLiteralLike(node)) return node.text;
  throw new Error('Interface catalog text must be a string literal.');
};

const readDictionary = (node: ts.Expression): Dictionary => {
  if (!ts.isObjectLiteralExpression(node)) throw new Error('Expected an interface dictionary.');
  return Object.fromEntries(
    entriesOf(node).map(([key, value]) => [
      key,
      ts.isObjectLiteralExpression(value)
        ? Object.fromEntries(entriesOf(value).map(([form, text]) => [form, textOf(text)]))
        : textOf(value),
    ])
  );
};

export const interfaceCatalogs = (): Plugin => {
  let catalogs: Map<string, Catalog>;
  let transforms: Map<string, string>;
  let assetReferences: Map<string, string>;

  return {
    name: 'interface-catalogs',
    enforce: 'pre',
    configResolved(config) {
      catalogs = new Map(LANGUAGES.map((language) => [language, {}]));
      transforms = new Map();
      assetReferences = new Map();
      const sourceRoot = resolve(config.root, 'src');
      for (const file of sourceFiles(sourceRoot)) {
        const path = relative(sourceRoot, file).split(sep).join('/');
        if (!path.includes('/i18n/') || DEFERRED_CATALOGS.has(path)) continue;

        const code = readFileSync(file, 'utf8');
        const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);
        const edits: { start: number; end: number; replacement: string }[] = [];
        for (const statement of source.statements) {
          if (!ts.isVariableStatement(statement)) continue;
          for (const declaration of statement.declarationList.declarations) {
            const { name, initializer } = declaration;
            if (
              !ts.isIdentifier(name) ||
              !initializer ||
              !ts.isCallExpression(initializer) ||
              initializer.expression.getText(source) !== 'defineMessages'
            )
              continue;

            const argument = initializer.arguments[0];
            if (!argument || !ts.isObjectLiteralExpression(argument)) {
              throw new Error(`Expected inline interface catalogs in ${path}.`);
            }
            const dictionaries = new Map(entriesOf(argument));
            const key = path + ':' + name.text;
            for (const [language, catalog] of catalogs) {
              const dictionary = dictionaries.get(language);
              if (!dictionary) throw new Error(`Missing ${language} in ${key}.`);
              catalog[key] = readDictionary(dictionary);
            }
            edits.push({
              start: initializer.getStart(source),
              end: initializer.end,
              replacement: `getInterfaceDictionary(${JSON.stringify(key)})`,
            });
          }
        }
        if (config.command !== 'build' || !edits.length) continue;
        const transformed = edits
          .reverse()
          .reduce(
            (text, { start, end, replacement }) =>
              text.slice(0, start) + replacement + text.slice(end),
            code
          );
        transforms.set(
          file,
          `import { getInterfaceDictionary } from '@/shared/i18n/catalogs';\n${transformed}`
        );
      }
    },
    buildStart() {
      if (!transforms.size) return;
      for (const [language, catalog] of catalogs) {
        const reference = this.emitFile({
          type: 'asset',
          name: `interface-${language}.json`,
          source: JSON.stringify(catalog),
        });
        assetReferences.set(language, reference);
      }
    },
    resolveId(id) {
      if (id === VIRTUAL_MODULE) return RESOLVED_MODULE;
    },
    load(id) {
      if (id !== RESOLVED_MODULE) return null;
      const errors = Object.fromEntries(
        [...catalogs].map(([language, catalog]) => {
          const { somethingWrong, tryAgain } =
            catalog['shared/i18n/messages/common.ts:common'] ?? {};
          if (typeof somethingWrong !== 'string' || typeof tryAgain !== 'string') {
            throw new Error(`Missing startup recovery text for ${language}.`);
          }
          return [language, { somethingWrong, tryAgain }];
        })
      );
      const urls = [...assetReferences].map(
        ([language, reference]) => `${language}: import.meta.ROLLUP_FILE_URL_${reference}`
      );
      return `
        const urls = {${urls.join(',')}};
        export const getInterfaceCatalogUrl = language => urls[language];
        export const startupErrors = ${JSON.stringify(errors)};
      `;
    },
    transform(_code, id) {
      return transforms.get(id) ?? null;
    },
  };
};
