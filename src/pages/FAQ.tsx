import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      question: "Comment passer une commande ?",
      answer: "Pour passer une commande, parcourez nos produits, ajoutez-les à votre panier, puis cliquez sur l'icône panier en haut à droite. Suivez les étapes de paiement et confirmez votre commande."
    },
    {
      question: "Quels sont les modes de paiement acceptés ?",
      answer: "Nous acceptons les paiements par carte bancaire, mobile money et virement bancaire. Tous les paiements sont sécurisés."
    },
    {
      question: "Comment suivre ma commande ?",
      answer: "Une fois connecté, accédez à votre tableau de bord client pour suivre l'état de vos commandes en temps réel."
    },
    {
      question: "Quelle est la politique de retour ?",
      answer: "Vous pouvez retourner un produit dans les 14 jours suivant la réception. Le produit doit être dans son état d'origine avec l'emballage intact."
    },
    {
      question: "Combien de temps prend la livraison ?",
      answer: "La livraison prend généralement entre 2 et 7 jours ouvrables selon votre localisation. Vous recevrez un email de confirmation avec les détails de livraison."
    },
    {
      question: "Comment devenir vendeur sur Lovable ?",
      answer: "Cliquez sur 'Devenir vendeur' sur la page d'accueil, créez un compte en sélectionnant le rôle 'Vendeur', puis accédez à votre tableau de bord vendeur pour ajouter vos produits."
    },
    {
      question: "Comment contacter le support client ?",
      answer: "Vous pouvez nous contacter par email à ninopaket@gmail.com. Notre équipe vous répondra dans les plus brefs délais."
    },
    {
      question: "Les produits sont-ils garantis ?",
      answer: "Tous nos produits sont vérifiés avant expédition. En cas de défaut, contactez-nous dans les 7 jours suivant la réception pour un remplacement ou remboursement."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="FAQ - Questions Fréquentes | Lovable"
        description="Trouvez les réponses à vos questions sur Lovable : commande, paiement, livraison, retours et plus encore."
        url="/faq"
      />
      <Navbar />
      
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-primary">
              Questions Fréquentes
            </h1>
            <p className="text-muted-foreground">
              Trouvez rapidement les réponses à vos questions
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border rounded-lg px-6 bg-card"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 p-6 border rounded-lg bg-muted/30 text-center">
            <h3 className="text-xl font-semibold mb-2">Vous ne trouvez pas votre réponse ?</h3>
            <p className="text-muted-foreground mb-4">
              Notre équipe est là pour vous aider
            </p>
            <a 
              href="mailto:ninopaket@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-medium"
            >
              <Mail className="h-5 w-5" />
              Nous contacter
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
