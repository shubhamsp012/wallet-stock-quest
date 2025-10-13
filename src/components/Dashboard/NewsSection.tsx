import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Newspaper } from "lucide-react";

export const NewsSection = () => {
  // Mock news data - in production, use News API
  const newsItems = [
    {
      id: 1,
      title: "Sensex Surges 500 Points on Strong IT Sector Performance",
      source: "Economic Times",
      time: "2 hours ago",
      url: "#",
    },
    {
      id: 2,
      title: "Reliance Industries Announces Major Investment in Renewable Energy",
      source: "Business Standard",
      time: "4 hours ago",
      url: "#",
    },
    {
      id: 3,
      title: "TCS Reports Strong Q4 Results, Beats Analyst Expectations",
      source: "Moneycontrol",
      time: "6 hours ago",
      url: "#",
    },
    {
      id: 4,
      title: "HDFC Bank Launches New Digital Banking Platform",
      source: "Mint",
      time: "8 hours ago",
      url: "#",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Market News
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {newsItems.map((news) => (
          <a
            key={news.id}
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                  {news.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{news.source}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{news.time}</span>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
            </div>
          </a>
        ))}
      </CardContent>
    </Card>
  );
};
