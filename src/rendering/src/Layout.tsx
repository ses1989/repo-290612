import Head from 'next/head';
import Script from 'next/script';
import { getPublicUrl } from 'lib/util';
import { Placeholder, VisitorIdentification, RouteData } from '@sitecore-jss/sitecore-jss-nextjs';

// Prefix public assets with a public URL to enable compatibility with Sitecore Experience Editor.
// If you're not supporting the Experience Editor, you can remove this.
const publicUrl = getPublicUrl();

type LayoutProps = {
  route: RouteData;
};

const Layout = ({ route }: LayoutProps): JSX.Element => {
  return (
    <>
      <Head>
        <title>{route?.fields?.PageTitle?.value || 'Page'}</title>
        <link rel="icon" href={`${publicUrl}/favicon.ico`} />
      </Head>
      <Script src={`${publicUrl}/TestXmCloud.js`}></Script>

      {/*
        VisitorIdentification is necessary for Sitecore Analytics to determine if the visitor is a robot.
        If Sitecore XP (with xConnect/xDB) is used, this is required or else analytics will not be collected for the JSS app.
        For XM (CMS-only) apps, this should be removed.

        VI detection only runs once for a given analytics ID, so this is not a recurring operation once cookies are established.
      */}
      {!process.env.EXPORT_MODE && <VisitorIdentification />}

      {/* root placeholder for the app, which we add components to using route data */}
      <Placeholder name="TestXmCloud-header" rendering={route} />
      <Placeholder name="TestXmCloud-main" rendering={route} />
    </>
  );
};

export default Layout;
