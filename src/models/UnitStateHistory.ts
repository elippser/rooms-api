import { Schema, model, Document } from "mongoose";
import { UnitStatus, UNIT_STATUSES } from "../constants/unitConstants";

export interface IUnitStateHistory extends Document {
  historyId: string;
  unitId: string;
  propertyId: string;
  companyId: string;
  previousStatus: UnitStatus;
  newStatus: UnitStatus;
  changedByUserId: string;
  changedAt: Date;
  notes?: string;
}

const unitStateHistorySchema = new Schema<IUnitStateHistory>(
  {
    historyId: { type: String, required: true, unique: true },
    unitId: { type: String, required: true, index: true },
    propertyId: { type: String, required: true, index: true },
    companyId: { type: String, required: true },
    previousStatus: { type: String, enum: UNIT_STATUSES, required: true },
    newStatus: { type: String, enum: UNIT_STATUSES, required: true },
    changedByUserId: { type: String, required: true },
    changedAt: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true },
  },
  {
    timestamps: false,
  }
);

unitStateHistorySchema.index({ changedAt: -1 });

const UnitStateHistory = model<IUnitStateHistory>(
  "UnitStateHistory",
  unitStateHistorySchema
);

export default UnitStateHistory;
