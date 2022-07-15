import {
  GraphQLSitemapService,
  GraphQLSitemapServiceConfig,
} from '@sitecore-jss/sitecore-jss-nextjs';

export interface ExtendedSitemapServiceConfig extends GraphQLSitemapServiceConfig {
  /**
   * Item with sub-paths to exclude
   */
  excludeItemId?: string;
}

/**
 * Delivery Edge requires a valid ID in the search query.
 * Rather than conditional manipulation of the search string, simply pass an empty GUID value.
 */
const emptyId = '{00000000-0000-0000-0000-000000000000}';

export class ExtendedSitemapService extends GraphQLSitemapService {
  protected get query(): string {
    return /* GraphQL */ `
      query SitemapQuery(
        $rootItemId: String!
        $language: String!
        $pageSize: Int = 10
        $hasLayout: String = "true"
        $after: String
        $excludeItemId: String = "${this.options.excludeItemId ?? emptyId}"
      ) {
        search(
          where: {
            AND: [
              { name: "_path", value: $rootItemId, operator: CONTAINS }
              { name: "_path", value: $excludeItemId, operator: NCONTAINS }
              { name: "_language", value: $language }
              { name: "_hasLayout", value: $hasLayout }
            ]
          }
          first: $pageSize
          after: $after
        ) {
          total
          pageInfo {
            endCursor
            hasNext
          }
          results {
            url {
              path
            }
          }
        }
      }
    `;
  }

  constructor(public options: ExtendedSitemapServiceConfig) {
    super(options);
  }
}
