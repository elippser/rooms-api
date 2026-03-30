import crypto from "crypto";
import Unit, { IUnit } from "../models/Unit";
import UnitStateHistory, { IUnitStateHistory } from "../models/UnitStateHistory";
import Category from "../models/Category";
import { UnitStatus, isValidTransition } from "../constants/unitConstants";

export interface ChangeStatusDto {
  unitId: string;
  propertyId: string;
  newStatus: UnitStatus;
  changedByUserId: string;
  companyId: string;
  notes?: string;
}

export const changeUnitStatus = async (
  dto: ChangeStatusDto
): Promise<IUnit> => {
  const unit = await Unit.findOne({
    unitId: dto.unitId,
    propertyId: dto.propertyId,
    isActive: true,
  });

  if (!unit) {
    throw new Error(`Unit ${dto.unitId} not found`);
  }

  const previousStatus = unit.status as UnitStatus;

  if (!isValidTransition(previousStatus, dto.newStatus)) {
    throw new Error(
      `Invalid status transition from "${previousStatus}" to "${dto.newStatus}"`
    );
  }

  unit.status = dto.newStatus;
  await unit.save();

  const historyId = `hist-${crypto.randomUUID()}`;
  await UnitStateHistory.create({
    historyId,
    unitId: dto.unitId,
    propertyId: dto.propertyId,
    companyId: dto.companyId,
    previousStatus,
    newStatus: dto.newStatus,
    changedByUserId: dto.changedByUserId,
    changedAt: new Date(),
    notes: dto.notes,
  });

  return unit;
};

export const getUnitHistory = async (
  unitId: string,
  propertyId: string
): Promise<IUnitStateHistory[]> => {
  return UnitStateHistory.find({ unitId, propertyId })
    .sort({ changedAt: -1 });
};

export interface UnitWithLastChange {
  unitId: string;
  name: string;
  code: string;
  floor?: string;
  status: UnitStatus;
  capacity: { adults: number; children: number };
  size?: number;
  photos: string[];
  category: {
    categoryId: string;
    name: string;
    amenities: string[];
    basePrice: { amount: number; currency: string };
  };
  lastChange: {
    previousStatus: UnitStatus;
    changedByUserId: string;
    changedAt: Date;
    notes?: string;
  } | null;
}

export const getUnitsWithState = async (
  propertyId: string,
  companyId: string
): Promise<UnitWithLastChange[]> => {
  const units = await Unit.find({ propertyId, companyId, isActive: true });
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
        amenities: c.amenities,
        basePrice: c.basePrice,
      },
    ])
  );

  const results: UnitWithLastChange[] = await Promise.all(
    units.map(async (unit) => {
      const lastHistory = await UnitStateHistory.findOne({ unitId: unit.unitId })
        .sort({ changedAt: -1 });

      const category = categoryMap.get(unit.categoryId);
      if (!category) {
        throw new Error(
          `Category ${unit.categoryId} not found for unit ${unit.unitId}`
        );
      }

      return {
        unitId: unit.unitId,
        name: unit.name,
        code: unit.code,
        floor: unit.floor,
        status: unit.status as UnitStatus,
        capacity: unit.capacity,
        size: unit.size,
        photos: unit.photos,
        category,
        lastChange: lastHistory
          ? {
              previousStatus: lastHistory.previousStatus,
              changedByUserId: lastHistory.changedByUserId,
              changedAt: lastHistory.changedAt,
              notes: lastHistory.notes,
            }
          : null,
      };
    })
  );

  return results;
};
