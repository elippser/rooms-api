import crypto from "crypto";
import Unit, { IUnit } from "../models/Unit";
import UnitStateHistory from "../models/UnitStateHistory";
import Category from "../models/Category";
import { UnitStatus } from "../constants/unitConstants";

export interface CreateUnitDto {
  propertyId: string;
  companyId: string;
  categoryId: string;
  name: string;
  code: string;
  floor?: string;
  description?: string;
  capacity: { adults: number; children: number };
  size?: number;
  photos?: string[];
  customProperties?: Record<string, unknown>;
  createdByUserId: string;
}

export interface UpdateUnitDto {
  categoryId?: string;
  name?: string;
  code?: string;
  floor?: string;
  description?: string;
  capacity?: { adults: number; children: number };
  size?: number;
  photos?: string[];
  customProperties?: Record<string, unknown>;
}

export const createUnit = async (dto: CreateUnitDto): Promise<IUnit> => {
  const category = await Category.findOne({
    categoryId: dto.categoryId,
    propertyId: dto.propertyId,
    companyId: dto.companyId,
    isActive: true,
  });
  if (!category) {
    throw new Error(
      "La categoría no existe o no pertenece a esta propiedad"
    );
  }

  const codeUpper = dto.code.toUpperCase().trim();
  const existing = await Unit.findOne({
    propertyId: dto.propertyId,
    companyId: dto.companyId,
    code: codeUpper,
    isActive: true,
  });
  if (existing) {
    throw new Error(`Ya existe una unidad con el código "${codeUpper}" en esta propiedad`);
  }

  const unitId = `unit-${crypto.randomUUID()}`;

  const unit = await Unit.create({
    unitId,
    propertyId: dto.propertyId,
    companyId: dto.companyId,
    categoryId: dto.categoryId,
    name: dto.name,
    code: codeUpper,
    floor: dto.floor,
    description: dto.description,
    capacity: dto.capacity,
    size: dto.size,
    photos: dto.photos ?? [],
    customProperties: dto.customProperties ?? {},
    status: "available" as UnitStatus,
    isActive: true,
  });

  await Category.updateOne(
    { categoryId: dto.categoryId },
    { $inc: { unitCount: 1 } }
  );

  const historyId = `hist-${crypto.randomUUID()}`;
  await UnitStateHistory.create({
    historyId,
    unitId,
    propertyId: dto.propertyId,
    companyId: dto.companyId,
    previousStatus: "available" as UnitStatus,
    newStatus: "available" as UnitStatus,
    changedByUserId: dto.createdByUserId,
    changedAt: new Date(),
    notes: "Unidad creada",
  });

  return unit;
};

export interface UnitWithCategory {
  unitId: string;
  propertyId: string;
  companyId: string;
  categoryId: string;
  name: string;
  code: string;
  floor?: string;
  description?: string;
  size?: number;
  capacity: { adults: number; children: number };
  photos: string[];
  status: string;
  customProperties?: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: {
    categoryId: string;
    name: string;
    description?: string;
    size?: number;
    capacity: { adults: number; children: number };
    basePrice: { amount: number; currency: string };
    photos: string[];
    amenities: string[];
  };
}

export const listUnits = async (
  propertyId: string,
  companyId: string,
  options?: { code?: string; categoryId?: string; status?: string }
): Promise<UnitWithCategory[]> => {
  const filter: Record<string, unknown> = { propertyId, companyId, isActive: true };
  if (options?.code?.trim()) {
    filter.code = options.code.trim().toUpperCase();
  }
  if (options?.categoryId) {
    filter.categoryId = options.categoryId;
  }
  if (options?.status) {
    filter.status = options.status;
  }
  const units = await Unit.find(filter);
  const categoryIds = [...new Set(units.map((u) => u.categoryId))];
  const categories = await Category.find({
    categoryId: { $in: categoryIds },
    isActive: true,
  });
  const categoryMap = new Map(
    categories.map((c) => [
      c.categoryId,
      {
        categoryId: c.categoryId,
        name: c.name,
        description: c.description,
        size: c.size,
        capacity: c.capacity,
        basePrice: c.basePrice,
        photos: c.photos,
        amenities: c.amenities,
      },
    ])
  );

  return units.map((unit) => {
    const category = categoryMap.get(unit.categoryId);
    return {
      unitId: unit.unitId,
      propertyId: unit.propertyId,
      companyId: unit.companyId,
      categoryId: unit.categoryId,
      name: unit.name,
      code: unit.code,
      floor: unit.floor,
      description: unit.description,
      size: unit.size,
      capacity: unit.capacity,
      photos: unit.photos,
      status: unit.status,
      customProperties: unit.customProperties,
      isActive: unit.isActive,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
      category:
        category ??
        ({
          categoryId: unit.categoryId,
          name: "Unknown",
          capacity: { adults: 1, children: 0 },
          basePrice: { amount: 0, currency: "USD" },
          photos: [],
          amenities: [],
        } as UnitWithCategory["category"]),
    };
  });
};

export const getUnit = async (
  unitId: string,
  propertyId: string
): Promise<IUnit | null> => {
  return Unit.findOne({ unitId, propertyId, isActive: true });
};

export const updateUnit = async (
  unitId: string,
  propertyId: string,
  dto: UpdateUnitDto
): Promise<IUnit | null> => {
  const update: Record<string, unknown> = { ...dto };

  const currentUnit = dto.categoryId
    ? await Unit.findOne({ unitId, propertyId, isActive: true })
    : null;

  if (dto.categoryId != null) {
    const category = await Category.findOne({
      categoryId: dto.categoryId,
      propertyId,
      isActive: true,
    });
    if (!category) {
      throw new Error(
        "La categoría no existe o no pertenece a esta propiedad"
      );
    }
    if (currentUnit && currentUnit.categoryId !== dto.categoryId) {
      await Category.updateOne(
        { categoryId: currentUnit.categoryId },
        { $inc: { unitCount: -1 } }
      );
      await Category.updateOne(
        { categoryId: dto.categoryId },
        { $inc: { unitCount: 1 } }
      );
    }
  }

  if (dto.code != null) {
    const codeUpper = dto.code.toUpperCase().trim();
    const existing = await Unit.findOne({
      propertyId,
      code: codeUpper,
      isActive: true,
      unitId: { $ne: unitId },
    });
    if (existing) {
      throw new Error(`Ya existe una unidad con el código "${codeUpper}" en esta propiedad`);
    }
    update.code = codeUpper;
  }
  return Unit.findOneAndUpdate(
    { unitId, propertyId, isActive: true },
    { $set: update },
    { new: true }
  );
};

export interface BulkCreateUnitsDto {
  propertyId: string;
  companyId: string;
  categoryId: string;
  quantity: number;
  floor?: string;
  codePrefix: string;
  codeStart: number;
  capacity: { adults: number; children: number };
  size?: number;
  customProperties?: Record<string, unknown>;
  createdByUserId: string;
}

export interface BulkPreviewUnit {
  code: string;
  name: string;
  floor?: string;
  conflict: boolean;
}

export const previewBulkUnits = async (
  dto: BulkCreateUnitsDto
): Promise<{ units: BulkPreviewUnit[]; hasConflicts: boolean; conflictCount: number }> => {
  const category = await Category.findOne({
    categoryId: dto.categoryId,
    propertyId: dto.propertyId,
    companyId: dto.companyId,
    isActive: true,
  });
  if (!category) {
    throw new Error("La categoría no existe o no pertenece a esta propiedad");
  }

  const codes: string[] = [];
  for (let i = 0; i < dto.quantity; i++) {
    const num = dto.codeStart + i;
    codes.push(`${dto.codePrefix}${num}`);
  }

  const existing = await Unit.find({
    propertyId: dto.propertyId,
    companyId: dto.companyId,
    code: { $in: codes.map((c) => c.toUpperCase()) },
    isActive: true,
  });
  const existingCodes = new Set(existing.map((u) => u.code));

  const units: BulkPreviewUnit[] = codes.map((code) => {
    const codeUpper = code.toUpperCase();
    const conflict = existingCodes.has(codeUpper);
    return {
      code: codeUpper,
      name: codeUpper,
      floor: dto.floor,
      conflict,
    };
  });

  const conflictCount = units.filter((u) => u.conflict).length;
  return {
    units,
    hasConflicts: conflictCount > 0,
    conflictCount,
  };
};

export const bulkCreateUnits = async (
  dto: BulkCreateUnitsDto
): Promise<{ created: number; units: IUnit[] }> => {
  const category = await Category.findOne({
    categoryId: dto.categoryId,
    propertyId: dto.propertyId,
    companyId: dto.companyId,
    isActive: true,
  });
  if (!category) {
    throw new Error("La categoría no existe o no pertenece a esta propiedad");
  }

  const codes: string[] = [];
  for (let i = 0; i < dto.quantity; i++) {
    const num = dto.codeStart + i;
    codes.push(`${dto.codePrefix}${num}`.toUpperCase());
  }

  const existing = await Unit.find({
    propertyId: dto.propertyId,
    companyId: dto.companyId,
    code: { $in: codes },
    isActive: true,
  });
  if (existing.length > 0) {
    const err = new Error("Algunos códigos ya existen en esta propiedad");
    (err as Error & { conflicts: string[] }).conflicts = existing.map(
      (u) => u.code
    );
    throw err;
  }

  const unitsToInsert = codes.map((code) => ({
    unitId: `unit-${crypto.randomUUID()}`,
    propertyId: dto.propertyId,
    companyId: dto.companyId,
    categoryId: dto.categoryId,
    name: code,
    code,
    floor: dto.floor,
    description: undefined,
    capacity: dto.capacity,
    size: dto.size,
    photos: [],
    customProperties: dto.customProperties ?? {},
    status: "available" as UnitStatus,
    isActive: true,
  }));

  const created = await Unit.insertMany(unitsToInsert);

  await Category.updateOne(
    { categoryId: dto.categoryId },
    { $inc: { unitCount: dto.quantity } }
  );

  for (const unit of created) {
    await UnitStateHistory.create({
      historyId: `hist-${crypto.randomUUID()}`,
      unitId: unit.unitId,
      propertyId: dto.propertyId,
      companyId: dto.companyId,
      previousStatus: "available" as UnitStatus,
      newStatus: "available" as UnitStatus,
      changedByUserId: dto.createdByUserId,
      changedAt: new Date(),
      notes: "Unidad creada",
    });
  }

  return { created: created.length, units: created };
};

export const softDeleteUnit = async (
  unitId: string,
  propertyId: string
): Promise<IUnit | null> => {
  const unit = await Unit.findOne({ unitId, propertyId, isActive: true });
  if (!unit) return null;

  const result = await Unit.findOneAndUpdate(
    { unitId, propertyId, isActive: true },
    { $set: { isActive: false } },
    { new: true }
  );

  await Category.updateOne(
    { categoryId: unit.categoryId },
    { $inc: { unitCount: -1 } }
  );

  return result;
};
