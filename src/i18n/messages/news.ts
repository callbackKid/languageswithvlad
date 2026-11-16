import { defineMessages } from '../core';

/** The News page. The news itself is in src/lib/news.ts. */
export const newsText = defineMessages({
  en: {
    intro: 'What changed in the app, newest first.',
    'kind.new': 'New',
    'kind.better': 'Improved',
    'kind.fixed': 'Fixed',
  },
  ru: {
    intro: 'Что изменилось в приложении, сначала самое новое.',
    'kind.new': 'Новое',
    'kind.better': 'Улучшено',
    'kind.fixed': 'Исправлено',
  },
  fr: {
    intro: 'Ce qui a changé dans l’application, du plus récent au plus ancien.',
    'kind.new': 'Nouveau',
    'kind.better': 'Amélioré',
    'kind.fixed': 'Corrigé',
  },
  de: {
    intro: 'Was sich in der App geändert hat, das Neueste zuerst.',
    'kind.new': 'Neu',
    'kind.better': 'Verbessert',
    'kind.fixed': 'Behoben',
  },
  es: {
    intro: 'Lo que ha cambiado en la aplicación, de lo más nuevo a lo más antiguo.',
    'kind.new': 'Nuevo',
    'kind.better': 'Mejorado',
    'kind.fixed': 'Corregido',
  },
  pt: {
    intro: 'O que mudou na aplicação, do mais recente para o mais antigo.',
    'kind.new': 'Novo',
    'kind.better': 'Melhorado',
    'kind.fixed': 'Corrigido',
  },
  it: {
    intro: 'Cosa è cambiato nell’app, dal più recente.',
    'kind.new': 'Novità',
    'kind.better': 'Migliorato',
    'kind.fixed': 'Corretto',
  },
});
