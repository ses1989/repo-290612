import { ReactNode } from 'react';
import { withDatasourceCheck } from '@sitecore-jss/sitecore-jss-nextjs';
import { ComponentProps } from 'lib/component-props';
import Tabs from './Tabs';

type ContentsResolverTabsProps = ComponentProps & {
  fields: {
    heading: string;
    children: {
      heading: string;
      content: string;
    }[];
  };
};

const ContentsResolverTabs = (props: ContentsResolverTabsProps): JSX.Element => {
  const renderContent = (tabIndex: number) =>
    props.fields.children.length && props.fields.children[tabIndex].content;

  const renderHeader = () => props.fields.heading;

  const renderTabs = (renderTab: (value: string, index: number) => ReactNode) =>
    props.fields.children.map((ch, i) => renderTab(ch.heading, i));

  return (
    <Tabs
      e2eId="contents-resolver-tabs"
      renderContent={renderContent}
      renderHeader={renderHeader}
      renderTabs={renderTabs}
    />
  );
};

export default withDatasourceCheck()<ContentsResolverTabsProps>(ContentsResolverTabs);
