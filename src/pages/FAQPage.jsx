import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { apiClient } from "@/App";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, Mail } from "lucide-react";

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await apiClient.get("/content/faqs");
        setFaqs(response.data);
      } catch (error) {
        // Use default FAQs if API fails
        setFaqs([
          {
            faq_id: "1",
            category: "Orders",
            question: "How can I track my order?",
            answer:
              "Once your order is shipped, you'll receive an email with tracking information. You can also track your order by visiting the 'Track Order' page and entering your order number.",
          },
          {
            faq_id: "2",
            category: "Shipping",
            question: "What are the shipping charges?",
            answer:
              "We offer free shipping on orders above ₹999. For orders below ₹999, a flat shipping fee of ₹99 applies.",
          },
          {
            faq_id: "3",
            category: "Returns",
            question: "What is your return policy?",
            answer:
              "We accept returns within 7 days of delivery for unused items in original packaging. Please note that personalized items cannot be returned unless damaged.",
          },
          {
            faq_id: "4",
            category: "Products",
            question: "Are your products eco-friendly?",
            answer:
              "Yes! We use sustainably sourced wood, eco-friendly resins, and natural materials wherever possible. Our packaging is also recyclable.",
          },
          {
            faq_id: "5",
            category: "Payments",
            question: "What payment methods do you accept?",
            answer:
              "We accept UPI, credit/debit cards, net banking, and cash on delivery. All transactions are secured with industry-standard encryption.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : faqs;

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return (
    <Layout>
      <div className="container-custom section-padding" data-testid="faq-page">
        <div className="text-center mb-12">
          <h1 className="heading-lg mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Find answers to common questions about orders, shipping, returns,
            and more.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="faq-search"
            />
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : Object.keys(groupedFaqs).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No FAQs found matching your search.
              </p>
            </div>
          ) : (
            Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
              <div key={category} className="mb-8">
                <h2 className="font-semibold text-lg mb-4">{category}</h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {categoryFaqs.map((faq) => (
                    <AccordionItem
                      key={faq.faq_id}
                      value={faq.faq_id}
                      className="bg-card border border-border rounded-lg px-4"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))
          )}
        </div>

        {/* Still Need Help */}
        <div className="max-w-xl mx-auto mt-12 text-center bg-muted/30 rounded-xl p-8">
          <Mail className="mx-auto text-primary mb-4" size={32} />
          <h3 className="font-semibold text-lg mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-4">
            Can't find the answer you're looking for? Our team is here to help.
          </p>
          <Link to="/contact">
            <Button>Contact Us</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage;
