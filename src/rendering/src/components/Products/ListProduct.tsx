import { mediaApi } from '@sitecore-jss/sitecore-jss-nextjs';
import React from 'react';
import Link from 'next/link';

export type ListProductProps = {
  url: string;
  imageSrc: string | null | undefined;
  children: React.ReactNode;
};

const ListProduct = ({ url, imageSrc, children }: ListProductProps): JSX.Element => {
  const figureStyle = imageSrc
    ? {
        backgroundImage: `url(${mediaApi.updateImageUrl(imageSrc, { mw: 480 })})`,
      }
    : {};
  return (
    <Link href={url}>
      <a className="column product-list-column is-4-desktop is-6-tablet" data-e2e-id="product-link">
        <div className="card">
          <div className="card-image">
            <figure style={figureStyle} data-e2e-id="product-link-img"></figure>
          </div>
          <div className="card-content">
            <div className="content">{children}</div>
          </div>
        </div>
      </a>
    </Link>
  );
};

export default ListProduct;
