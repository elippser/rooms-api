import crypto from "crypto";
import Category, { ICategory } from "../models/Category";

export interface CreateCategoryDto {
  propertyId: string;
  companyId: string;
  name: string;
  description?: string;
  size?: number;
  capacity: { adults: number; children: number };
  basePrice: { amount: number; currency: string };
  photos?: string[];
  amenities?: string[];
  customProperties?: Record<string, unknown>;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  size?: number;
  capacity?: { adults: number; children: number };
  basePrice?: { amount: number; currency: string };
  photos?: string[];
  amenities?: string[];
  customProperties?: Record<string, unknown>;
}

export const createCategory = async (
  dto: CreateCategoryDto
): Promise<ICategory> => {
  const categoryId = `cat-${crypto.randomUUID()}`;

  const category = await Category.create({
    categoryId,
    propertyId: dto.propertyId,
    companyId: dto.companyId,
    name: dto.name,
    description: dto.description,
    size: dto.size,
    capacity: dto.capacity,
    basePrice: dto.basePrice,
    photos: dto.photos ?? [],
    amenities: dto.amenities ?? [],
    customProperties: dto.customProperties ?? {},
    isActive: true,
    unitCount: 0,
  });

  return category;
};

export const listCategories = async (
  propertyId: string,
  companyId: string
): Promise<ICategory[]> => {
  return Category.find({ propertyId, companyId, isActive: true });
};

export const getCategory = async (
  categoryId: string,
  propertyId: string
): Promise<ICategory | null> => {
  return Category.findOne({
    categoryId,
    propertyId,
    isActive: true,
  });
};

export const updateCategory = async (
  categoryId: string,
  propertyId: string,
  dto: UpdateCategoryDto
): Promise<ICategory | null> => {
  return Category.findOneAndUpdate(
    { categoryId, propertyId, isActive: true },
    { $set: dto },
    { new: true }
  );
};

export const softDeleteCategory = async (
  categoryId: string,
  propertyId: string
): Promise<ICategory | null> => {
  const category = await Category.findOne({
    categoryId,
    propertyId,
    isActive: true,
  });

  if (!category) return null;

  if (category.unitCount > 0) {
    throw new Error(
      "No se puede eliminar una categoría con unidades activas"
    );
  }

  return Category.findOneAndUpdate(
    { categoryId, propertyId, isActive: true },
    { $set: { isActive: false } },
    { new: true }
  );
};
