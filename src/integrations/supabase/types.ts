export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_type: string
          created_at: string
          description: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          description: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      avis: {
        Row: {
          commentaire: string | null
          created_at: string | null
          id: string
          id_client: string
          id_produit: string
          note: number
        }
        Insert: {
          commentaire?: string | null
          created_at?: string | null
          id?: string
          id_client: string
          id_produit: string
          note: number
        }
        Update: {
          commentaire?: string | null
          created_at?: string | null
          id?: string
          id_client?: string
          id_produit?: string
          note?: number
        }
        Relationships: [
          {
            foreignKeyName: "avis_id_client_fkey"
            columns: ["id_client"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avis_id_produit_fkey"
            columns: ["id_produit"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          id_categorie: string | null
          image_url: string
          is_active: boolean
          link: string | null
          position: number
          sub_images: string[] | null
          title: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          id_categorie?: string | null
          image_url: string
          is_active?: boolean
          link?: string | null
          position?: number
          sub_images?: string[] | null
          title?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          id_categorie?: string | null
          image_url?: string
          is_active?: boolean
          link?: string | null
          position?: number
          sub_images?: string[] | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banners_id_categorie_fkey"
            columns: ["id_categorie"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          nom: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          nom: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          nom?: string
          slug?: string
        }
        Relationships: []
      }
      commande_items: {
        Row: {
          created_at: string | null
          id: string
          id_commande: string
          id_produit: string | null
          prix_unitaire: number
          quantite: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          id_commande: string
          id_produit?: string | null
          prix_unitaire: number
          quantite: number
        }
        Update: {
          created_at?: string | null
          id?: string
          id_commande?: string
          id_produit?: string | null
          prix_unitaire?: number
          quantite?: number
        }
        Relationships: [
          {
            foreignKeyName: "commande_items_id_commande_fkey"
            columns: ["id_commande"]
            isOneToOne: false
            referencedRelation: "commandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commande_items_id_produit_fkey"
            columns: ["id_produit"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
        ]
      }
      commandes: {
        Row: {
          adresse_livraison: string
          created_at: string | null
          id: string
          id_client: string
          methode_paiement: string | null
          statut: string | null
          total: number
        }
        Insert: {
          adresse_livraison: string
          created_at?: string | null
          id?: string
          id_client: string
          methode_paiement?: string | null
          statut?: string | null
          total: number
        }
        Update: {
          adresse_livraison?: string
          created_at?: string | null
          id?: string
          id_client?: string
          methode_paiement?: string | null
          statut?: string | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "commandes_id_client_fkey"
            columns: ["id_client"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          id_utilisateur: string
          lu: boolean | null
          message: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          id_utilisateur: string
          lu?: boolean | null
          message: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          id_utilisateur?: string
          lu?: boolean | null
          message?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_id_utilisateur_fkey"
            columns: ["id_utilisateur"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      panier: {
        Row: {
          created_at: string | null
          id: string
          id_produit: string
          id_utilisateur: string
          quantite: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          id_produit: string
          id_utilisateur: string
          quantite?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          id_produit?: string
          id_utilisateur?: string
          quantite?: number
        }
        Relationships: [
          {
            foreignKeyName: "panier_id_produit_fkey"
            columns: ["id_produit"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panier_id_utilisateur_fkey"
            columns: ["id_utilisateur"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      produits: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          id_categorie: string | null
          id_vendeur: string
          images: string[] | null
          nom: string
          prix: number
          slug: string
          statut: string | null
          stock: number
          updated_at: string | null
          ventes_total: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          id_categorie?: string | null
          id_vendeur: string
          images?: string[] | null
          nom: string
          prix: number
          slug: string
          statut?: string | null
          stock?: number
          updated_at?: string | null
          ventes_total?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          id_categorie?: string | null
          id_vendeur?: string
          images?: string[] | null
          nom?: string
          prix?: number
          slug?: string
          statut?: string | null
          stock?: number
          updated_at?: string | null
          ventes_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "produits_id_categorie_fkey"
            columns: ["id_categorie"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produits_id_vendeur_fkey"
            columns: ["id_vendeur"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      produits_vedettes: {
        Row: {
          created_at: string | null
          id: string
          id_produit: string
          position: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          id_produit: string
          position: number
        }
        Update: {
          created_at?: string | null
          id?: string
          id_produit?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "produits_vedettes_id_produit_fkey"
            columns: ["id_produit"]
            isOneToOne: true
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          adresse: string | null
          created_at: string | null
          email: string
          id: string
          nom: string
          telephone: string | null
          updated_at: string | null
        }
        Insert: {
          adresse?: string | null
          created_at?: string | null
          email: string
          id: string
          nom: string
          telephone?: string | null
          updated_at?: string | null
        }
        Update: {
          adresse?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nom?: string
          telephone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          statut: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          statut?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          statut?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendeur_commandes: {
        Row: {
          created_at: string | null
          id: string
          id_commande: string
          id_produit: string
          id_vendeur: string
          prix_unitaire: number
          quantite: number
          statut: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          id_commande: string
          id_produit: string
          id_vendeur: string
          prix_unitaire: number
          quantite: number
          statut?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          id_commande?: string
          id_produit?: string
          id_vendeur?: string
          prix_unitaire?: number
          quantite?: number
          statut?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendeur_commandes_id_commande_fkey"
            columns: ["id_commande"]
            isOneToOne: false
            referencedRelation: "commandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendeur_commandes_id_produit_fkey"
            columns: ["id_produit"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendeur_commandes_id_vendeur_fkey"
            columns: ["id_vendeur"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      become_seller: { Args: never; Returns: undefined }
      create_notification: {
        Args: { _message: string; _type?: string; _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_activity: {
        Args: {
          _action_type: string
          _description: string
          _metadata?: Json
          _user_email: string
          _user_id: string
        }
        Returns: string
      }
      update_commande_status: {
        Args: { _commande_id: string }
        Returns: undefined
      }
      vendor_can_view_profile: {
        Args: { _profile: string; _vendor: string }
        Returns: boolean
      }
      vendor_has_commande: {
        Args: { _commande: string; _vendor: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "client" | "vendeur" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["client", "vendeur", "admin"],
    },
  },
} as const
