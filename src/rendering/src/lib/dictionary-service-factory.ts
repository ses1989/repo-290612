import { DictionaryService, GraphQLDictionaryService } from '@sitecore-jss/sitecore-jss-nextjs';
import config from 'temp/config';

export class DictionaryServiceFactory {
  create(): DictionaryService {
    return new GraphQLDictionaryService({
      endpoint: config.graphQLEndpoint,
      apiKey: config.sitecoreApiKey,
      siteName: config.jssAppName,
      jssAppTemplateId: config.jssAppTemplateId
    });
  }
}

export const dictionaryServiceFactory = new DictionaryServiceFactory();
