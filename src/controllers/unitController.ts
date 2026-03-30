import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { verifyProperty } from "../services/coreClient";
import {
  createUnit,
  listUnits,
  getUnit,
  updateUnit,
  softDeleteUnit,
  previewBulkUnits,
  bulkCreateUnits,
} from "../services/unitService";
import {
  changeUnitStatus,
  getUnitHistory,
  getUnitsWithState,
} from "../services/unitStateService";
import {
  createUnitSchema,
  updateUnitSchema,
  changeStatusSchema,
  bulkCreateUnitsSchema,
} from "../validations/unitSchemas";

const getToken = (req: Request): string => {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const cookie = req.cookies?.app_token as string | undefined;
  if (cookie) return cookie;
  return "";
};

export const createUnitHandler = catchAsync(async (req: Request, res: Response) => {
  const { propertyId } = req.params;
  const user = req.user!;

  const { error, value } = createUnitSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  const token = getToken(req);
  const valid = await verifyProperty(propertyId, user.companyId, token);
  if (!valid) {
    res.status(404).json({ message: "Property not found or access denied" });
    return;
  }

  try {
    const unit = await createUnit({
      ...value,
      propertyId,
      companyId: user.companyId,
      createdByUserId: user.userId,
    });
    res.status(201).json(unit);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Create failed";
    if (msg.includes("Ya existe una unidad")) {
      res.status(409).json({ message: msg });
      return;
    }
    if (msg.includes("La categoría no existe")) {
      res.status(400).json({ message: msg });
      return;
    }
    throw err;
  }
});

export const listUnitsHandler = catchAsync(async (req: Request, res: Response) => {
  const { propertyId } = req.params;
  const user = req.user!;
  const code = req.query.code as string | undefined;
  const categoryId = req.query.categoryId as string | undefined;
  const status = req.query.status as string | undefined;

  const units = await listUnits(propertyId, user.companyId, { code, categoryId, status });
  res.status(200).json(units);
});

export const getUnitHandler = catchAsync(async (req: Request, res: Response) => {
  const { propertyId, unitId } = req.params;

  const unit = await getUnit(unitId, propertyId);
  if (!unit) {
    res.status(404).json({ message: "Unit not found" });
    return;
  }

  res.status(200).json(unit);
});

export const updateUnitHandler = catchAsync(async (req: Request, res: Response) => {
  const { propertyId, unitId } = req.params;

  const { error, value } = updateUnitSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  try {
    const unit = await updateUnit(unitId, propertyId, value);
    if (!unit) {
      res.status(404).json({ message: "Unit not found" });
      return;
    }
    res.status(200).json(unit);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Update failed";
    if (msg.includes("Ya existe una unidad")) {
      res.status(409).json({ message: msg });
      return;
    }
    if (msg.includes("La categoría no existe")) {
      res.status(400).json({ message: msg });
      return;
    }
    throw err;
  }
});

export const changeStatusHandler = catchAsync(async (req: Request, res: Response) => {
  const { propertyId, unitId } = req.params;
  const user = req.user!;

  const { error, value } = changeStatusSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  try {
    const unit = await changeUnitStatus({
      unitId,
      propertyId,
      companyId: user.companyId,
      newStatus: value.status,
      changedByUserId: user.userId,
      notes: value.notes,
    });
    res.status(200).json(unit);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Status change failed";
    res.status(400).json({ message });
  }
});

export const deleteUnitHandler = catchAsync(async (req: Request, res: Response) => {
  const { propertyId, unitId } = req.params;

  const unit = await softDeleteUnit(unitId, propertyId);
  if (!unit) {
    res.status(404).json({ message: "Unit not found" });
    return;
  }

  res.status(200).json({ message: "Unit deleted", unitId });
});

export const getUnitHistoryHandler = catchAsync(async (req: Request, res: Response) => {
  const { propertyId, unitId } = req.params;

  const history = await getUnitHistory(unitId, propertyId);
  res.status(200).json(history);
});

export const getUnitsStateHandler = catchAsync(async (req: Request, res: Response) => {
  const { propertyId } = req.params;
  const user = req.user!;

  const result = await getUnitsWithState(propertyId, user.companyId);
  res.status(200).json(result);
});

export const previewBulkUnitsHandler = catchAsync(async (req: Request, res: Response) => {
  const { propertyId, categoryId } = req.params;
  const user = req.user!;

  const { error, value } = bulkCreateUnitsSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  const token = getToken(req);
  const valid = await verifyProperty(propertyId, user.companyId, token);
  if (!valid) {
    res.status(404).json({ message: "Property not found or access denied" });
    return;
  }

  try {
    const result = await previewBulkUnits({
      propertyId,
      companyId: user.companyId,
      categoryId,
      quantity: value.quantity,
      floor: value.floor,
      codePrefix: value.codePrefix,
      codeStart: value.codeStart,
      capacity: value.capacity,
      size: value.size,
      customProperties: value.customProperties,
      createdByUserId: user.userId,
    });
    res.status(200).json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Preview failed";
    if (msg.includes("La categoría no existe")) {
      res.status(400).json({ message: msg });
      return;
    }
    throw err;
  }
});

export const bulkCreateUnitsHandler = catchAsync(async (req: Request, res: Response) => {
  const { propertyId, categoryId } = req.params;
  const user = req.user!;

  const { error, value } = bulkCreateUnitsSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  const token = getToken(req);
  const valid = await verifyProperty(propertyId, user.companyId, token);
  if (!valid) {
    res.status(404).json({ message: "Property not found or access denied" });
    return;
  }

  try {
    const result = await bulkCreateUnits({
      propertyId,
      companyId: user.companyId,
      categoryId,
      quantity: value.quantity,
      floor: value.floor,
      codePrefix: value.codePrefix,
      codeStart: value.codeStart,
      capacity: value.capacity,
      size: value.size,
      customProperties: value.customProperties,
      createdByUserId: user.userId,
    });
    res.status(200).json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bulk create failed";
    if (msg.includes("La categoría no existe")) {
      res.status(400).json({ message: msg });
      return;
    }
    if (msg.includes("Algunos códigos ya existen")) {
      const conflicts = (err as Error & { conflicts?: string[] }).conflicts ?? [];
      res.status(400).json({
        message: msg,
        conflicts,
      });
      return;
    }
    throw err;
  }
});
