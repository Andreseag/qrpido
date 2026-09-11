import { AlertTriangle } from "lucide-react";

interface ConfigErrorScreenProps {
  message: string;
}

export function ConfigErrorScreen({ message }: ConfigErrorScreenProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-destructive/10 border border-destructive/30 p-6 rounded-3xl max-w-md text-center">
          <AlertTriangle className="text-destructive w-12 h-12 mx-auto mb-3" />
          <h2 className="text-lg font-black">Error en Domicilios</h2>
          <p className="text-muted-foreground text-xs mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}
