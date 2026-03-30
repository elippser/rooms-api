import { Router } from "express";
import authenticateJWT from "../middleware/authenticateJWT";
import requireRole from "../middleware/requireRole";
import {
  createCategoryHandler,
  listCategoriesHandler,
  getCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from "../controllers/categoryController";
import {
  previewBulkUnitsHandler,
  bulkCreateUnitsHandler,
} from "../controllers/unitController";

const categoryRouter = Router({ mergeParams: true });

categoryRouter.use(authenticateJWT);

// ── CRUD ──────────────────────────────────────────────────────────────────────
categoryRouter.post(
  "/:propertyId/categories",
  requireRole("owner", "admin"),
  createCategoryHandler
);

categoryRouter.get("/:propertyId/categories", listCategoriesHandler);

categoryRouter.get("/:propertyId/categories/:categoryId", getCategoryHandler);

categoryRouter.patch(
  "/:propertyId/categories/:categoryId",
  requireRole("owner", "admin"),
  updateCategoryHandler
);

categoryRouter.delete(
  "/:propertyId/categories/:categoryId",
  requireRole("owner", "admin"),
  deleteCategoryHandler
);

// ── Bulk units (preview antes que bulk para evitar confusión de rutas) ────────
categoryRouter.post(
  "/:propertyId/categories/:categoryId/units/bulk/preview",
  requireRole("owner", "admin"),
  previewBulkUnitsHandler
);
categoryRouter.post(
  "/:propertyId/categories/:categoryId/units/bulk",
  requireRole("owner", "admin"),
  bulkCreateUnitsHandler
);

export default categoryRouter;
