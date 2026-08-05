import { useEffect, useState } from "react";
import { Communication } from "@/types/communication";
import { CommunicationForm } from "@/components/CommunicationForm";
import { SessionSetup, SessionInfo } from "@/components/SessionSetup";
import { ScheduleView } from "@/components/ScheduleView";
import { CommunicationList } from "@/components/CommunicationList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, List, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("theme");
      return stored ? stored === "dark" : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      document.documentElement.classList.toggle("dark", isDark);
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      // ignore
    }
  }, [isDark]);

  const handleAddCommunication = (communication: Communication) => {
    setCommunications((prev) => [...prev, communication]);
  };

  const handleDeleteCommunication = (id: string) => {
    setCommunications((prev) => prev.filter((comm) => comm.id !== id));
    toast.success("Comunicación eliminada");
  };

  const handleReorder = (newOrder: Communication[]) => {
    setCommunications(newOrder);
    toast.success("Orden actualizado");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Programador de Comunicaciones
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestiona y visualiza tus campañas de comunicación
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark((v) => !v)}
            aria-label="Alternar tema oscuro"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {sessionInfo ? (
            <CommunicationForm
              onAddCommunication={handleAddCommunication}
              initialArea={sessionInfo.area}
              initialResponsable={sessionInfo.responsable}
            />
          ) : (
            <SessionSetup onComplete={setSessionInfo} />
          )}

          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Cronograma
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Lista
              </TabsTrigger>
            </TabsList>
            <TabsContent value="schedule" className="mt-6">
              <ScheduleView communications={communications} onReorder={handleReorder} />
            </TabsContent>
            <TabsContent value="list" className="mt-6">
              <CommunicationList
                communications={communications}
                onDelete={handleDeleteCommunication}
                onReorder={handleReorder}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;
