using Sitecore.Data.Items;
using Sitecore.LayoutService.Configuration;
using Sitecore.Mvc.Presentation;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;

namespace Feature.BasicContent.LayoutService
{
    public class Tab
    {
        public string Heading { get; set; }
        public string Content { get; set; }
    }

    public class TabsContentsResolver : Sitecore.LayoutService.ItemRendering.ContentsResolvers.IRenderingContentsResolver
    {
        public bool IncludeServerUrlInMediaUrls { get; set; }
        public bool UseContextItem { get; set; }
        public string ItemSelectorQuery { get; set; }
        public NameValueCollection Parameters { get; set; }

        public object ResolveContents(Rendering rendering, IRenderingConfiguration renderingConfig)
        {
            var datasource = !string.IsNullOrEmpty(rendering.DataSource)
                ? rendering.RenderingItem?.Database.GetItem(rendering.DataSource)
                : null;

            var tabsResultList = new List<Tab>();

            if (datasource == null)
            {
                return new { };
            }

            foreach (Item item in datasource.Children)
            {
                var tab = new Tab { 
                    Content = item.Fields["Content"]?.Value,
                    Heading = item.Fields["Heading"]?.Value
                };

                tabsResultList.Add(tab);
            }

            return new {
                heading = datasource.Fields["Heading"].Value,
                children = tabsResultList
            };
        }
    }
}
