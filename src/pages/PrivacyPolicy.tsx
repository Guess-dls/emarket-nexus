import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Politique de confidentialité - DanMaket"
        description="Politique de confidentialité et protection des données personnelles sur DanMaket"
      />
      <Navbar />
      
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Politique de confidentialité</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>1. Collecte des données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                DanMaket collecte les données personnelles suivantes lorsque vous utilisez notre plateforme :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Nom complet</li>
                <li>Adresse email</li>
                <li>Numéro de téléphone (optionnel)</li>
                <li>Adresse de livraison</li>
                <li>Informations de paiement (traitées de manière sécurisée)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>2. Utilisation des données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Vos données personnelles sont utilisées pour :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Traiter vos commandes et gérer votre compte</li>
                <li>Vous contacter concernant vos commandes</li>
                <li>Améliorer nos services</li>
                <li>Vous envoyer des notifications importantes</li>
                <li>Prévenir la fraude et assurer la sécurité de la plateforme</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>3. Protection des données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Nous prenons la sécurité de vos données très au sérieux. Toutes les informations sensibles sont cryptées et stockées de manière sécurisée. Nous utilisons des protocoles de sécurité avancés pour protéger vos données contre tout accès non autorisé.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>4. Partage des données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Nous ne vendons jamais vos données personnelles. Vos informations peuvent être partagées uniquement dans les cas suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Avec les vendeurs pour traiter vos commandes</li>
                <li>Avec les prestataires de services de paiement</li>
                <li>Avec les services de livraison</li>
                <li>Si requis par la loi ou les autorités compétentes</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>5. Vos droits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Vous disposez des droits suivants concernant vos données personnelles :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification de vos données</li>
                <li>Droit de suppression de votre compte</li>
                <li>Droit d'opposition au traitement de vos données</li>
                <li>Droit à la portabilité de vos données</li>
              </ul>
              <p className="mt-4">
                Pour exercer ces droits, contactez-nous à : <a href="mailto:ninopaket@gmail.com" className="text-primary hover:underline">ninopaket@gmail.com</a>
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>6. Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Notre site utilise des cookies pour améliorer votre expérience. Ces cookies nous aident à :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mémoriser votre panier</li>
                <li>Garder votre session active</li>
                <li>Analyser l'utilisation du site</li>
              </ul>
              <p className="mt-4">
                Vous pouvez désactiver les cookies dans les paramètres de votre navigateur, mais certaines fonctionnalités du site pourraient ne plus fonctionner correctement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Pour toute question concernant cette politique de confidentialité, vous pouvez nous contacter :
              </p>
              <ul className="list-none space-y-2">
                <li>📧 Email : <a href="mailto:ninopaket@gmail.com" className="text-primary hover:underline">ninopaket@gmail.com</a></li>
                <li>📱 WhatsApp : <a href="https://wa.me/2250564825563" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">+225 05 64 82 55 63</a></li>
              </ul>
            </CardContent>
          </Card>

          <p className="mt-8 text-sm text-muted-foreground text-center">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
