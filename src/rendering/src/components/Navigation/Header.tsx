import React from 'react';
import { _NavigationItem, Item, HomePage } from './Navigation.graphql';
import { useNavigationData } from './NavigationDataContext';
import NextLink from 'next/link';

import styles from './Header.module.css';

type NavItem = _NavigationItem & Item;

const DropdownLink = ({ item }: { item: NavItem }) => {
  return (
    <div className="navbar-item has-dropdown is-hoverable">
      <NextLink href={item?.url.path}>
        <a className="navbar-link">{item?.navigationTitle?.value}</a>
      </NextLink>
      <div className={`navbar-dropdown is-boxed`}>
        {item.children.results.map((child, i) => {
          const childItem = child as NavItem;

          return (
            <NextLink key={i} href={childItem?.url.path}>
              <a className={`dropdown-item text-dark ${styles.dropdownItem}`}>
                {childItem?.navigationTitle?.value}
              </a>
            </NextLink>
          );
        })}
      </div>
    </div>
  );
};

const Header = (): JSX.Element => {
  const data = useNavigationData();
  const items = [data?.item, ...(data?.item?.children.results as NavItem[])];
  const homeItem = data?.item as HomePage;

  const renderNavItem = (item: unknown, index: number) => {
    const navItem = item as NavItem;

    // Don't need to render dropdown for Home item
    if (index !== 0 && navItem.children.results.length) {
      return <DropdownLink key={index} item={navItem} />;
    }

    return (
      <NextLink key={index} href={navItem?.url.path}>
        <a className="navbar-item is-tab">{navItem?.navigationTitle?.value}</a>
      </NextLink>
    );
  };

  return (
    <nav
      className="navbar is-black is-tab"
      role="navigation"
      aria-label="main navigation"
      data-e2e-id="header"
    >
      <div className="container">
        <div className="navbar-brand">
          {homeItem && (
            <NextLink href={homeItem.url.path}>
              <a className="navbar-item">
                <img
                  src={homeItem.headerLogo?.src || ''}
                  alt={homeItem.navigationTitle?.value || 'Home'}
                  data-e2e-id="logo"
                />
              </a>
            </NextLink>
          )}
        </div>

        <div id="navbarBasicExample" className="navbar-menu">
          <div className="navbar-start">{items && items?.map(renderNavItem)}</div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
