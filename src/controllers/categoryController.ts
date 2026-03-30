import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { verifyProperty } from "../services/coreClient";
import {
  createCategory,
  listCategories,
  getCategory,
  updateCategory,
  softDeleteCategory,
} from "../services/categoryService";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validations/unitSchemas";

const getToken = (req: Request): string => {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const cookie = req.cookies?.app_token as string | undefined;
  if (cookie) return cookie;
  return "";
};

export const createCategoryHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { propertyId } = req.params;
    const user = req.user!;

    const { error, value } = createCategorySchema.validate(req.body);
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

    const category = await createCategory({
      ...value,
      propertyId,
      companyId: user.companyId,
    });
    res.status(201).json(category);
  }
);

export const listCategoriesHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { propertyId } = req.params;
    const user = req.user!;

    const categories = await listCategories(propertyId, user.companyId);
    res.status(200).json(categories);
  }
);

export const getCategoryHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { propertyId, categoryId } = req.params;

    const category = await getCategory(categoryId, propertyId);
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.status(200).json(category);
  }
);

export const updateCategoryHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { propertyId, categoryId } = req.params;

    const { error, value } = updateCategorySchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    const category = await updateCategory(categoryId, propertyId, value);
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    res.status(200).json(category);
  }
);

export const deleteCategoryHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { propertyId, categoryId } = req.params;

    try {
      const category = await softDeleteCategory(categoryId, propertyId);
      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      res.status(200).json({ message: "Category deleted", categoryId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      if (msg.includes("No se puede eliminar una categoría con unidades activas")) {
        res.status(400).json({ message: msg });
        return;
      }
      throw err;
    }
  }
);
