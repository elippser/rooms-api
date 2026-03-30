import mongoose, { Schema, Document } from "mongoose";
import { UnitStatus, UNIT_STATUSES } from "../constants/unitConstants";

export interface IUnit extends Document {
  unitId: string;
  propertyId: string;
  companyId: string;
  categoryId: string;

  // Identificación propia
  name: string;
  code: string;
  floor?: string;
  description?: string;

  // Físico propio (override sobre categoría)
  size?: number;
  capacity: {
    adults: number;
    children: number;
  };

  // Media propia
  photos: string[];

  // Estado operativo
  status: UnitStatus;

  // Custom
  customProperties?: Record<string, unknown>;

  // Auditoría
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UnitSchema = new Schema<IUnit>(
  {
    unitId: { type: String, required: true, unique: true },
    propertyId: { type: String, required: true },
    companyId: { type: String, required: true },
    categoryId: { type: String, required: true },

    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    floor: { type: String, trim: true },
    description: { type: String, maxlength: 1000 },

    size: { type: Number, min: 1 },
    capacity: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0, min: 0 },
    },

    photos: { type: [String], default: [] },

    status: {
      type: String,
      enum: UNIT_STATUSES,
      default: "available",
    },

    customProperties: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UnitSchema.index({ unitId: 1 });
UnitSchema.index({ propertyId: 1 });
UnitSchema.index({ companyId: 1 });
UnitSchema.index({ categoryId: 1 });
UnitSchema.index({ status: 1 });
UnitSchema.index({ propertyId: 1, isActive: 1 });
UnitSchema.index({ code: 1, propertyId: 1 }, { unique: true });

export const Unit = mongoose.model<IUnit>("Unit", UnitSchema);
export default Unit;
