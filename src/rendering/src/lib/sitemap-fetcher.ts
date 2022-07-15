/* eslint-disable @typescript-eslint/no-var-requires */
import { StaticPath } from '@sitecore-jss/sitecore-jss-nextjs';
import { GetStaticPathsContext } from 'next';
import config from 'temp/config';
import pkg from '../../package.json';
import { ExtendedSitemapService } from './sitemap-service';
import { ItemIds } from './constants';

export class RootSitemapFetcher {
  private _graphqlSitemapService: ExtendedSitemapService;

  constructor() {
    this._graphqlSitemapService = new ExtendedSitemapService({
      endpoint: config.graphQLEndpoint,
      apiKey: config.sitecoreApiKey,
      siteName: config.jssAppName,
      excludeItemId: ItemIds.Products, // Exclude products
    });
  }

  async fetch(context?: GetStaticPathsContext): Promise<StaticPath[]> {
    return (
      process.env.EXPORT_MODE
        ? this._graphqlSitemapService.fetchExportSitemap(pkg.config.language)
        : this._graphqlSitemapService.fetchSSGSitemap(context?.locales || [])
    ).then((results) => {
      // Compensate for current bug on Delivery Edge where the root '/products' item
      // is being returned from the search query which excludes it ({ name: "_path", value: $productsItemId, operator: NCONTAINS })
      return results.filter((value) => value.params.path[0] !== 'products');
    });
  }
}

export class ProductSitemapFetcher {
  private _graphqlSitemapService: ExtendedSitemapService;

  constructor() {
    this._graphqlSitemapService = new ExtendedSitemapService({
      endpoint: config.graphQLEndpoint,
      apiKey: config.sitecoreApiKey,
      siteName: config.jssAppName,
      rootItemId: ItemIds.Products, // Only products
    });
  }

  async fetch(context?: GetStaticPathsContext): Promise<StaticPath[]> {
    return (
      process.env.EXPORT_MODE
        ? this._graphqlSitemapService.fetchExportSitemap(pkg.config.language)
        : this._graphqlSitemapService.fetchSSGSitemap(context?.locales || [])
    ).then((results) => {
      results.forEach((value) => {
        value.params.path.shift(); // Remove the leading 'products' path fragment
      });
      return results;
    });
  }
}

export const rootSitemapFetcher = new RootSitemapFetcher();
export const productSitemapFetcher = new ProductSitemapFetcher();
