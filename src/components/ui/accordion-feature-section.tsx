"use client";

import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FeatureItem {
  id: number;
  title: string;
  image: string;
  description: string;
}

interface Feature197Props {
  features: FeatureItem[];
  title?: string;
  description?: string;
}

const Feature197 = ({ features, title, description }: Feature197Props) => {
  const [activeTabId, setActiveTabId] = useState(1);
  const [activeImage, setActiveImage] = useState(features[0]?.image || "");

  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {(title || description) && (
            <div className="text-center mb-16">
              {title && (
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                  {description}
                </p>
              )}
            </div>
          )}
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <Accordion
                type="single"
                value={`item-${activeTabId}`}
                onValueChange={(value) => {
                  if (value) {
                    const id = parseInt(value.replace("item-", ""));
                    setActiveTabId(id);
                    const feature = features.find((f) => f.id === id);
                    if (feature) setActiveImage(feature.image);
                  }
                }}
                className="w-full"
              >
                {features.map((tab) => (
                  <AccordionItem key={tab.id} value={`item-${tab.id}`} className="border-b border-border/50">
                    <AccordionTrigger
                      onClick={() => {
                        setActiveImage(tab.image);
                        setActiveTabId(tab.id);
                      }}
                      className="cursor-pointer py-5 !no-underline transition hover:no-underline"
                    >
                      <span className="text-base font-medium text-foreground">
                        {tab.title}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground leading-relaxed pb-2">
                        {tab.description}
                      </p>
                      <div className="mt-4 lg:hidden">
                        <img
                          src={tab.image}
                          alt={tab.title}
                          className="aspect-video w-full rounded-lg object-cover"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="hidden lg:block">
              <img
                src={activeImage}
                alt="Feature preview"
                className="aspect-video w-full rounded-lg object-cover border border-border/30"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Feature197 };
