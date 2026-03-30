import Joi from "joi";
import { UNIT_STATUSES } from "../constants/unitConstants";

// ── Category schemas ─────────────────────────────────────────────────────────

export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required(),
  description: Joi.string().max(1000).optional(),
  size: Joi.number().min(1).optional(),
  capacity: Joi.object({
    adults: Joi.number().integer().min(1).required(),
    children: Joi.number().integer().min(0).default(0),
  }).required(),
  basePrice: Joi.object({
    amount: Joi.number().min(0).required(),
    currency: Joi.string().length(3).uppercase().default("USD"),
  }).required(),
  photos: Joi.array().items(Joi.string()).default([]),
  amenities: Joi.array().items(Joi.string()).default([]),
  customProperties: Joi.object().unknown(true).optional(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().optional(),
  description: Joi.string().max(1000).optional(),
  size: Joi.number().min(1).optional(),
  capacity: Joi.object({
    adults: Joi.number().integer().min(1).optional(),
    children: Joi.number().integer().min(0).optional(),
  }).optional(),
  basePrice: Joi.object({
    amount: Joi.number().min(0).optional(),
    currency: Joi.string().length(3).uppercase().optional(),
  }).optional(),
  photos: Joi.array().items(Joi.string()).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  customProperties: Joi.object().unknown(true).optional(),
}).min(1);

// ── Unit schemas ─────────────────────────────────────────────────────────────

export const createUnitSchema = Joi.object({
  categoryId: Joi.string().required(),
  name: Joi.string().min(1).max(100).trim().required(),
  code: Joi.string().min(1).max(20).trim().required(),
  floor: Joi.string().max(20).optional(),
  description: Joi.string().max(1000).optional(),
  size: Joi.number().min(1).optional(),
  capacity: Joi.object({
    adults: Joi.number().integer().min(1).required(),
    children: Joi.number().integer().min(0).default(0),
  }).required(),
  photos: Joi.array().items(Joi.string()).default([]),
  customProperties: Joi.object().unknown(true).optional(),
});

export const updateUnitSchema = Joi.object({
  categoryId: Joi.string().optional(),
  name: Joi.string().min(1).max(100).trim().optional(),
  code: Joi.string().min(1).max(20).trim().optional(),
  floor: Joi.string().max(20).optional(),
  description: Joi.string().max(1000).optional(),
  size: Joi.number().min(1).optional(),
  capacity: Joi.object({
    adults: Joi.number().integer().min(1).optional(),
    children: Joi.number().integer().min(0).optional(),
  }).optional(),
  photos: Joi.array().items(Joi.string()).optional(),
  customProperties: Joi.object().unknown(true).optional(),
}).min(1);

export const changeStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...UNIT_STATUSES)
    .required(),
  notes: Joi.string().trim().optional(),
});

// ── Bulk create ──────────────────────────────────────────────────────────────

export const bulkCreateUnitsSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(100).required(),
  floor: Joi.string().max(20).optional(),
  codePrefix: Joi.string().max(20).required(),
  codeStart: Joi.number().integer().min(1).required(),
  capacity: Joi.object({
    adults: Joi.number().integer().min(1).required(),
    children: Joi.number().integer().min(0).default(0),
  }).required(),
  size: Joi.number().min(1).optional(),
  customProperties: Joi.object().unknown(true).optional(),
});
