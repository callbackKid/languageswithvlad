// The public API of entities/news: everything outside the slice imports from here.
export {
  hasUnseenNews,
  markNewsSeen,
  NEWS,
  NEWS_AUDIENCES,
  NEWS_TABS,
  type NewsAudience,
  newsFor,
  type NewsTab,
} from './model/news';
