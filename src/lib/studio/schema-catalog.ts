import type { z } from "zod";
import { SECTION_COLLECTION_HINTS } from "@/lib/section-registry";

const SCALAR_PATH_HINTS = [
  "site.config.json → contact.phone is a single string field, not an array",
  "site.config.json → contact.whatsapp is a single string field, not an array",
  "site.config.json → contact.email is a single string field",
];

export function buildSchemaCatalogPrompt(): string {
  const scalarLines = SCALAR_PATH_HINTS.map((hint) => `- ${hint}`).join("\n");
  const collectionLines = SECTION_COLLECTION_HINTS.map((hint) =>
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
    "Use the real section id from the page JSON when building an operation path.",
    collectionLines,
  ].join("\n");
}

function formatCollectionHint(hint: {
  sectionType: string;
  field: string;
  description: string;
  minItems: number;
  itemSchema: z.ZodType;
}): string {
  return [
    `- section type "${hint.sectionType}" → data.${hint.field} (${hint.description}, minItems: ${hint.minItems})`,
    `  Path pattern: sections[id=<actual-id>].data.${hint.field}`,
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
