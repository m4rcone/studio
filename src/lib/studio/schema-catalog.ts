import type { z } from "zod";
import {
  contactFieldSchema,
  featuresItemSchema,
  galleryProjectSchema,
  philosophyValueSchema,
  portfolioPreviewItemSchema,
  processStepSchema,
  serviceItemSchema,
  statItemSchema,
  teamMemberSchema,
  testimonialItemSchema,
  timelineEventSchema,
} from "./schemas";

interface CollectionSchemaHint {
  path: string;
  description: string;
  minItems: number;
  itemSchema: z.ZodType;
}

const SCALAR_PATH_HINTS = [
  "site.config.json → contact.phone is a single string field, not an array",
  "site.config.json → contact.whatsapp is a single string field, not an array",
  "site.config.json → contact.email is a single string field",
];

const COLLECTION_HINTS: CollectionSchemaHint[] = [
  {
    path: "pages/* → sections[id=office-stats].data.items",
    description: "Stats cards",
    minItems: 1,
    itemSchema: statItemSchema,
  },
  {
    path: "pages/* → sections[id=featured-portfolio].data.items",
    description: "Portfolio preview items",
    minItems: 1,
    itemSchema: portfolioPreviewItemSchema,
  },
  {
    path: "pages/* → sections[id=client-testimonials].data.items",
    description: "Testimonials",
    minItems: 1,
    itemSchema: testimonialItemSchema,
  },
  {
    path: "pages/* → sections[id=founding-partners].data.members",
    description: "Team members",
    minItems: 1,
    itemSchema: teamMemberSchema,
  },
  {
    path: "pages/* → sections[id=studio-history].data.events",
    description: "Timeline events",
    minItems: 1,
    itemSchema: timelineEventSchema,
  },
  {
    path: "pages/* → sections[id=core-values].data.values",
    description: "Philosophy values",
    minItems: 1,
    itemSchema: philosophyValueSchema,
  },
  {
    path: "pages/* → sections[id=services-list].data.items",
    description: "Services list items",
    minItems: 1,
    itemSchema: serviceItemSchema,
  },
  {
    path: "pages/* → sections[id=process-steps].data.steps",
    description: "Process steps",
    minItems: 1,
    itemSchema: processStepSchema,
  },
  {
    path: "pages/* → sections[id=projects-gallery].data.projects",
    description: "Portfolio gallery projects",
    minItems: 1,
    itemSchema: galleryProjectSchema,
  },
  {
    path: "pages/* → sections[id=contact-section].data.fields",
    description: "Contact form fields",
    minItems: 1,
    itemSchema: contactFieldSchema,
  },
  {
    path: "pages/* → sections[id=features].data.items",
    description: "Feature cards",
    minItems: 1,
    itemSchema: featuresItemSchema,
  },
];

export function buildSchemaCatalogPrompt(): string {
  const scalarLines = SCALAR_PATH_HINTS.map((hint) => `- ${hint}`).join("\n");
  const collectionLines = COLLECTION_HINTS.map((hint) =>
    formatCollectionHint(hint),
  ).join("\n");

  return [
    "## Schema Catalog",
    "",
    "Use this catalog before insert_item/remove_item proposals.",
    "Only use insert_item on paths that are real arrays.",
    "If a field is listed as a single string, explain that it cannot accept a second item without a schema/code change.",
    "If a collection has minItems: 1, do not propose removing its last remaining item.",
    "",
    "### Scalar fields (no insert_item)",
    scalarLines,
    "",
    "### Collection item shapes",
    collectionLines,
  ].join("\n");
}

function formatCollectionHint(hint: CollectionSchemaHint): string {
  return [
    `- ${hint.path} (${hint.description}, minItems: ${hint.minItems})`,
    `  Item shape: ${describeSchemaShape(hint.itemSchema)}`,
  ].join("\n");
}

function describeSchemaShape(schema: z.ZodType): string {
  const unwrapped = unwrapSchema(schema);

  if (isZodObject(unwrapped)) {
    const shape = getObjectShape(unwrapped);
    const entries = Object.entries(shape).map(([key, value]) => {
      const field = describeField(value);
      return field.optional
        ? `${key}?: ${field.description}`
        : `${key}: ${field.description}`;
    });

    return `{ ${entries.join("; ")} }`;
  }

  return describeField(unwrapped).description;
}

function describeField(schema: z.ZodType): {
  description: string;
  optional: boolean;
} {
  let current = schema;
  let optional = false;

  while (true) {
    const typeName = getTypeName(current);
    if (typeName === "ZodOptional" || typeName === "ZodDefault") {
      optional = true;
      current = unwrapInner(current);
      continue;
    }
    if (typeName === "ZodNullable") {
      const inner = describeField(unwrapInner(current));
      return {
        description: `${inner.description} | null`,
        optional: optional || inner.optional,
      };
    }
    break;
  }

  const unwrapped = unwrapSchema(current);

  if (isZodObject(unwrapped)) {
    return {
      description: describeSchemaShape(unwrapped),
      optional,
    };
  }

  if (getTypeName(unwrapped) === "ZodArray") {
    const element = unwrapInner(unwrapped);
    return {
      description: `Array<${describeSchemaShape(element)}>`,
      optional,
    };
  }

  return {
    description: primitiveTypeName(unwrapped),
    optional,
  };
}

function primitiveTypeName(schema: z.ZodType): string {
  switch (getTypeName(schema)) {
    case "ZodString":
      return "string";
    case "ZodNumber":
      return "number";
    case "ZodBoolean":
      return "boolean";
    default:
      return "unknown";
  }
}

function unwrapSchema(schema: z.ZodType): z.ZodType {
  let current = schema;

  while (true) {
    const typeName = getTypeName(current);
    if (
      typeName === "ZodOptional" ||
      typeName === "ZodDefault" ||
      typeName === "ZodNullable"
    ) {
      current = unwrapInner(current);
      continue;
    }
    return current;
  }
}

function unwrapInner(schema: z.ZodType): z.ZodType {
  const def = getDef(schema) as { innerType?: z.ZodType; type?: z.ZodType };
  return def.innerType ?? def.type ?? schema;
}

function getObjectShape(schema: z.ZodType): Record<string, z.ZodType> {
  const def = getDef(schema) as {
    shape?: Record<string, z.ZodType> | (() => Record<string, z.ZodType>);
  };
  return typeof def.shape === "function" ? def.shape() : (def.shape ?? {});
}

function isZodObject(schema: z.ZodType): boolean {
  return getTypeName(schema) === "ZodObject";
}

function getTypeName(schema: z.ZodType): string {
  const def = getDef(schema) as { typeName?: string };
  return def.typeName ?? "";
}

function getDef(schema: z.ZodType): unknown {
  return (schema as { _def?: unknown })._def;
}
