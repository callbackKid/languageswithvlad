/// <reference types="vite/client" />

declare module 'virtual:interface-catalogs' {
  type UiLanguage = import('./shared/i18n/core').UiLanguage;

  export const getInterfaceCatalogUrl: (language: UiLanguage) => string | undefined;
  export const startupErrors: Record<UiLanguage, { somethingWrong: string; tryAgain: string }>;
}
