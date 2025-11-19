import * as v from 'valibot';

// Base schemas for individual param values
const sandwichIdValueSchema = v.pipe(v.string(), v.nonEmpty());
const childIdValueSchema = v.pipe(v.string(), v.nonEmpty(), v.regex(/^[a-zA-Z0-9-_]+$/, 'Invalid child ID format'));
const parentIdValueSchema = v.pipe(v.string(), v.nonEmpty(), v.regex(/^[a-zA-Z0-9-_]+$/, 'Invalid parent ID format'));

// Schemas for route params objects (validateParams receives an object)
// Schema for routes with $sandwichId param
export const sandwichIdSchema = v.object({
  sandwichId: sandwichIdValueSchema,
});

// Schema for routes with $childId param
export const childIdSchema = v.object({
  childId: childIdValueSchema,
});

// Schema for routes with $parentId param
export const parentIdSchema = v.object({
  parentId: parentIdValueSchema,
});

// Schema for routes with both childId and sandwichId (nested route)
export const childSandwichParamsSchema = v.object({
  childId: childIdValueSchema,
  sandwichId: sandwichIdValueSchema,
});
