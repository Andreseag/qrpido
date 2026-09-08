import { AlertTriangle } from "lucide-react";

interface ConfigErrorScreenProps {
  message: string;
}

export function ConfigErrorScreen({ message }: ConfigErrorScreenProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-red-950/40 border border-red-500/30 p-6 rounded-3xl max-w-md text-center">
          <AlertTriangle className="text-red-500 w-12 h-12 mx-auto mb-3" />
          <h2 className="text-lg font-black">Error en Domicilios</h2>
          <p className="text-slate-400 text-xs mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}
