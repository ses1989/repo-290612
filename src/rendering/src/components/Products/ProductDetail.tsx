import React from 'react';
import { useI18n } from 'next-localization';
import { useSitecoreContext, Text, RichText, Image } from '@sitecore-jss/sitecore-jss-nextjs';
import { ProductContext } from 'lib/sitecore-context';

const ProductDetail = (): JSX.Element => {
  const { t } = useI18n();
  const { sitecoreContext } = useSitecoreContext();
  const {
    route: { fields },
  } = sitecoreContext as ProductContext;
  return (
    <section className="product-detail columns is-centered is-vcentered">
      <div className="product-details column is-narrow has-text-centered-mobile">
        <h5>{t('Products-Detail-Price')}</h5>
        <p className="price" data-e2e-id="product-details-price">
          $<Text field={fields?.Price} />
        </p>
        <RichText field={fields?.Features} data-e2e-id="product-details-features" />
      </div>
      <div className="product-image column is-3">
        <Image
          field={fields?.Image}
          imageParams={{ mw: 480, as: 0 }}
          data-e2e-id="product-details-image"
        />
      </div>
    </section>
  );
};

export default ProductDetail;
