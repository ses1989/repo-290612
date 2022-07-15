import {
  useSitecoreContext,
  GetStaticComponentProps,
  GetServerSideComponentProps,
  useComponentProps,
  GraphQLRequestClient,
} from '@sitecore-jss/sitecore-jss-nextjs';
import { ComponentProps } from 'lib/component-props';
import { SitecoreTemplates } from 'lib/constants';
import { useSWRInfinite } from 'swr';
import { ProductListDocument, ProductListQuery, _Product, Item } from './ProductList.graphql';
import { DocumentNode } from 'graphql';
import config from 'temp/config';
import pkg from '../../../package.json';
import ListProduct from './ListProduct';
import { useI18n } from 'next-localization';

type ProductListProps = ComponentProps;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type keyType = string | any[] | null;

const client = new GraphQLRequestClient(
  // For XM Edge schema, proxy the request through Next.js if running in browser
  // (XM doesn't currently support CORS preflight requests)
  process.env.EDGE_PROVIDER === 'xm' && typeof window !== 'undefined'
    ? config.graphQLEndpointPath
    : config.graphQLEndpoint,
  {
    apiKey: config.sitecoreApiKey,
  }
);

// using SWR Infinite: https://swr.vercel.app/docs/pagination#useswrinfinite

// SWR will create arguments for each page based on this
const getKey = (
  itemId: string | undefined,
  language: string | undefined,
  pageIndex: number,
  previousPageData: ProductListQuery
): keyType => {
  // reached the end
  if (previousPageData && !previousPageData.search?.pageInfo.hasNext) return null;

  // first page, we don't have `previousPageData`
  if (pageIndex === 0) return [ProductListDocument, itemId, language, null];

  return [ProductListDocument, itemId, language, previousPageData?.search?.pageInfo.endCursor];
};

// SWR will execute this using the arguments formed above
const fetchProducts = (query: DocumentNode, itemId: string, language: string, after?: string) => {
  return client.request<ProductListQuery>(query, {
    templateId: SitecoreTemplates._Product.Id,
    rootPath: itemId,
    language,
    after,
  });
};

const ProductList = ({ rendering }: ProductListProps): JSX.Element => {
  const { t } = useI18n();

  // enable SSR of initial list
  const initialData = useComponentProps<ProductListQuery>(rendering.uid);

  const { itemId, language } = useSitecoreContext().sitecoreContext;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getKeyForItem = (pageIndex: number, previousPageData: any): keyType => {
    return getKey(itemId, language, pageIndex, previousPageData);
  };

  const { data, size, setSize } = useSWRInfinite<ProductListQuery>(getKeyForItem, fetchProducts, {
    initialData: initialData ? [initialData] : undefined,
    revalidateAll: true,
  });
  return (
    <div className="container">
      <h2 className="is-size-2 has-text-centered">{t('Products')}</h2>
      <div className="product-list-columns columns is-multiline">
        {data &&
          data.map((page) => {
            return page.search?.results?.map((productItem) => {
              const product = productItem as _Product;
              const item = productItem as Item;
              return (
                <ListProduct key={item.url.path} url={item.url.path} imageSrc={product.image?.src}>
                  <h4 data-e2e-id="product-link-title">{product.title?.value}</h4>
                  <p data-e2e-id="product-link-description">{product.shortDescription?.value}</p>
                </ListProduct>
              );
            });
          })}
      </div>

      {data && data[data.length - 1].search?.pageInfo.hasNext && (
        <div className="columns is-mobile is-centered">
          <button
            className="column is-one-quarter"
            onClick={() => setSize(size + 1)}
            data-e2e-id="load-more-button"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export const getStaticProps: GetStaticComponentProps = async (_rendering, layoutData, context) => {
  return (
    layoutData?.sitecore?.route?.itemId &&
    fetchProducts(
      ProductListDocument,
      layoutData.sitecore.route.itemId,
      context.locale || pkg.config.language
    )
  );
};

export const getServerSideProps: GetServerSideComponentProps = async (
  _rendering,
  layoutData,
  context
) => {
  return (
    layoutData?.sitecore?.route?.itemId &&
    fetchProducts(
      ProductListDocument,
      layoutData.sitecore.route.itemId,
      context.locale || pkg.config.language
    )
  );
};

export default ProductList;
