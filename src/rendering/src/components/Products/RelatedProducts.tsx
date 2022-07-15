import { useSitecoreContext, Text, RichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { useI18n } from 'next-localization';
import { ProductContext } from 'lib/sitecore-context';
import ListProduct from './ListProduct';

const RelatedProducts = (): JSX.Element => {
  const { t } = useI18n();
  const { sitecoreContext } = useSitecoreContext();
  const {
    route: { fields },
  } = sitecoreContext as ProductContext;
  return (
    <div className="container">
      <h3 className="title">{t('Products-RelatedProducts-Title')}</h3>
      <div className="product-list-columns columns is-multiline">
        {fields.RelatedProducts &&
          fields.RelatedProducts.map((product) => (
            <ListProduct
              key={product.url}
              url={product.url}
              imageSrc={product.fields.Image.value?.src}
            >
              <Text field={product.fields.Title} tag="h4" data-e2e-id="product-link-title" />
              <RichText
                field={product.fields.ShortDescription}
                tag="p"
                data-e2e-id="product-link-description"
              />
            </ListProduct>
          ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
