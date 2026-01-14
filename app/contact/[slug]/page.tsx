"use client";

import { use } from "react";
import CharacterDemo2 from "../../chardemo2/page";

type ContactPageProps = {
  params: { slug: string };
};

export default function ContactPage({ params }: ContactPageProps) {
  const resolvedParams = use(params);
  return <CharacterDemo2 slugParam={resolvedParams.slug} />;
}
