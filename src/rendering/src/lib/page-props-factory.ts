import { ParsedUrlQuery } from 'querystring';
import { GetServerSidePropsContext, GetStaticPropsContext } from 'next';
import {
  ComponentPropsService,
  DictionaryPhrases,
  DictionaryService,
  LayoutServiceData,
  LayoutService,
  editingDataService,
  GraphQLRequestClient,
} from '@sitecore-jss/sitecore-jss-nextjs';
import { SitecorePageProps } from 'lib/page-props';
import { dictionaryServiceFactory } from 'lib/dictionary-service-factory';
import { layoutServiceFactory } from 'lib/layout-service-factory';
import { componentModule } from 'temp/componentFactory';
import { NavigationDocument, NavigationQuery } from 'components/Navigation/Navigation.graphql';
import pkg from '../../package.json';
import config from 'temp/config';
import { SitecoreTemplates } from './constants';

/**
 * Resolve normalized Sitecore item path from query
 * @param {ParsedUrlQuery | undefined} params
 * @param {string} [rootPath] optional root path
 */
function resolveItemPath(params: ParsedUrlQuery | undefined, rootPath?: string): string {
  if (params === undefined || !Array.isArray(params.path) || params.path.length === 0) {
    return rootPath ?? '/';
  }
  let path = params.path.join('/');
  if (rootPath) {
    // Add root path
    path = rootPath + (rootPath.endsWith('/') ? '' : '/') + path;
  }

  // Ensure leading '/'
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  // Ensure no trailing '/'
  if (path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  return path;
}

/**
 * Determines whether context is GetServerSidePropsContext (SSR) or GetStaticPropsContext (SSG)
 * @param {GetServerSidePropsContext | GetStaticPropsContext} context
 */
const isServerSidePropsContext = function (
  context: GetServerSidePropsContext | GetStaticPropsContext
): context is GetServerSidePropsContext {
  return (<GetServerSidePropsContext>context).req !== undefined;
};

export class SitecorePagePropsFactory {
  private componentPropsService: ComponentPropsService;
  private dictionaryService: DictionaryService;
  private layoutService: LayoutService;

  constructor() {
    this.componentPropsService = new ComponentPropsService();
    this.dictionaryService = dictionaryServiceFactory.create();
    this.layoutService = layoutServiceFactory.create();
  }

  /**
   * Create SitecorePageProps for given context (SSR / GetServerSidePropsContext or SSG / GetStaticPropsContext)
   * @param {GetServerSidePropsContext | GetStaticPropsContext} context
   * @param {string} [rootPath] optional root path
   * @see SitecorePageProps
   */
  public async create(
    context: GetServerSidePropsContext | GetStaticPropsContext,
    rootPath?: string
  ): Promise<SitecorePageProps> {
    let locale: string,
      layoutData: LayoutServiceData | null,
      dictionary: DictionaryPhrases,
      componentProps = {},
      notFound = false;

    if (context.preview) {
      /**
       * Preview mode
       */
      // If we're in preview (editing) mode, use data already sent along with the editing request
      const data = await editingDataService.getEditingData(context.previewData);
      if (!data) {
        throw new Error(
          `Unable to get editing data for preview ${JSON.stringify(context.previewData)}`
        );
      }
      locale = data.language;
      layoutData = data.layoutData;
      dictionary = data.dictionary;
    } else {
      /**
       * Normal mode
       */
      // Get normalized Sitecore item path
      const path = resolveItemPath(context.params, rootPath);

      // Use context locale if Next.js i18n is configured, otherwise use language defined in package.json
      locale = context.locale ?? pkg.config.language;

      // Fetch layout data, passing on req/res for SSR
      layoutData = await this.layoutService.fetchLayoutData(
        path,
        locale,
        // eslint-disable-next-line prettier/prettier
        isServerSidePropsContext(context) ? (context as GetServerSidePropsContext).req : undefined,
        isServerSidePropsContext(context) ? (context as GetServerSidePropsContext).res : undefined
      );

      if (!layoutData.sitecore.route) {
        // A missing route value signifies an invalid path, so set notFound.
        // Our page routes will return this in getStatic/ServerSideProps,
        // which will trigger our custom 404 page with proper 404 status code.
        // You could perform additional logging here to track these if desired.
        notFound = true;
      }

      // Fetch dictionary data
      dictionary = await this.dictionaryService.fetchDictionaryData(locale);
    }

    // Retrieve component props using side-effects defined on components level
    if (layoutData?.sitecore?.route) {
      if (isServerSidePropsContext(context)) {
        componentProps = await this.componentPropsService.fetchServerSideComponentProps({
          layoutData: layoutData,
          context,
          componentModule,
        });
      } else {
        componentProps = await this.componentPropsService.fetchStaticComponentProps({
          layoutData: layoutData,
          context,
          componentModule,
        });
      }
    }

    // Fetch shared navigation data
    const navigation = await new GraphQLRequestClient(config.graphQLEndpoint, {
      apiKey: config.sitecoreApiKey,
    }).request<NavigationQuery>(NavigationDocument, {
      rootPath: `/sitecore/content/Tenant/${config.jssAppName}/home`,
      language: locale,
      templateId: SitecoreTemplates.NavigationItem.Id,
    });

    return {
      locale,
      layoutData,
      dictionary,
      componentProps,
      navigation,
      notFound,
    };
  }
}

export const sitecorePagePropsFactory = new SitecorePagePropsFactory();
