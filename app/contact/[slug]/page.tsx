"use client";

import { use } from "react";
import CharacterDemo2 from "../../_chardemo2/page";

type ContactPageProps = {
  params: Promise<{ slug: string }>;
};

export default function ContactPage({ params }: ContactPageProps) {
  const resolvedParams = use(params);
  return <CharacterDemo2 slugParam={resolvedParams.slug} />;
}
