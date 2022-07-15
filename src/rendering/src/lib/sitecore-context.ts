import { SitecoreContextValue } from '@sitecore-jss/sitecore-jss-nextjs';
import { Field, ImageField } from '@sitecore-jss/sitecore-jss-nextjs';

/**
 * Product context
 */
export type ProductContext = SitecoreContextValue & {
  route: {
    fields: {
      Title: Field<string>;
      ShortDescription: Field<string>;
      Features: Field<string>;
      Price: Field<string>;
      Image: ImageField;
      RelatedProducts: RelatedProductFields[];
    };
  };
};

export type RelatedProductFields = {
  url: string;
  fields: {
    Title: Field<string>;
    ShortDescription: Field<string>;
    Image: ImageField;
  };
};
