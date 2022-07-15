import { ReactNode } from 'react';
import { withDatasourceCheck } from '@sitecore-jss/sitecore-jss-nextjs';
import { ComponentProps } from 'lib/component-props';
import Tabs from './Tabs';

interface DataSource {
  heading: {
    value: string;
  };
  children: {
    results: {
      heading: {
        value: string;
      };
      content: {
        value: string;
      };
    }[];
  };
}

type IntegratedGraphQLTabsProps = ComponentProps & {
  fields: {
    data: {
      datasource: DataSource;
    };
  };
};

const IntegratedGraphQLTabs = (props: IntegratedGraphQLTabsProps): JSX.Element => {
  const { datasource } = props.fields.data;

  const renderContent = (tabIndex: number) =>
    datasource.children.results.length && datasource.children.results[tabIndex].content.value;

  const renderHeader = () => datasource.heading.value;

  const renderTabs = (renderTab: (value: string, index: number) => ReactNode) =>
    datasource.children.results.map((ch, i) => renderTab(ch.heading.value, i));

  return (
    datasource && (
      <Tabs
        e2eId="integrated-graphql-tabs"
        renderContent={renderContent}
        renderHeader={renderHeader}
        renderTabs={renderTabs}
      />
    )
  );
};

export default withDatasourceCheck()<IntegratedGraphQLTabsProps>(IntegratedGraphQLTabs);
