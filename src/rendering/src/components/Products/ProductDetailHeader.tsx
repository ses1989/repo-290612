import React from 'react';
import { useSitecoreContext, Text } from '@sitecore-jss/sitecore-jss-nextjs';
import Head from 'next/head';
import { ProductContext } from 'lib/sitecore-context';

const ProductDetailHeader = (): JSX.Element => {
  const { sitecoreContext } = useSitecoreContext();
  const {
    route: { fields },
  } = sitecoreContext as ProductContext;

  return (
    <>
      <Head>
        <title>{fields?.Title?.value || 'Product'}</title>
      </Head>
      <div className="container">
        <section className="hero is-small product-detail-hero">
          <div className="hero-body">
            <Text
              field={fields?.Title}
              tag="h1"
              className="title"
              data-e2e-id="product-details-title"
            />
            <Text
              field={fields?.ShortDescription}
              tag="h2"
              className="subtitle is-one-quarter"
              data-e2e-id="product-details-description"
            />
          </div>
        </section>
      </div>
    </>
  );
};

export default ProductDetailHeader;
