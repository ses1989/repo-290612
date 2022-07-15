using Sitecore.LayoutService.Configuration;
using Sitecore.Mvc.Presentation;
using System;
using System.Collections.Specialized;

namespace Feature.BasicContent.LayoutService
{
    public class HelloContentsResolver : Sitecore.LayoutService.ItemRendering.ContentsResolvers.IRenderingContentsResolver
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

            return new
            {
                name = datasource?.Name,
                date = DateTime.Now,
                hello = "world"
            };
        }
    }
}
