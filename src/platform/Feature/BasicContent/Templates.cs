using Sitecore.Data;

namespace Feature.BasicContent
{
    public static class Templates
    {
        public static class HeroBanner
        {
            public static class Fields
            {
                public static readonly ID Title = new ID("{5179186C-B95E-4E97-95AB-7958721A9AEB}");
                public static readonly ID Subtitle = new ID("{89B0A8ED-0EE8-4512-B518-AB2C4C2A0B9E}");
                public static readonly ID Image = new ID("{B5F61442-FF0F-46A5-90A8-D6D387DE24A0}");
            }
        }

        public static class Accordion
        {
            public static class Fields
            {
                public static readonly ID Heading = new ID("{F3E515CD-0BAD-427B-A03C-01E18431A7AD}");
            }
        }

        public static class AccordionItem
        {
            public static class Fields
            {
                public static readonly ID Title = new ID("{5718E787-142B-41D9-B5A1-0B18F45B8236}");
                public static readonly ID Content = new ID("{45EFE66E-5AD2-4F1D-BAD5-FDF281688681}");
            }
        }
    }
}
