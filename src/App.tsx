import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import TurnstileWidget from "./components/TurnstileWidget";

type Locale = "de" | "en";
type RoutePath = "/" | "/about" | "/impressum" | "/datenschutz";
type LocalizedText = Record<Locale, string>;

type ProjectCard = {
  title: LocalizedText;
  subtitle: LocalizedText;
  badge: LocalizedText;
  status: LocalizedText;
  image: LocalizedText;
  imageFit?: "cover" | "contain";
  href: string;
  external?: boolean;
};

type FocusArea = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
};

type ProcessStep = {
  step: string;
  title: LocalizedText;
  description: LocalizedText;
};

type SkillCard = {
  title: LocalizedText;
  description: LocalizedText;
};

type ProfileProject = {
  period: LocalizedText;
  client: LocalizedText;
  title: LocalizedText;
  role: LocalizedText;
  description: LocalizedText;
  stack: LocalizedText;
};

type TimelineEntry = {
  period: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
};

type HeaderProps = {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  currentPath: RoutePath;
};

type FooterProps = {
  locale: Locale;
  currentPath: RoutePath;
};

type ContactSectionVariant = "home" | "about";

type ContactSectionProps = {
  locale: Locale;
  variant: ContactSectionVariant;
};

type ContactConfigState = {
  status: "loading" | "ready" | "error";
  configured: boolean;
  turnstileSiteKey: string | null;
};

const localeStorageKey = "jsa-forge-locale";
const siteName = "JSA Forge";
const contactName = "Janosch Schickel-Adams";
const contactStreet = "Dorfstr. 6";
const contactCity = "34633 Ottrau";
const contactCountry = "Deutschland";
const contactEmail =
  import.meta.env.VITE_CONTACT_EMAIL?.trim() || "kontakt@example.com";
const discordLink =
  import.meta.env.VITE_DISCORD_LINK?.trim() || "https://discord.gg/dein-link";
const bfdiLink = "https://www.bfdi.bund.de/";

const copy = {
  de: {
    titles: {
      home: "JSA Forge",
      about: "Über mich | JSA Forge",
      imprint: "Impressum | JSA Forge",
      privacy: "Datenschutz | JSA Forge",
    },
    nav: {
      projects: "Projekte",
      about: "Über mich",
      discord: "Discord",
      contact: "Kontakt",
      language: "Sprache",
    },
    hero: {
      kicker: "JSA Forge",
      lines: ["Digitale Produkte.", "Klare Struktur.", "Echter Nutzen."],
      description:
        "JSA Forge entwickelt Web-Apps, interne Tools und individuelle Software mit sauberer Architektur, klarem Scope und Blick auf den realen Einsatz.",
      points: ["Web-Apps", "Interne Tools", "Backend & Architektur"],
      cardKicker: "Zusammenarbeit",
      cardTitle: "Klar im Scope. Sauber in der Umsetzung.",
      cardItems: [
        "Strukturierte Begleitung von der Idee bis zum Release.",
        "Pragmatische technische Entscheidungen statt unnötiger Komplexität.",
        "Passend für Unternehmen, Vereine und spezialisierte Produktideen.",
      ],
      primary: "Projekte ansehen",
      secondary: "Kontakt",
      scroll: "Mehr erfahren",
    },
    spotlight: {
      kicker: "Aktuelles Projekt",
      title: "Säbelfechten Kommandotrainer",
      description:
        "Eine browserbasierte Trainings-App für Säbelfechter. Über Timing, Kommandos, Fußarbeit und Drills mit gesprochenen Ansagen.",
      benefits: [
        "Sprachgesteuerte Kommandos",
        "Verschiedene Trainingsmodi",
        "Session-Historie und Statistiken",
      ],
      primary: "Zum Projekt",
      secondary: "GitHub",
    },
    projects: {
      kicker: "Projekte",
      title: "Entwickelt mit klarem Ziel",
      inquiry: "Projektanfrage",
    },
    focus: {
      kicker: "Was wir bauen",
      title: "Fokus auf das Wesentliche",
    },
    aboutPreview: {
      kicker: "Über JSA Forge",
      title: "Ein Mensch. Klare Vision.",
      paragraphs: [
        "Ich bin Janosch Schickel-Adams, Entwickler und Gründer von JSA Forge.",
        "Ich entwickle digitale Produkte mit Fokus auf Usability, Performance und nachvollziehbarer technischer Struktur.",
        "Von Trainings-Apps über Tools bis hin zu experimentellen Projekten entsteht hier Software mit Zweck.",
      ],
      cta: "Mehr über mich",
    },
    process: {
      kicker: "Unser Prozess",
      title: "Von der Idee zum Produkt",
    },
    contact: {
      fields: {
        name: "Name",
        email: "E-Mail",
        message: "Nachricht",
        namePlaceholder: "Dein Name",
        emailPlaceholder: "deine@email.de",
        messagePlaceholder: "Worum geht es?",
        submit: "Anfrage senden",
        success: "Deine Nachricht wurde erfolgreich gesendet.",
      },
      home: {
        kicker: "Kontakt",
        title: "Projektanfrage oder Feedback",
        description:
          "Du möchtest ein digitales Werkzeug bauen, eine bestehende Idee schärfen oder einfach Kontakt aufnehmen? Schreib mir direkt.",
        detailsTitle: "Direkter Draht",
        note: "Das Formular sendet deine Anfrage direkt an das Kontakt-Backend und schützt sich über Turnstile gegen Spam.",
      },
      about: {
        kicker: "Kontakt",
        title: "Lass uns über dein Vorhaben sprechen",
        description:
          "Wenn du Unterstützung bei einer Web-App, einem Tool, einem MVP oder bei technischer Produktarbeit suchst, kannst du mir hier direkt schreiben.",
        detailsTitle: "Ansprechpartner",
        note: "Deine Anfrage wird direkt serverseitig verarbeitet und per E-Mail an mich weitergeleitet.",
      },
    },
    footer: {
      quickLinks: "Schnellzugriff",
      talkTitle: "Lass uns sprechen",
      talkText:
        "Wenn du eine Idee, Feedback oder ein Projekt hast, schreib mir über das Kontaktformular oder direkt über Discord.",
      emailButton: "E-Mail schreiben",
      discordButton: "Discord beitreten",
    },
    aboutPage: {
      kicker: "Profil",
      title: "Janosch Schickel-Adams",
      subtitle: "Senior Backend Developer, Consultant und Gründer von JSA Forge.",
      intro:
        "Seit über 15 Jahren entwickle ich Software für Behörden, Logistik, Banking, Versicherung und Mobilität. Mein Schwerpunkt liegt auf Java- und Spring-basierten Backend-Systemen, Integrationen und pragmatischer Produktentwicklung.",
      primary: "Projekt anfragen",
      secondary: "Zur Startseite",
      highlights: [
        "15+ Jahre Application Development",
        "11+ Jahre Consulting",
        "Java, Spring, APIs und Integrationen",
      ],
      skills: {
        kicker: "Skills",
        title: "Wichtige Skills",
      },
      projects: {
        kicker: "Projekterfahrung",
        title: "Anonymisierte Kundenprojekte",
        note:
          "Kundennamen und einzelne Projektdetails sind bewusst verallgemeinert, da hierfür keine öffentliche Freigabe vorliegt.",
      },
      cv: {
        kicker: "Lebenslauf",
        title: "Beruflicher Werdegang",
        note:
          "Ausbildung: Fachinformatiker für Anwendungsentwicklung (2012-2015, Gesamtnote 1,9) sowie Fachhochschulreife Technik (2010-2012).",
      },
    },
    legal: {
      kicker: "Rechtliches",
      imprint: {
        title: "Impressum",
        section1: "Angaben gemäß Paragraph 5 DDG",
        section2: "Kontakt",
        section3: "Verantwortlich für den Inhalt nach Paragraph 18 Abs. 2 MStV",
        section4: "Haftung für Inhalte",
        section5: "Haftung für Links",
        section6: "Urheberrecht",
        updated: "Letzte Aktualisierung: April 2026",
      },
      privacy: {
        title: "Datenschutz",
        section1: "1. Verantwortlicher",
        section2: "2. Allgemeines zur Datenverarbeitung",
        section3: "3. Zugriff auf die Website",
        section4: "4. Kontaktformular und E-Mail-Kontakt",
        section5: "5. Externe Links",
        section6: "6. Deine Rechte",
        section7: "7. Beschwerderecht bei der Aufsichtsbehörde",
        section8: "8. Aktualität und Änderung dieser Datenschutzerklärung",
        updated: "Letzte Aktualisierung: April 2026",
      },
    },
  },
  en: {
    titles: {
      home: "JSA Forge",
      about: "About | JSA Forge",
      imprint: "Imprint | JSA Forge",
      privacy: "Privacy Policy | JSA Forge",
    },
    nav: {
      projects: "Projects",
      about: "About",
      discord: "Discord",
      contact: "Contact",
      language: "Language",
    },
    hero: {
      kicker: "JSA Forge",
      lines: ["Digital products.", "Clear structure.", "Real value."],
      description:
        "JSA Forge builds web apps, internal tools and custom software with clean architecture, clear scope and a focus on real-world use.",
      points: ["Web apps", "Internal tools", "Backend & architecture"],
      cardKicker: "Working together",
      cardTitle: "Clear in scope. Clean in delivery.",
      cardItems: [
        "Structured support from the initial idea to release.",
        "Pragmatic technical decisions instead of unnecessary complexity.",
        "A strong fit for companies, clubs and specialized product ideas.",
      ],
      primary: "View projects",
      secondary: "Contact",
      scroll: "Learn more",
    },
    spotlight: {
      kicker: "Current project",
      title: "Sabre Command Trainer",
      description:
        "A browser-based training app for sabre fencers, built around timing, spoken commands, footwork and drill practice.",
      benefits: [
        "Voice-guided commands",
        "Multiple training modes",
        "Session history and statistics",
      ],
      primary: "Open project",
      secondary: "GitHub",
    },
    projects: {
      kicker: "Projects",
      title: "Built with a clear goal",
      inquiry: "Project enquiry",
    },
    focus: {
      kicker: "What we build",
      title: "Focus on what matters",
    },
    aboutPreview: {
      kicker: "About JSA Forge",
      title: "One founder. Clear vision.",
      paragraphs: [
        "I am Janosch Schickel-Adams, developer and founder of JSA Forge.",
        "I build digital products with a focus on usability, performance and clean technical structure.",
        "From training apps to tools and experimental ideas, the goal is always software with a purpose.",
      ],
      cta: "More about me",
    },
    process: {
      kicker: "Our process",
      title: "From idea to product",
    },
    contact: {
      fields: {
        name: "Name",
        email: "Email",
        message: "Message",
        namePlaceholder: "Your name",
        emailPlaceholder: "your@email.com",
        messagePlaceholder: "What can I help with?",
        submit: "Send enquiry",
        success: "Your message was sent successfully.",
      },
      home: {
        kicker: "Contact",
        title: "Project enquiry or feedback",
        description:
          "If you want to build a digital tool, sharpen an existing idea or simply get in touch, send me a message here.",
        detailsTitle: "Direct contact",
        note: "The form sends your request directly to the contact backend and is protected against spam through Turnstile.",
      },
      about: {
        kicker: "Contact",
        title: "Let us talk about your project",
        description:
          "If you need support with a web app, tool, MVP or technical product work, you can reach out directly here.",
        detailsTitle: "Point of contact",
        note: "Your request is processed server-side and forwarded to me by email.",
      },
    },
    footer: {
      quickLinks: "Quick links",
      talkTitle: "Let us talk",
      talkText:
        "If you have an idea, feedback or a project in mind, feel free to use the contact form or reach out directly on Discord.",
      emailButton: "Write an email",
      discordButton: "Join Discord",
    },
    aboutPage: {
      kicker: "Profile",
      title: "Janosch Schickel-Adams",
      subtitle: "Senior backend developer, consultant and founder of JSA Forge.",
      intro:
        "For more than 15 years I have built software for public sector, logistics, banking, insurance and mobility environments. My main focus is Java- and Spring-based backend systems, integrations and pragmatic product delivery.",
      primary: "Start a project",
      secondary: "Back to home",
      highlights: [
        "15+ years in application development",
        "11+ years in consulting",
        "Java, Spring, APIs and integrations",
      ],
      skills: {
        kicker: "Skills",
        title: "Key skills",
      },
      projects: {
        kicker: "Project experience",
        title: "Anonymized client projects",
        note:
          "Client names and some project details are intentionally generalized because I do not have approval to publish them in full.",
      },
      cv: {
        kicker: "Resume",
        title: "Career history",
        note:
          "Education: vocational training as an application development specialist (2012-2015, final grade 1.9) and technical college entrance qualification (2010-2012).",
      },
    },
    legal: {
      kicker: "Legal",
      imprint: {
        title: "Imprint",
        section1: "Information pursuant to Section 5 DDG",
        section2: "Contact",
        section3: "Responsible for content pursuant to Section 18 Paragraph 2 MStV",
        section4: "Liability for content",
        section5: "Liability for links",
        section6: "Copyright",
        updated: "Last updated: April 2026",
      },
      privacy: {
        title: "Privacy Policy",
        section1: "1. Controller",
        section2: "2. General information on data processing",
        section3: "3. Access to this website",
        section4: "4. Contact form and email communication",
        section5: "5. External links",
        section6: "6. Your rights",
        section7: "7. Right to lodge a complaint",
        section8: "8. Currency and changes to this privacy policy",
        updated: "Last updated: April 2026",
      },
    },
  },
} as const;

const projectCards: ProjectCard[] = [
  {
    title: { de: "Säbelfechten Kommandotrainer", en: "Sabre Command Trainer" },
    subtitle: {
      de: "Trainings-App für Säbelfechter",
      en: "Training app for sabre fencers",
    },
    badge: { de: "Web-App", en: "Web app" },
    status: { de: "Live", en: "Live" },
    image: {
      de: "/assets/sabre-command-trainer-home-de.png",
      en: "/assets/sabre-command-trainer-home-en.png",
    },
    href: "https://sabrecommandtrainer.com",
    external: true,
  },
  {
    title: { de: "Interne Produktidee", en: "Internal product idea" },
    subtitle: {
      de: "Konzept in Ausarbeitung",
      en: "Concept in development",
    },
    badge: { de: "Tool", en: "Tool" },
    status: { de: "In Arbeit", en: "In progress" },
    image: {
      de: "/assets/jsa-forge-wordmark.svg",
      en: "/assets/jsa-forge-wordmark.svg",
    },
    imageFit: "contain",
    href: "#contact",
  },
];

const focusAreas: FocusArea[] = [
  {
    id: "01",
    title: { de: "Web-Apps", en: "Web apps" },
    description: {
      de: "Wir entwickeln moderne Anwendungen mit klarer Informationsarchitektur und sauberer technischer Basis.",
      en: "We build modern applications with clear information architecture and a clean technical foundation.",
    },
  },
  {
    id: "02",
    title: { de: "Tools", en: "Tools" },
    description: {
      de: "Wir schaffen praktische Werkzeuge, die Prozesse vereinfachen, Zeit sparen und nutzbar bleiben.",
      en: "We create practical tools that simplify processes, save time and stay usable in daily work.",
    },
  },
  {
    id: "03",
    title: { de: "Prototypen", en: "Prototypes" },
    description: {
      de: "Wir testen neue Ideen schnell, ohne den Blick für Qualität, Fokus und spätere Skalierbarkeit zu verlieren.",
      en: "We test new ideas quickly without losing sight of quality, focus and future scalability.",
    },
  },
  {
    id: "04",
    title: { de: "Beratung", en: "Consulting" },
    description: {
      de: "Wir unterstützen bei technischer Einordnung, Produktstruktur und einem sinnvollen Weg zur Umsetzung.",
      en: "We support technical direction, product structure and a sensible path from concept to delivery.",
    },
  },
];

const processSteps: ProcessStep[] = [
  {
    step: "1",
    title: { de: "Idee", en: "Idea" },
    description: {
      de: "Wir definieren Problem, Zielbild und Prioritäten, bevor umgesetzt wird.",
      en: "We define the problem, target outcome and priorities before we start building.",
    },
  },
  {
    step: "2",
    title: { de: "Entwicklung", en: "Build" },
    description: {
      de: "Wir entwickeln iterativ, transparent und mit einem klar abgegrenzten Scope.",
      en: "We build iteratively, transparently and with a clearly defined scope.",
    },
  },
  {
    step: "3",
    title: { de: "Testen", en: "Validate" },
    description: {
      de: "Wir prüfen Funktion, Nutzbarkeit und Performance vor jedem Release.",
      en: "We validate functionality, usability and performance before each release.",
    },
  },
  {
    step: "4",
    title: { de: "Ausliefern", en: "Deliver" },
    description: {
      de: "Wir stellen das Produkt sauber bereit und halten es sinnvoll ausbaubar.",
      en: "We deliver the product cleanly and keep it ready for future growth.",
    },
  },
];

const skillCards: SkillCard[] = [
  {
    title: { de: "Java, Spring Boot und REST APIs", en: "Java, Spring Boot and REST APIs" },
    description: {
      de: "Schwerpunkt auf Backend-Entwicklung, Integrationen, serviceorientierten Architekturen und produktionsnahen Anwendungen.",
      en: "Strong focus on backend development, integrations, service-oriented architectures and production-ready applications.",
    },
  },
  {
    title: { de: "Messaging, Batch und Datenflüsse", en: "Messaging, batch and data flows" },
    description: {
      de: "Kafka, Apache NiFi, Spring Batch und ActiveMQ für technische Prozessketten und Integrationsszenarien.",
      en: "Kafka, Apache NiFi, Spring Batch and ActiveMQ for technical process chains and integration-heavy scenarios.",
    },
  },
  {
    title: { de: "Angular, React und TypeScript", en: "Angular, React and TypeScript" },
    description: {
      de: "Single-Page-Anwendungen, Frontend-Integration und responsive Oberflächen, wenn ein Projekt auch UI-seitig Stärke braucht.",
      en: "Single-page applications, frontend integration and responsive interfaces whenever a project also needs strong UI work.",
    },
  },
  {
    title: { de: "SQL, PostgreSQL und MongoDB", en: "SQL, PostgreSQL and MongoDB" },
    description: {
      de: "Sichere Arbeit mit relationalen und dokumentenbasierten Datenmodellen sowie produktionsnahen Datenbank-Setups.",
      en: "Solid experience with relational and document-oriented data models and production-oriented database setups.",
    },
  },
  {
    title: { de: "TDD, DDD und Clean Code", en: "TDD, DDD and clean code" },
    description: {
      de: "Testbare Architektur, nachhaltige Weiterentwicklung und sauber geschnittene fachliche Strukturen.",
      en: "Testable architecture, sustainable further development and clean domain-focused structures.",
    },
  },
  {
    title: { de: "DevOps und Plattformen", en: "DevOps and platforms" },
    description: {
      de: "Linux, AWS, Maven, Gradle und produktionsnahe Auslieferung im Zusammenspiel mit Entwicklung und Betrieb.",
      en: "Linux, AWS, Maven, Gradle and production-oriented delivery across development and operations.",
    },
  },
];

const profileProjects: ProfileProject[] = [
  {
    period: { de: "04/2024-heute", en: "04/2024-present" },
    client: {
      de: "Behördenumfeld",
      en: "Public sector environment",
    },
    title: { de: "Nationale Datenplattform", en: "National data platform" },
    role: {
      de: "DevOps Engineer und Software Entwickler",
      en: "DevOps engineer and software developer",
    },
    description: {
      de: "Entwicklung mehrerer Spring-Boot-Anwendungen, Aufbau von Datenflüssen mit Apache NiFi sowie technische Konfiguration von Linux- und Windows-Servern.",
      en: "Built several Spring Boot applications, implemented data flows with Apache NiFi and handled technical setup for Linux and Windows servers.",
    },
    stack: {
      de: "Java, Spring Boot, Apache NiFi, Groovy, Angular, Linux, Windows",
      en: "Java, Spring Boot, Apache NiFi, Groovy, Angular, Linux, Windows",
    },
  },
  {
    period: { de: "05/2023-03/2024", en: "05/2023-03/2024" },
    client: { de: "Schweizer Logistikunternehmen", en: "Swiss logistics company" },
    title: { de: "Paket-Tracking und Ereignisüberwachung", en: "Parcel tracking and event monitoring" },
    role: { de: "DevOps Engineer", en: "DevOps engineer" },
    description: {
      de: "Entwicklung eines neuen Microservice für die Überwachung von Paketereignissen und die Benachrichtigung interner Dienste im Zuge einer Systemmigration.",
      en: "Built a new microservice for parcel event monitoring and internal notifications as part of a system migration.",
    },
    stack: {
      de: "Java, Spring Boot, Spring Batch, Kafka, Maven, TDD, DDD",
      en: "Java, Spring Boot, Spring Batch, Kafka, Maven, TDD, DDD",
    },
  },
  {
    period: { de: "11/2022-04/2023", en: "11/2022-04/2023" },
    client: { de: "Mobilitäts- und Automotive-Unternehmen", en: "Mobility and automotive company" },
    title: { de: "Autonom fahrendes Shuttle und Leitstelle", en: "Autonomous shuttle and operator center" },
    role: { de: "Software Entwickler", en: "Software developer" },
    description: {
      de: "Entwicklung von Software für Navigation und Überwachung eines autonom fahrenden Fahrzeugs inklusive zentraler Leitstellenfunktionen.",
      en: "Developed software for navigation and monitoring of an autonomous vehicle including central operator capabilities.",
    },
    stack: {
      de: "Java, Spring Boot, Kafka, PostgreSQL, Microservices, TDD, DDD",
      en: "Java, Spring Boot, Kafka, PostgreSQL, Microservices, TDD, DDD",
    },
  },
  {
    period: { de: "06/2020-10/2022", en: "06/2020-10/2022" },
    client: { de: "Behörde im Bereich Arbeit", en: "Public authority in the labor domain" },
    title: { de: "Weiterentwicklung einer Fachanwendung", en: "Further development of a core business application" },
    role: { de: "Software Entwickler", en: "Software developer" },
    description: {
      de: "Weiterentwicklung einer bestehenden Fachanwendung mit Fokus auf Backend-Funktionalität, Batch-Verarbeitung und stabile Lieferbarkeit.",
      en: "Further development of an existing business-critical application with a focus on backend functionality, batch processing and reliable delivery.",
    },
    stack: {
      de: "Java, Spring, Spring Batch, Maven, Eclipse",
      en: "Java, Spring, Spring Batch, Maven, Eclipse",
    },
  },
  {
    period: { de: "06/2018-05/2019", en: "06/2018-05/2019" },
    client: { de: "Versicherungsumfeld", en: "Insurance environment" },
    title: { de: "Digitale Antragstrecken für Risikoleben", en: "Digital application journeys for life insurance" },
    role: { de: "Software Entwickler", en: "Software developer" },
    description: {
      de: "Entwicklung von Spring-Boot-basierten Backend-Services für digitale Antragsprozesse im Versicherungsumfeld.",
      en: "Built Spring Boot based backend services for digital application processes in the insurance domain.",
    },
    stack: {
      de: "Java, Spring Boot, Kafka, ActiveMQ, PostgreSQL, TDD, DDD",
      en: "Java, Spring Boot, Kafka, ActiveMQ, PostgreSQL, TDD, DDD",
    },
  },
  {
    period: { de: "10/2017-01/2018", en: "10/2017-01/2018" },
    client: { de: "Banking und Finanzdienstleistungen", en: "Banking and financial services" },
    title: { de: "Regulatorische Anpassungen und Systemanbindung", en: "Regulatory changes and system integration" },
    role: { de: "Software Entwickler", en: "Software developer" },
    description: {
      de: "Umsetzung regulatorischer Änderungen mit Nachrichtenverarbeitung, Drittanbindung und robuster Integrationslogik.",
      en: "Implemented regulatory changes with message processing, third-party integration and robust integration logic.",
    },
    stack: {
      de: "Java, Apache Camel, ActiveMQ, TDD, DDD",
      en: "Java, Apache Camel, ActiveMQ, TDD, DDD",
    },
  },
];

const timelineEntries: TimelineEntry[] = [
  {
    period: { de: "05/2026-heute", en: "05/2026-present" },
    title: { de: "JSA Forge", en: "JSA Forge" },
    description: {
      de: "Gründer, Produktentwicklung und Consulting",
      en: "Founder, product development and consulting",
    },
  },
  {
    period: { de: "04/2024-heute", en: "04/2024-present" },
    title: { de: "Eviden Germany GmbH", en: "Eviden Germany GmbH" },
    description: {
      de: "Senior Backend Developer • Frankfurt am Main",
      en: "Senior backend developer • Frankfurt am Main",
    },
  },
  {
    period: { de: "10/2022-03/2024", en: "10/2022-03/2024" },
    title: { de: "EDAG Production Solutions GmbH & Co. KG", en: "EDAG Production Solutions GmbH & Co. KG" },
    description: {
      de: "Senior Software Developer • Fulda",
      en: "Senior software developer • Fulda",
    },
  },
  {
    period: { de: "02/2018-10/2022", en: "02/2018-10/2022" },
    title: { de: "Cegeka Deutschland GmbH", en: "Cegeka Deutschland GmbH" },
    description: {
      de: "Senior IT-Consulting • Nürnberg",
      en: "Senior IT consulting • Nuremberg",
    },
  },
  {
    period: { de: "10/2017-01/2018", en: "10/2017-01/2018" },
    title: { de: "Adesso AG", en: "Adesso AG" },
    description: {
      de: "Senior IT-Consulting • Nürnberg",
      en: "Senior IT consulting • Nuremberg",
    },
  },
  {
    period: { de: "09/2015-09/2017", en: "09/2015-09/2017" },
    title: { de: "adorsys GmbH & Co. KG", en: "adorsys GmbH & Co. KG" },
    description: {
      de: "IT-Consulting • Nürnberg",
      en: "IT consulting • Nuremberg",
    },
  },
  {
    period: { de: "08/2010-08/2015", en: "08/2010-08/2015" },
    title: { de: "AFS-Software GmbH & Co. KG", en: "AFS-Software GmbH & Co. KG" },
    description: {
      de: "Software Entwickler • Bad Hersfeld",
      en: "Software developer • Bad Hersfeld",
    },
  },
];

function getCurrentPath() {
  if (typeof window === "undefined") {
    return "/";
  }

  const trimmed = window.location.pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

function normalizeRoute(path: string): RoutePath {
  if (path === "/about") {
    return "/about";
  }

  if (path === "/impressum") {
    return "/impressum";
  }

  if (path === "/datenschutz") {
    return "/datenschutz";
  }

  return "/";
}

function getInitialLocale(): Locale {
  if (typeof window === "undefined") {
    return "de";
  }

  const savedLocale = window.localStorage.getItem(localeStorageKey);
  if (savedLocale === "de" || savedLocale === "en") {
    return savedLocale;
  }

  return window.navigator.language.toLowerCase().startsWith("de") ? "de" : "en";
}

function getNavItems(locale: Locale, currentPath: RoutePath) {
  const labels = copy[locale].nav;
  const projectsHref = currentPath === "/" ? "#projects" : "/#projects";
  const contactHref =
    currentPath === "/" || currentPath === "/about" ? "#contact" : "/#contact";

  return [
    {
      label: labels.projects,
      href: projectsHref,
      active: currentPath === "/",
    },
    {
      label: labels.about,
      href: "/about",
      active: currentPath === "/about",
    },
    {
      label: labels.discord,
      href: discordLink,
      external: true,
    },
    {
      label: labels.contact,
      href: contactHref,
    },
  ];
}

function ExternalArrow() {
  return (
    <svg
      aria-hidden="true"
      className="external-arrow"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 16L16 8M10 8H16V14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg
      aria-hidden="true"
      className="hero-scroll-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocaleSwitch({
  locale,
  onLocaleChange,
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}) {
  return (
    <div className="locale-switch" role="group" aria-label={copy[locale].nav.language}>
      <button
        type="button"
        className={locale === "de" ? "is-active" : undefined}
        aria-pressed={locale === "de"}
        onClick={() => onLocaleChange("de")}
      >
        DE
      </button>
      <button
        type="button"
        className={locale === "en" ? "is-active" : undefined}
        aria-pressed={locale === "en"}
        onClick={() => onLocaleChange("en")}
      >
        EN
      </button>
    </div>
  );
}

function SiteHeader({ locale, onLocaleChange, currentPath }: HeaderProps) {
  const navItems = getNavItems(locale, currentPath);
  const brandHref = currentPath === "/" ? "#top" : "/";

  return (
    <header className="site-header">
      <a className="brand" href={brandHref} aria-label="JSA Forge Startseite">
        <img src="/assets/jsa-forge-wordmark-cropped.png" alt="JSA Forge Logo" />
      </a>

      <div className="header-actions">
        <nav className="site-nav" aria-label="Hauptnavigation">
          {navItems.map((item) => (
            <a
              key={item.label}
              className={item.active ? "is-active" : undefined}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer" : undefined}
              aria-current={item.active ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <LocaleSwitch locale={locale} onLocaleChange={onLocaleChange} />
      </div>
    </header>
  );
}

function SiteFooter({ locale, currentPath }: FooterProps) {
  const text = copy[locale].footer;
  const nav = copy[locale].nav;
  const currentYear = new Date().getFullYear();
  const projectsHref = currentPath === "/" ? "#projects" : "/#projects";

  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <div className="footer-brand-row">
          <img src="/assets/jsa-forge-wordmark-cropped.png" alt="JSA Forge Logo" />
        </div>
        <p>
          {locale === "de"
            ? "Unabhängige Schmiede für digitale Werkzeuge, Web-Apps und Software-Produkte mit klarem Zweck."
            : "Independent forge for digital tools, web apps and software products with a clear purpose."}
        </p>
        <small>
          &copy; {currentYear} {siteName} - {contactName}
        </small>
      </div>

      <div className="footer-links">
        <h3>{text.quickLinks}</h3>
        <a href={projectsHref}>{nav.projects}</a>
        <a href="/about">{nav.about}</a>
        <a href={discordLink} target="_blank" rel="noreferrer">
          {nav.discord}
        </a>
        <a href="/impressum">
          {locale === "de" ? "Impressum" : "Imprint"}
        </a>
        <a href="/datenschutz">
          {locale === "de" ? "Datenschutz" : "Privacy policy"}
        </a>
      </div>

      <div className="footer-cta">
        <h3>{text.talkTitle}</h3>
        <p>{text.talkText}</p>
        <div className="footer-action-row">
          <a
            className="button button-outline-light"
            href={discordLink}
            target="_blank"
            rel="noreferrer"
          >
            {text.discordButton}
          </a>
        </div>
      </div>
    </footer>
  );
}

function getContactErrorText(locale: Locale, errorCode: string) {
  const messages = {
    de: {
      CONFIG_LOAD_FAILED: "Die Kontaktformular-Konfiguration konnte nicht geladen werden.",
      FORM_NOT_READY: "Das Kontaktformular ist noch nicht einsatzbereit.",
      TURNSTILE_REQUIRED: "Bitte best\u00e4tige zuerst die Sicherheitspr\u00fcfung.",
      TURNSTILE_FAILED: "Die Sicherheitspr\u00fcfung ist fehlgeschlagen. Bitte versuche es erneut.",
      TURNSTILE_UNAVAILABLE:
        "Die Sicherheitspr\u00fcfung ist aktuell nicht verf\u00fcgbar. Bitte versuche es sp\u00e4ter erneut.",
      CONTACT_NOT_CONFIGURED:
        "Das Formular ist noch nicht vollst\u00e4ndig konfiguriert. Bitte nutze vorerst die E-Mail-Adresse.",
      SMTP_NOT_CONFIGURED:
        "Der Mailversand ist noch nicht eingerichtet. Bitte nutze vorerst die E-Mail-Adresse.",
      TURNSTILE_NOT_CONFIGURED:
        "Die Sicherheitspr\u00fcfung ist noch nicht eingerichtet. Bitte nutze vorerst die E-Mail-Adresse.",
      INVALID_INPUT:
        "Bitte pr\u00fcfe deine Eingaben. Alle Felder m\u00fcssen korrekt ausgef\u00fcllt sein.",
      MAIL_SEND_FAILED:
        "Die Nachricht konnte nicht gesendet werden. Bitte versuche es erneut oder schreibe direkt eine E-Mail.",
      NETWORK_ERROR:
        "Die Anfrage konnte nicht gesendet werden. Bitte pr\u00fcfe die Verbindung und versuche es erneut.",
      UNKNOWN:
        "Es ist ein unerwarteter Fehler aufgetreten. Bitte versuche es erneut oder schreibe direkt eine E-Mail.",
    },
    en: {
      CONFIG_LOAD_FAILED: "The contact form configuration could not be loaded.",
      FORM_NOT_READY: "The contact form is not ready yet.",
      TURNSTILE_REQUIRED: "Please complete the security check first.",
      TURNSTILE_FAILED: "The security check failed. Please try again.",
      TURNSTILE_UNAVAILABLE:
        "The security check is currently unavailable. Please try again later.",
      CONTACT_NOT_CONFIGURED:
        "The form is not fully configured yet. Please use the email address for now.",
      SMTP_NOT_CONFIGURED:
        "Mail delivery is not configured yet. Please use the email address for now.",
      TURNSTILE_NOT_CONFIGURED:
        "The security check is not configured yet. Please use the email address for now.",
      INVALID_INPUT: "Please review your input. All fields must be filled in correctly.",
      MAIL_SEND_FAILED:
        "The message could not be sent. Please try again or write an email directly.",
      NETWORK_ERROR:
        "The request could not be sent. Please check your connection and try again.",
      UNKNOWN:
        "An unexpected error occurred. Please try again or contact us directly by email.",
    },
  } as const;

  const localeMessages = messages[locale];
  return localeMessages[errorCode as keyof typeof localeMessages] ?? localeMessages.UNKNOWN;
}

function ContactSection({ locale, variant }: ContactSectionProps) {
  const text = copy[locale].contact;
  const sectionText = text[variant];
  const formRef = useRef<HTMLFormElement | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [turnstileToken, setTurnstileToken] = useState("");
  const [widgetVersion, setWidgetVersion] = useState(0);
  const [shouldLoadTurnstile, setShouldLoadTurnstile] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [config, setConfig] = useState<ContactConfigState>({
    status: "loading",
    configured: false,
    turnstileSiteKey: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/contact/config")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("CONFIG_LOAD_FAILED");
        }

        return response.json() as Promise<{
          configured: boolean;
          turnstileSiteKey: string | null;
        }>;
      })
      .then((result) => {
        if (cancelled) {
          return;
        }

        setConfig({
          status: "ready",
          configured: Boolean(result.configured),
          turnstileSiteKey:
            typeof result.turnstileSiteKey === "string" && result.turnstileSiteKey.trim().length > 0
              ? result.turnstileSiteKey
              : null,
        });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setConfig({
          status: "error",
          configured: false,
          turnstileSiteKey: null,
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const element = formRef.current;

    if (!element || shouldLoadTurnstile || typeof window === "undefined") {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setShouldLoadTurnstile(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadTurnstile(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "0px 0px 32px 0px",
        threshold: 0.2,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [shouldLoadTurnstile]);

  const isBackendReady = config.configured && Boolean(config.turnstileSiteKey);
  const isTurnstileReadyToMount =
    isBackendReady && Boolean(config.turnstileSiteKey) && shouldLoadTurnstile;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isBackendReady || !isTurnstileReadyToMount) {
      setSubmitState("error");
      setSubmitMessage(getContactErrorText(locale, "FORM_NOT_READY"));
      return;
    }

    if (!turnstileToken) {
      setSubmitState("error");
      setSubmitMessage(getContactErrorText(locale, "TURNSTILE_REQUIRED"));
      return;
    }

    setSubmitState("submitting");
    setSubmitMessage(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
          turnstileToken,
          website,
          startedAt,
          sourcePage: variant === "home" ? "Home" : "About",
          locale,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        success?: boolean;
      };

      if (!response.ok || !data.success) {
        const errorCode = typeof data.error === "string" ? data.error : "UNKNOWN";
        setSubmitState("error");
        setSubmitMessage(getContactErrorText(locale, errorCode));
        setTurnstileToken("");
        setWidgetVersion((currentValue) => currentValue + 1);
        return;
      }

      setSubmitState("success");
      setSubmitMessage(text.fields.success);
      setName("");
      setEmail("");
      setMessage("");
      setWebsite("");
      setTurnstileToken("");
      setStartedAt(Date.now());
      setWidgetVersion((currentValue) => currentValue + 1);
    } catch {
      setSubmitState("error");
      setSubmitMessage(getContactErrorText(locale, "NETWORK_ERROR"));
      setTurnstileToken("");
      setWidgetVersion((currentValue) => currentValue + 1);
    }
  };

  return (
    <section className="contact-panel" id="contact" aria-labelledby={`${variant}-contact-title`}>
      <div className="contact-layout">
        <div className="contact-copy">
          <p className="section-kicker">{sectionText.kicker}</p>
          <h2 id={`${variant}-contact-title`}>{sectionText.title}</h2>
          <p className="contact-description">{sectionText.description}</p>

          <div className="contact-info-list">
            <div className="contact-info-card">
              <span>{text[variant].detailsTitle}</span>
              <strong>{contactName}</strong>
            </div>

            <div className="contact-info-card">
              <span>{text.fields.email}</span>
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </div>

            <div className="contact-info-card">
              <span>Discord</span>
              <a href={discordLink} target="_blank" rel="noreferrer">
                {locale === "de" ? "Community öffnen" : "Open community"}
              </a>
            </div>

            <div className="contact-info-card">
              <span>{locale === "de" ? "Hinweis" : "Note"}</span>
              <p>{sectionText.note}</p>
            </div>
          </div>
        </div>

        <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
          <input
            className="contact-honeypot"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />

          <label className="form-field">
            <span>{text.fields.name}</span>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={text.fields.namePlaceholder}
              required
            />
          </label>

          <label className="form-field">
            <span>{text.fields.email}</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={text.fields.emailPlaceholder}
              required
            />
          </label>

          <label className="form-field">
            <span>{text.fields.message}</span>
            <textarea
              name="message"
              rows={6}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={text.fields.messagePlaceholder}
              required
            />
          </label>

          {isTurnstileReadyToMount ? (
            <TurnstileWidget
              key={`${variant}-${locale}-${widgetVersion}`}
              siteKey={config.turnstileSiteKey!}
              language={locale}
              onTokenChange={setTurnstileToken}
              onLoadError={() => {
                setSubmitState("error");
                setSubmitMessage(getContactErrorText(locale, "TURNSTILE_UNAVAILABLE"));
              }}
            />
          ) : isBackendReady && config.turnstileSiteKey ? (
            <div className="turnstile-pending">
              <strong>
                {locale === "de"
                  ? "Sicherheitsprüfung wird erst beim Scrollen geladen"
                  : "Security check loads when you scroll here"}
              </strong>
              <p>
                {locale === "de"
                  ? "Cloudflare Turnstile wird erst initialisiert, sobald dieser Formularbereich sichtbar ist."
                  : "Cloudflare Turnstile is only initialized once this form area becomes visible."}
              </p>
            </div>
          ) : (
            <div className="contact-fallback">
              <strong>
                {config.status === "loading"
                  ? locale === "de"
                    ? "Kontaktformular wird vorbereitet"
                    : "Contact form is being prepared"
                  : locale === "de"
                    ? "Kontaktformular noch nicht konfiguriert"
                    : "Contact form not configured yet"}
              </strong>
              <p>
                {config.status === "error"
                  ? getContactErrorText(locale, "CONFIG_LOAD_FAILED")
                  : locale === "de"
                    ? "Hinterlege SMTP- und Turnstile-Variablen in der Umgebung, um das Formular wie im Sabre Command Trainer aktiv zu schalten."
                    : "Add SMTP and Turnstile environment variables to enable the form just like in Sabre Command Trainer."}
              </p>
            </div>
          )}

          <div className="contact-form-actions">
            <button
              className="button button-primary"
              type="submit"
              disabled={!isTurnstileReadyToMount || submitState === "submitting"}
            >
              {submitState === "submitting"
                ? locale === "de"
                  ? "Wird gesendet..."
                  : "Sending..."
                : text.fields.submit}
            </button>
            <p className="contact-form-note">{sectionText.note}</p>
          </div>

          {submitMessage ? (
            <p className={`form-status ${submitState === "error" ? "is-error" : "is-success"}`}>
              {submitMessage}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}

function HomePage({
  locale,
  onLocaleChange,
  currentPath,
}: HeaderProps) {
  const text = copy[locale];
  const spotlightPreviewSrc =
    locale === "de"
      ? "/assets/sabre-command-trainer-home-de.png"
      : "/assets/sabre-command-trainer-home-en.png";
  const spotlightPreviewAlt =
    locale === "de" ? `${text.spotlight.title} Vorschau` : `${text.spotlight.title} preview`;

  return (
    <>
      <section className="hero-section" id="top">
        <div className="hero-inner">
          <SiteHeader
            locale={locale}
            onLocaleChange={onLocaleChange}
            currentPath={currentPath}
          />

          <div className="hero-content">
            <div className="hero-copy">
              <p className="hero-kicker">{text.hero.kicker}</p>
              <h1>
                {text.hero.lines.map((line) => (
                  <span key={line} className={line === text.hero.lines[2] ? "accent" : undefined}>
                    {line}
                  </span>
                ))}
              </h1>

              <p>{text.hero.description}</p>

              <div className="hero-points" aria-label={text.hero.kicker}>
                {text.hero.points.map((point) => (
                  <span className="hero-point" key={point}>
                    {point}
                  </span>
                ))}
              </div>

              <div className="hero-actions">
                <a className="button button-primary" href="#projects">
                  {text.hero.primary}
                </a>
                <a className="button button-secondary" href="#contact">
                  {text.hero.secondary}
                </a>
              </div>
            </div>

            <div className="hero-mark">
              <div className="hero-brief">
                <img src="/assets/jsa-forge-wordmark-cropped.png" alt="" aria-hidden="true" />
                <p className="hero-brief-kicker">{text.hero.cardKicker}</p>
                <h2>{text.hero.cardTitle}</h2>
                <ul className="hero-brief-list">
                  {text.hero.cardItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <a className="hero-scroll" href="#projects" aria-label={text.hero.scroll}>
            <span>{text.hero.scroll}</span>
            <ChevronDown />
          </a>
        </div>
      </section>

      <main className="page-grid">
        <section className="project-spotlight" aria-labelledby="spotlight-title">
          <div className="spotlight-copy">
            <p className="section-kicker">{text.spotlight.kicker}</p>
            <h2 id="spotlight-title">{text.spotlight.title}</h2>
            <p className="spotlight-description">{text.spotlight.description}</p>

            <ul className="spotlight-benefits">
              {text.spotlight.benefits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="spotlight-actions">
              <a
                className="button button-primary"
                href="https://sabrecommandtrainer.com"
                target="_blank"
                rel="noreferrer"
              >
                {text.spotlight.primary}
              </a>
              <a
                className="button button-light"
                href="https://github.com/JanoschA/sabrecommandtrainer"
                target="_blank"
                rel="noreferrer"
              >
                {text.spotlight.secondary}
              </a>
            </div>
          </div>

          <div className="spotlight-visual">
            <div className="spotlight-device-stage">
              <div className="spotlight-preview-card">
                <img
                  className="spotlight-preview-image"
                  src={spotlightPreviewSrc}
                  alt={spotlightPreviewAlt}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="projects-panel" id="projects" aria-labelledby="projects-title">
          <div className="panel-head">
            <div>
              <p className="section-kicker">{text.projects.kicker}</p>
              <h2 id="projects-title">{text.projects.title}</h2>
            </div>
            <a className="ghost-link" href="#contact">
              {text.projects.inquiry}
            </a>
          </div>

          <div className="project-card-grid">
            {projectCards.map((project) => (
              <a
                className="project-card"
                key={project.title[locale]}
                href={project.href}
                target={project.external ? "_blank" : undefined}
                rel={project.external ? "noreferrer" : undefined}
              >
                <div className="project-card-image">
                  <img
                    className={project.imageFit === "contain" ? "is-contain" : undefined}
                    src={project.image[locale]}
                    alt={project.title[locale]}
                  />
                </div>
                <div className="project-card-body">
                  <div className="project-card-meta">
                    <span>{project.badge[locale]}</span>
                    <span>{project.status[locale]}</span>
                  </div>
                  <h3>{project.title[locale]}</h3>
                  <p>{project.subtitle[locale]}</p>
                </div>
                <ExternalArrow />
              </a>
            ))}
          </div>
        </section>

        <section className="focus-panel" aria-labelledby="focus-title">
          <div className="panel-head panel-head-stacked">
            <div>
              <p className="section-kicker">{text.focus.kicker}</p>
              <h2 id="focus-title">{text.focus.title}</h2>
            </div>
          </div>

          <div className="focus-grid">
            {focusAreas.map((area) => (
              <article className="focus-card" key={area.id}>
                <span className="focus-index">{area.id}</span>
                <h3>{area.title[locale]}</h3>
                <p>{area.description[locale]}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-panel" aria-labelledby="about-preview-title">
          <div className="panel-head panel-head-stacked">
            <div>
              <p className="section-kicker">{text.aboutPreview.kicker}</p>
              <h2 id="about-preview-title">{text.aboutPreview.title}</h2>
            </div>
          </div>

          <div className="about-layout">
            <div className="portrait-card">
              <img src="/assets/janosch-avatar.jpg" alt={contactName} />
            </div>

            <div className="about-copy">
              {text.aboutPreview.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}

              <a className="button button-outline" href="/about">
                {text.aboutPreview.cta}
              </a>
            </div>
          </div>
        </section>

        <section className="process-panel" aria-labelledby="process-title">
          <div className="panel-head panel-head-stacked">
            <div>
              <p className="section-kicker">{text.process.kicker}</p>
              <h2 id="process-title">{text.process.title}</h2>
            </div>
          </div>

          <div className="process-grid">
            {processSteps.map((step) => (
              <article className="process-step" key={step.step}>
                <div className="process-badge">{step.step}</div>
                <h3>{step.title[locale]}</h3>
                <p>{step.description[locale]}</p>
              </article>
            ))}
          </div>
        </section>

        <ContactSection locale={locale} variant="home" />
      </main>

      <SiteFooter locale={locale} currentPath={currentPath} />
    </>
  );
}

function AboutPage({
  locale,
  onLocaleChange,
  currentPath,
}: HeaderProps) {
  const text = copy[locale];

  return (
    <>
      <main className="subpage-shell">
        <SiteHeader
          locale={locale}
          onLocaleChange={onLocaleChange}
          currentPath={currentPath}
        />

        <section className="profile-hero">
          <div className="profile-hero-grid">
            <div className="profile-portrait-wrap">
              <img
                className="profile-portrait"
                src="/assets/janosch-avatar.jpg"
                alt={contactName}
              />
            </div>

            <div className="profile-copy">
              <p className="section-kicker">{text.aboutPage.kicker}</p>
              <h1>{text.aboutPage.title}</h1>
              <p className="profile-subtitle">{text.aboutPage.subtitle}</p>
              <p className="profile-intro">{text.aboutPage.intro}</p>

              <div className="profile-highlight-list">
                {text.aboutPage.highlights.map((highlight) => (
                  <span key={highlight}>{highlight}</span>
                ))}
              </div>

              <div className="hero-actions">
                <a className="button button-primary" href="#contact">
                  {text.aboutPage.primary}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="skills-panel" aria-labelledby="skills-title">
          <div className="panel-head panel-head-stacked">
            <div>
              <p className="section-kicker">{text.aboutPage.skills.kicker}</p>
              <h2 id="skills-title">{text.aboutPage.skills.title}</h2>
            </div>
          </div>

          <div className="skill-list">
            {skillCards.map((skill) => (
              <article className="skill-list-item" key={skill.title[locale]}>
                <h3 className="skill-list-title">{skill.title[locale]}</h3>
                <p>{skill.description[locale]}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="profile-projects-panel" aria-labelledby="profile-projects-title">
          <div className="panel-head panel-head-stacked">
            <div>
              <p className="section-kicker">{text.aboutPage.projects.kicker}</p>
              <h2 id="profile-projects-title">{text.aboutPage.projects.title}</h2>
            </div>
          </div>

          <div className="project-experience-list">
            {profileProjects.map((project) => (
              <article className="project-experience-item" key={`${project.period[locale]}-${project.title[locale]}`}>
                <div className="project-experience-meta">
                  <span className="timeline-period">{project.period[locale]}</span>
                  <span className="project-client">{project.client[locale]}</span>
                </div>

                <div className="project-experience-body">
                  <h3>{project.title[locale]}</h3>
                  <p className="project-role">{project.role[locale]}</p>
                  <p>{project.description[locale]}</p>
                  <p className="project-stack">
                    <strong>{locale === "de" ? "Technologien:" : "Technologies:"}</strong>{" "}
                    {project.stack[locale]}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <p className="panel-note">{text.aboutPage.projects.note}</p>
        </section>

        <section className="timeline-panel" aria-labelledby="timeline-title">
          <div className="panel-head panel-head-stacked">
            <div>
              <p className="section-kicker">{text.aboutPage.cv.kicker}</p>
              <h2 id="timeline-title">{text.aboutPage.cv.title}</h2>
            </div>
          </div>

          <div className="timeline-list">
            {timelineEntries.map((entry) => (
              <article className="timeline-item" key={entry.title[locale]}>
                <span className="timeline-period">{entry.period[locale]}</span>
                <div>
                  <h3>{entry.title[locale]}</h3>
                  <p>{entry.description[locale]}</p>
                </div>
              </article>
            ))}
          </div>

          <p className="panel-note">{text.aboutPage.cv.note}</p>
        </section>

        <ContactSection locale={locale} variant="about" />
      </main>

      <SiteFooter locale={locale} currentPath={currentPath} />
    </>
  );
}

function LegalLayout({
  locale,
  onLocaleChange,
  currentPath,
  title,
  children,
}: HeaderProps & { title: string; children: ReactNode }) {
  return (
    <>
      <main className="legal-page">
        <div className="legal-shell">
          <SiteHeader
            locale={locale}
            onLocaleChange={onLocaleChange}
            currentPath={currentPath}
          />

          <section className="legal-card">
            <p className="section-kicker">{copy[locale].legal.kicker}</p>
            <h1>{title}</h1>
            <div className="legal-content">{children}</div>
          </section>
        </div>
      </main>

      <SiteFooter locale={locale} currentPath={currentPath} />
    </>
  );
}

function ImprintPage(props: HeaderProps) {
  const { locale } = props;
  const text = copy[locale].legal.imprint;

  return (
    <LegalLayout {...props} title={text.title}>
      <section className="legal-section">
        <h2>{text.section1}</h2>
        <address>
          <strong>{contactName}</strong>
          <br />
          {contactStreet}
          <br />
          {contactCity}
          <br />
          {locale === "de" ? contactCountry : "Germany"}
        </address>
      </section>

      <section className="legal-section">
        <h2>{text.section2}</h2>
        <p>
          E-Mail: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        </p>
      </section>

      <section className="legal-section">
        <h2>{text.section3}</h2>
        <p>
          {contactName}, {contactStreet}, {contactCity}
        </p>
      </section>

      <section className="legal-section">
        <h2>{text.section4}</h2>
        <p>
          {locale === "de"
            ? "Als Diensteanbieter bin ich nach den allgemeinen Gesetzen für eigene Inhalte auf diesen Seiten verantwortlich. Für fremde Inhalte gelten die gesetzlichen Haftungsbeschränkungen, insbesondere nach dem Digitale-Dienste-Gesetz (DDG) und der Verordnung (EU) 2022/2065."
            : "As a service provider, I am responsible for my own content on these pages under the general laws. Statutory limitations of liability apply to third-party content, in particular under the German Digital Services Act (DDG) and Regulation (EU) 2022/2065."}
        </p>
        <p>
          {locale === "de"
            ? "Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen werden diese Inhalte umgehend entfernt."
            : "Obligations to remove or block the use of information under general law remain unaffected. Liability in this regard is only possible from the point in time at which a concrete infringement becomes known. Upon becoming aware of such infringements, the relevant content will be removed without delay."}
        </p>
      </section>

      <section className="legal-section">
        <h2>{text.section5}</h2>
        <p>
          {locale === "de"
            ? "Dieses Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Deshalb kann ich für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar."
            : "This website contains links to external third-party websites whose content I cannot control. Therefore I cannot accept any liability for such third-party content. The respective provider or operator of the linked pages is always responsible for their content. The linked pages were checked for possible legal violations at the time of linking. No unlawful content was apparent at that time."}
        </p>
      </section>

      <section className="legal-section">
        <h2>{text.section6}</h2>
        <p>
          {locale === "de"
            ? "Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors beziehungsweise Erstellers."
            : "The content and works created by the site operator on these pages are subject to German copyright law. Reproduction, editing, distribution and any kind of use outside the limits of copyright law require the written consent of the respective author or creator."}
        </p>
      </section>

      <p className="legal-updated">{text.updated}</p>
    </LegalLayout>
  );
}

function PrivacyPage(props: HeaderProps) {
  const { locale } = props;
  const text = copy[locale].legal.privacy;

  return (
    <LegalLayout {...props} title={text.title}>
      <section className="legal-section">
        <h2>{text.section1}</h2>
        <p>
          {locale === "de"
            ? "Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:"
            : "The controller within the meaning of the General Data Protection Regulation (GDPR) is:"}
        </p>
        <address>
          <strong>{contactName}</strong>
          <br />
          {contactStreet}
          <br />
          {contactCity}
          <br />
          {locale === "de" ? contactCountry : "Germany"}
          <br />
          E-Mail: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        </address>
      </section>

      <section className="legal-section">
        <h2>{text.section2}</h2>
        <p>
          {locale === "de"
            ? "Ich nehme den Schutz deiner personenbezogenen Daten sehr ernst. Diese Datenschutzerklärung informiert über Art, Umfang und Zweck der Verarbeitung personenbezogener Daten auf dieser Website."
            : "I take the protection of your personal data very seriously. This privacy policy explains the nature, scope and purpose of the processing of personal data on this website."}
        </p>
        <p>
          {locale === "de"
            ? "Auf dieser Website werden derzeit keine eigenen Cookies für Tracking- oder Analysezwecke eingesetzt und keine Web-Analytics-Dienste verwendet."
            : "This website currently does not use first-party cookies for tracking or analytics purposes and no web analytics services are active."}
        </p>
      </section>

      <section className="legal-section">
        <h2>{text.section3}</h2>
        <p>
          {locale === "de"
            ? "Beim Aufruf dieser Website können technisch erforderliche Daten durch den Webserver verarbeitet werden. Dazu gehören insbesondere die aufgerufene Seite, Datum und Uhrzeit des Zugriffs, Browser- und Betriebssysteminformationen, Referrer-URL sowie die IP-Adresse."
            : "When this website is accessed, technically required data may be processed by the web server. This may include the requested page, date and time of access, browser and operating system information, referrer URL and IP address."}
        </p>
        <p>
          {locale === "de"
            ? "Die Verarbeitung erfolgt zur sicheren Bereitstellung der Website, zur Stabilität des Betriebs und zur Abwehr von Missbrauch. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO."
            : "Processing takes place for the secure provision of the website, the stability of operation and the prevention of abuse. The legal basis is Art. 6(1)(f) GDPR."}
        </p>
      </section>

      <section className="legal-section">
        <h2>{text.section4}</h2>
        <p>
          {locale === "de"
            ? "Wenn du das Kontaktformular auf dieser Website nutzt, werden dein Name, deine E-Mail-Adresse, deine Nachricht sowie technische Verbindungsdaten für die Sicherheitsprüfung verarbeitet. Die Anfrage wird serverseitig entgegengenommen und per E-Mail an mich weitergeleitet."
            : "If you use the contact form on this website, your name, email address, message and technical connection data for the security check are processed. The request is received server-side and forwarded to me by email."}
        </p>
        <p>
          {locale === "de"
            ? "Zur Absicherung des Formulars wird Cloudflare Turnstile eingesetzt. Dabei wird das von Turnstile erzeugte Token serverseitig validiert. Die Verarbeitung erfolgt zur Bearbeitung deiner Anfrage sowie zur Missbrauchsabwehr. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO beziehungsweise Art. 6 Abs. 1 lit. f DSGVO."
            : "Cloudflare Turnstile is used to protect the form. The token generated by Turnstile is validated server-side. Processing takes place for handling your enquiry and preventing abuse. The legal basis is Art. 6(1)(b) GDPR and Art. 6(1)(f) GDPR respectively."}
        </p>
      </section>

      <section className="legal-section">
        <h2>{text.section5}</h2>
        <p>
          {locale === "de"
            ? "Diese Website verlinkt auf externe Angebote, insbesondere auf Discord, GitHub und das Projekt Sabre Command Trainer. Beim Anklicken solcher Links verlassen Besucher diese Website. Für die Datenverarbeitung auf den verlinkten Angeboten sind ausschließlich die jeweiligen Betreiber verantwortlich."
            : "This website links to external services, especially Discord, GitHub and the Sabre Command Trainer project. By clicking such links, visitors leave this website. The respective operators are solely responsible for data processing on those services."}
        </p>
      </section>

      <section className="legal-section">
        <h2>{text.section6}</h2>
        <p>
          {locale === "de"
            ? "Dir stehen nach der DSGVO insbesondere folgende Rechte zu:"
            : "Under the GDPR you have, in particular, the following rights:"}
        </p>
        <ul>
          <li>
            {locale === "de"
              ? "Auskunft über die von dir verarbeiteten personenbezogenen Daten"
              : "Access to the personal data processed about you"}
          </li>
          <li>
            {locale === "de"
              ? "Berichtigung unrichtiger Daten"
              : "Rectification of inaccurate data"}
          </li>
          <li>{locale === "de" ? "Löschung deiner Daten" : "Erasure of your data"}</li>
          <li>
            {locale === "de"
              ? "Einschränkung der Verarbeitung"
              : "Restriction of processing"}
          </li>
          <li>
            {locale === "de"
              ? "Widerspruch gegen die Verarbeitung"
              : "Objection to processing"}
          </li>
          <li>
            {locale === "de"
              ? "Datenübertragbarkeit"
              : "Data portability"}
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>{text.section7}</h2>
        <p>
          {locale === "de"
            ? "Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung deiner personenbezogenen Daten zu beschweren. Weitere Informationen zu zuständigen Datenschutzbehörden in Deutschland findest du beim Bundesbeauftragten für den Datenschutz und die Informationsfreiheit."
            : "You have the right to lodge a complaint with a data protection supervisory authority regarding the processing of your personal data. Further information on the competent authorities in Germany can be found at the Federal Commissioner for Data Protection and Freedom of Information."}
        </p>
        <p>
          <a href={bfdiLink} target="_blank" rel="noreferrer">
            www.bfdi.bund.de
          </a>
        </p>
      </section>

      <section className="legal-section">
        <h2>{text.section8}</h2>
        <p>
          {locale === "de"
            ? "Diese Datenschutzerklärung ist aktuell gültig und hat den Stand April 2026. Durch die Weiterentwicklung der Website oder aufgrund geänderter gesetzlicher oder behördlicher Vorgaben kann es notwendig werden, diese Datenschutzerklärung anzupassen."
            : "This privacy policy is currently valid and was last updated in April 2026. It may become necessary to change this privacy policy due to further development of the website or changes in legal or regulatory requirements."}
        </p>
      </section>

      <p className="legal-updated">{text.updated}</p>
    </LegalLayout>
  );
}

function App() {
  const currentPath = normalizeRoute(getCurrentPath());
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    window.localStorage.setItem(localeStorageKey, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const titles = copy[locale].titles;
    const pageTitle =
      currentPath === "/about"
        ? titles.about
        : currentPath === "/impressum"
          ? titles.imprint
          : currentPath === "/datenschutz"
            ? titles.privacy
            : titles.home;

    document.title = pageTitle;
  }, [currentPath, locale]);

  return (
    <div className="app-shell">
      {currentPath === "/about" ? (
        <AboutPage
          locale={locale}
          onLocaleChange={setLocale}
          currentPath={currentPath}
        />
      ) : currentPath === "/impressum" ? (
        <ImprintPage
          locale={locale}
          onLocaleChange={setLocale}
          currentPath={currentPath}
        />
      ) : currentPath === "/datenschutz" ? (
        <PrivacyPage
          locale={locale}
          onLocaleChange={setLocale}
          currentPath={currentPath}
        />
      ) : (
        <HomePage
          locale={locale}
          onLocaleChange={setLocale}
          currentPath={currentPath}
        />
      )}
    </div>
  );
}

export default App;


