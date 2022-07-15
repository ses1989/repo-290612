import { ReactNode, useState } from 'react';

interface TabsProps {
  e2eId: string;
  renderContent: (tabIndex: number) => ReactNode;
  renderHeader: () => ReactNode;
  renderTabs: (renderTab: (value: string, index: number) => ReactNode) => ReactNode;
}

const Tabs = (props: TabsProps): JSX.Element => {
  const [tabIndex, setTab] = useState(0);

  const renderTab = (value: string, index: number) => (
    <li
      key={index}
      className={tabIndex === index ? `is-active` : ''}
      onClick={() => setTab(index)}
      data-e2e-id="tabs-tab"
    >
      <a>{value}</a>
    </li>
  );

  return (
    <div className="container" data-e2e-id={props.e2eId}>
      <h2 className="is-size-2 has-text-centered" data-e2e-id="tabs-header">
        {props.renderHeader()}
      </h2>
      <div className="tabs">
        <ul>{props.renderTabs(renderTab)}</ul>
      </div>
      <p data-e2e-id="tabs-content">{props.renderContent(tabIndex)}</p>
    </div>
  );
};

export default Tabs;
