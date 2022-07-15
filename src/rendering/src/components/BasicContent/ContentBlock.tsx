import { Text, RichText, Field, withDatasourceCheck } from '@sitecore-jss/sitecore-jss-nextjs';
import { ComponentProps } from 'lib/component-props';

type ContentBlockProps = ComponentProps & {
  fields: {
    Heading: Field<string>;
    Content: Field<string>;
    Name1: Field<string>;
    Name2: Field<string>;
  };
};

/**
 * A simple Content Block component, with a heading and rich text block.
 * This is the most basic building block of a content site, and the most basic
 * JSS component that's useful.
 */
const ContentBlock = ({ fields }: ContentBlockProps): JSX.Element => (
  <div className="container">
    <Text
      tag="h2"
      className="is-size-2 has-text-centered"
      data-e2e-id="content-block-header"
      field={fields.Heading}
    />

    <RichText className="content" data-e2e-id="content-block-content" field={fields.Content} />

    <Text
      tag="h2"
      className="has-text-centered"
      data-e2e-id="content-block-name1"
      field={fields.Name1}
    />

    <Text
      tag="h2"
      className="has-text-centered"
      data-e2e-id="content-block-name2"
      field={fields.Name2}
    />
  </div>
);

export default withDatasourceCheck()<ContentBlockProps>(ContentBlock);
