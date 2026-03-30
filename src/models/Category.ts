import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  categoryId: string;
  propertyId: string;
  companyId: string;

  // Identificación
  name: string;
  description?: string;

  // Físico base
  size?: number;
  capacity: {
    adults: number;
    children: number;
  };

  // Precio base
  basePrice: {
    amount: number;
    currency: string;
  };

  // Media
  photos: string[];

  // Comodidades
  amenities: string[];

  // Custom
  customProperties?: Record<string, unknown>;

  // Auditoría
  isActive: boolean;
  unitCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    categoryId: { type: String, required: true, unique: true },
    propertyId: { type: String, required: true },
    companyId: { type: String, required: true },

    name: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 1000 },

    size: { type: Number, min: 1 },
    capacity: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0, min: 0 },
    },

    basePrice: {
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, required: true, default: "USD", uppercase: true },
    },

    photos: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    customProperties: { type: Schema.Types.Mixed, default: {} },

    isActive: { type: Boolean, default: true },
    unitCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.index({ categoryId: 1 });
CategorySchema.index({ propertyId: 1 });
CategorySchema.index({ companyId: 1 });
CategorySchema.index({ propertyId: 1, isActive: 1 });

export const Category = mongoose.model<ICategory>("Category", CategorySchema);
export default Category;
