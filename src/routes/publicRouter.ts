import { Router, Request, Response } from "express";
import Category from "../models/Category";

const publicRouter = Router();

publicRouter.get(
  "/:propertyId/categories",
  async (req: Request, res: Response) => {
    try {
      const { propertyId } = req.params;

      const categories = await Category.find({
        propertyId,
        isActive: true,
      })
        .select(
          "categoryId name description size capacity basePrice photos amenities unitCount"
        )
        .lean();

      res.status(200).json(categories);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Internal server error";
      res.status(500).json({ message });
    }
  }
);

export default publicRouter;
