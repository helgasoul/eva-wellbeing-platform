import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Provider {
  id: string;
  name: string;
  description: string;
  icon: string;
  dataTypes: string[];
}

interface HealthProviderCardProps {
  provider: Provider;
  onConnect: () => void;
}

export function HealthProviderCard({ provider, onConnect }: HealthProviderCardProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{provider.icon}</span>
        <div>
          <h3 className="font-semibold">{provider.name}</h3>
          <Badge variant="outline">Available</Badge>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        {provider.description}
      </p>
      
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">
          Data types: {provider.dataTypes.join(', ')}
        </div>
        <Button 
          onClick={onConnect}
          className="w-full"
          size="sm"
        >
          Connect
        </Button>
      </div>
    </Card>
  );
}