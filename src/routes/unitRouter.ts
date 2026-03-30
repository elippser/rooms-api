import { Router } from "express";
import authenticateJWT from "../middleware/authenticateJWT";
import requireRole from "../middleware/requireRole";
import {
  createUnitHandler,
  listUnitsHandler,
  getUnitsStateHandler,
  getUnitHandler,
  updateUnitHandler,
  changeStatusHandler,
  deleteUnitHandler,
  getUnitHistoryHandler,
} from "../controllers/unitController";

const unitRouter = Router({ mergeParams: true });

unitRouter.use(authenticateJWT);

// ── CRUD ──────────────────────────────────────────────────────────────────────
unitRouter.post(
  "/:propertyId/units",
  requireRole("owner", "admin"),
  createUnitHandler
);

unitRouter.get("/:propertyId/units", listUnitsHandler);

// /states must be declared before /:unitId to avoid Express matching "states" as a param
unitRouter.get("/:propertyId/units/states", getUnitsStateHandler);

unitRouter.get("/:propertyId/units/:unitId", getUnitHandler);

unitRouter.patch(
  "/:propertyId/units/:unitId",
  requireRole("owner", "admin"),
  updateUnitHandler
);

unitRouter.patch(
  "/:propertyId/units/:unitId/status",
  requireRole("owner", "admin", "staff"),
  changeStatusHandler
);

unitRouter.delete(
  "/:propertyId/units/:unitId",
  requireRole("owner", "admin"),
  deleteUnitHandler
);

// ── History ───────────────────────────────────────────────────────────────────
unitRouter.get("/:propertyId/units/:unitId/history", getUnitHistoryHandler);

export default unitRouter;
