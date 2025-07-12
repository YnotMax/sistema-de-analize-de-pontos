
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { KPIData } from "@/types/dashboard";

interface KPICardProps {
  title: string;
  data: KPIData;
  icon: LucideIcon;
  description?: string;
}

export function KPICard({ title, data, icon: Icon, description }: KPICardProps) {
  const formatValue = (value: number, format: KPIData['format']) => {
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'days':
        return `${value} dias`;
      default:
        return value.toString();
    }
  };

  const getTrendIcon = () => {
    switch (data.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (data.trend) {
      case 'up':
        return 'bg-green-100 text-green-800';
      case 'down':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {formatValue(data.value, data.format)}
          </div>
          <Badge variant="secondary" className={getTrendColor()}>
            {getTrendIcon()}
          </Badge>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
