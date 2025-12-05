import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  LogIn, 
  UserPlus, 
  ShoppingCart, 
  Truck, 
  RefreshCw, 
  Search,
  Key,
  CheckCircle,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ActivityLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action_type: string;
  description: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

const ACTION_TYPES = [
  { value: "all", label: "Toutes les actions" },
  { value: "login", label: "Connexion" },
  { value: "signup", label: "Inscription" },
  { value: "password_change", label: "Mot de passe" },
  { value: "purchase", label: "Achat" },
  { value: "order_status_change", label: "Statut commande" },
  { value: "vendor_order_action", label: "Action vendeur" },
  { value: "validation", label: "Validation" },
];

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case "login":
      return <LogIn className="h-4 w-4" />;
    case "signup":
      return <UserPlus className="h-4 w-4" />;
    case "password_change":
      return <Key className="h-4 w-4" />;
    case "purchase":
      return <ShoppingCart className="h-4 w-4" />;
    case "order_status_change":
      return <RefreshCw className="h-4 w-4" />;
    case "vendor_order_action":
      return <Truck className="h-4 w-4" />;
    case "validation":
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const getActionBadgeVariant = (actionType: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (actionType) {
    case "login":
      return "default";
    case "signup":
      return "default";
    case "purchase":
      return "default";
    case "order_status_change":
      return "secondary";
    case "vendor_order_action":
      return "secondary";
    case "password_change":
      return "outline";
    default:
      return "outline";
  }
};

const getActionLabel = (actionType: string): string => {
  const actionMap: Record<string, string> = {
    login: "Connexion",
    signup: "Inscription",
    password_change: "Mot de passe",
    purchase: "Achat",
    order_status_change: "Statut commande",
    vendor_order_action: "Action vendeur",
    validation: "Validation",
  };
  return actionMap[actionType] || actionType;
};

const ActivityLogsManager = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [limit, setLimit] = useState(50);
  const { toast } = useToast();

  const loadLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (filterType !== "all") {
        query = query.eq("action_type", filterType);
      }

      if (searchTerm) {
        query = query.or(`user_email.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs((data || []).map(d => ({
        ...d,
        metadata: (typeof d.metadata === 'object' && d.metadata !== null ? d.metadata : {}) as Record<string, any>
      })));
    } catch (error) {
      console.error("Error loading activity logs:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les logs d'activité",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filterType, limit]);

  useEffect(() => {
    const channel = supabase
      .channel("activity_logs_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_logs" },
        (payload) => {
          const newLog = payload.new as any;
          const formattedLog: ActivityLog = {
            ...newLog,
            metadata: (typeof newLog.metadata === 'object' && newLog.metadata !== null ? newLog.metadata : {}) as Record<string, any>
          };
          setLogs((prev) => [formattedLog, ...prev].slice(0, limit));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  const handleSearch = () => {
    loadLogs();
  };

  const formatMetadata = (metadata: Record<string, any> | null): string => {
    if (!metadata || Object.keys(metadata).length === 0) return "-";
    
    const parts: string[] = [];
    if (metadata.order_id) parts.push(`Cmd: ${metadata.order_id.slice(0, 8)}...`);
    if (metadata.total) parts.push(`Total: ${metadata.total}€`);
    if (metadata.old_status && metadata.new_status) {
      parts.push(`${metadata.old_status} → ${metadata.new_status}`);
    }
    if (metadata.status && !metadata.old_status) parts.push(`Statut: ${metadata.status}`);
    if (metadata.payment_method) parts.push(`Paiement: ${metadata.payment_method}`);
    
    return parts.length > 0 ? parts.join(" | ") : "-";
  };

  if (loading && logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Journal des activités
        </CardTitle>
        <CardDescription>
          Suivez toutes les activités des utilisateurs sur la plateforme
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Rechercher par email ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrer par type" />
            </SelectTrigger>
            <SelectContent>
              {ACTION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v))}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25 lignes</SelectItem>
              <SelectItem value="50">50 lignes</SelectItem>
              <SelectItem value="100">100 lignes</SelectItem>
              <SelectItem value="200">200 lignes</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadLogs} variant="outline" size="icon">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="hidden md:table-cell">Détails</TableHead>
                <TableHead className="w-[150px]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Aucune activité enregistrée
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action_type)} className="flex items-center gap-1 w-fit">
                        {getActionIcon(log.action_type)}
                        <span className="hidden sm:inline">{getActionLabel(log.action_type)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.user_email || "Système"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {log.description}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                      {formatMetadata(log.metadata)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(log.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {logs.length >= limit && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => setLimit((prev) => prev + 50)}>
              Charger plus
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityLogsManager;
