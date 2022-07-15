import {
  GetServerSideComponentProps,
  GetStaticComponentProps,
  GraphQLRequestClient,
  LayoutServiceData,
  useComponentProps,
} from '@sitecore-jss/sitecore-jss-nextjs';
import NextLink from 'next/link';
import config from 'temp/config';
import { SitecoreTemplates } from 'lib/constants';
import {
  BreadcrumbsDocument,
  BreadcrumbsQuery,
  _NavigationItem,
  Item,
} from './Breadcrumbs.graphql';
import { ComponentProps } from 'lib/component-props';

const Breadcrumbs = ({ rendering }: ComponentProps): JSX.Element => {
  const data = useComponentProps<BreadcrumbsQuery>(rendering.uid);

  const item = data?.layout?.item as _NavigationItem & Item;

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="breadcrumbs" data-e2e-id="breadcrumbs">
        <ul>
          {data?.layout?.item?.ancestors
            .slice(0)
            .reverse()
            .map((child, i) => {
              const item = child as _NavigationItem & Item;
              return (
                item.navigationTitle && (
                  <li key={item.url.path + i}>
                    <NextLink href={item.url.path}>
                      <a data-e2e-id="breadcrumbs-link">{item?.navigationTitle?.value}</a>
                    </NextLink>
                  </li>
                )
              );
            })}
          <li className="is-active">
            <a data-e2e-id="breadcrumbs-link-active">{item?.navigationTitle?.value}</a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

const fetchRouteData = async (layoutData: LayoutServiceData) => {
  const graphQLClient = new GraphQLRequestClient(config.graphQLEndpoint, {
    apiKey: config.sitecoreApiKey,
  });

  const result = await graphQLClient.request<BreadcrumbsQuery>(BreadcrumbsDocument, {
    site: config.jssAppName,
    routePath: layoutData.sitecore.context.itemPath,
    language: layoutData?.sitecore?.context.language,
    templateIds: [SitecoreTemplates.NavigationItem.Id, SitecoreTemplates.Bucket.Id],
  });

  return result;
};

export const getStaticProps: GetStaticComponentProps = async (_rendering, layoutData) => {
  const routeData = await fetchRouteData(layoutData);

  return routeData;
};

export const getServerSideProps: GetServerSideComponentProps = async (_rendering, layoutData) => {
  const routeData = await fetchRouteData(layoutData);

  return routeData;
};

export default Breadcrumbs;
