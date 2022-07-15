const jssConfig = require('./src/temp/config');
const packageConfig = require('./package.json').config;
const { constants, getPublicUrl } = require('@sitecore-jss/sitecore-jss-nextjs');

const disconnectedServerUrl = `http://localhost:${process.env.PROXY_PORT || 3042}/`;
const isDisconnected = process.env.JSS_MODE === constants.JSS_MODE.DISCONNECTED;

const publicUrl = getPublicUrl();

const nextConfig = {

  // Set assetPrefix to our public URL
  assetPrefix: publicUrl,
  
  // Allow specifying a distinct distDir when concurrently running app in a container
  distDir: process.env.NEXTJS_DIST_DIR || '.next',

  // Make environment variables available on the client bundle
  env: {
    PUBLIC_URL: publicUrl,
    SITECORE_API_KEY: process.env.SITECORE_API_KEY,
    SITECORE_API_HOST: process.env.SITECORE_API_HOST,
    GRAPH_QL_ENDPOINT: process.env.GRAPH_QL_ENDPOINT,
    EXPORT_MODE: process.env.EXPORT_MODE,
    EDGE_PROVIDER: jssConfig.graphQLEndpoint.includes(jssConfig.sitecoreApiHost) ? 'xm' : 'delivery',
  },

  i18n: !process.env.EXPORT_MODE && {
    // These are all the locales you want to support in your application.
    // These should generally match (or at least be a subset of) those in Sitecore.
    locales: packageConfig.languages,
    // This is the locale that will be used when visiting a non-locale
    // prefixed path e.g. `/styleguide`.
    defaultLocale: packageConfig.language,
  },

  // Enable React Strict Mode
  reactStrictMode: true,
  
  rewrites: !process.env.EXPORT_MODE && (async () => {
    if (isDisconnected) {
      // When disconnected we proxy to the local faux layout service host, see scripts/disconnected-mode-server.js
      return [
        {
          source: '/sitecore/:path*',
          destination: `${disconnectedServerUrl}/sitecore/:path*`,
        },
        {
          source: '/:locale/sitecore/:path*',
          destination: `${disconnectedServerUrl}/sitecore/:path*`,
        },
        // media items
        {
          source: '/data/media/:path*',
          destination: `${disconnectedServerUrl}/data/media/:path*`,
        },
        {
          source: '/:locale/data/media/:path*',
          destination: `${disconnectedServerUrl}/data/media/:path*`,
        },
      ];
    } else {
      // When in connected mode we want to proxy Sitecore paths off to Sitecore
      return [
        {
          source: '/sitecore/:path*',
          destination: `${jssConfig.sitecoreApiHost}/sitecore/:path*`,
        },
        {
          source: '/:locale/sitecore/:path*',
          destination: `${jssConfig.sitecoreApiHost}/sitecore/:path*`,
        },
        // media items
        {
          source: '/-/:path*',
          destination: `${jssConfig.sitecoreApiHost}/-/:path*`,
        },
        {
          source: '/:locale/-/:path*',
          destination: `${jssConfig.sitecoreApiHost}/-/:path*`,
        },
        // visitor identification
        {
          source: '/layouts/:path*',
          destination: `${jssConfig.sitecoreApiHost}/layouts/:path*`,
        },
        {
          source: '/:locale/layouts/:path*',
          destination: `${jssConfig.sitecoreApiHost}/layouts/:path*`,
        },
      ];
    }
  }),
  
  webpack: (config, options) => {
    applyGraphQLCodeGenerationLoaders(config, options);

    // Allow conditional compilation for our various E2E test "modes" (SSG/SSR/Hybrid)
    // using https://www.npmjs.com/package/webpack-conditional-loader
    // (well, actually https://www.npmjs.com/package/webpack-conditional-loader-ng since there is an open bug with handling of line endings and this fork has it resolved)
    config.module.rules.push({
      test: /\.tsx$/,
      use: [options.defaultLoaders.babel, 'webpack-conditional-loader-ng']
    })

    return config;
  },
}

const applyGraphQLCodeGenerationLoaders = (config, options) => {
  config.module.rules.push({
    test: /\.graphql$/,
    exclude: /node_modules/,
    use: [options.defaultLoaders.babel, { loader: 'graphql-let/loader' }],
  })

  config.module.rules.push({
    test: /\.graphqls$/,
    exclude: /node_modules/,
    use: ['graphql-let/schema/loader'],
  })

  config.module.rules.push({
    test: /\.ya?ml$/,
    type: 'json',
    use: 'yaml-loader',
  })

  return config;
}

module.exports = nextConfig;
