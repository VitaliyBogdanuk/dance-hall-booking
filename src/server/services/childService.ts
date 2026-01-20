import { connectOnce } from "@/server/db/mongoose";
import { ChildModel, IChild } from "@/server/db/models/child.model";
import { NotFoundError, ForbiddenError } from "@/server/http/errors";
import { Types } from "mongoose";
import { sanitizeObject } from "@/server/utils/sanitize";

export class ChildService {
  static async create(data: { parentId: string; name: string; birthDate?: Date | string; notes?: string }): Promise<IChild> {
    await connectOnce();
    // Sanitize input
    const sanitized = sanitizeObject(data);
    const child = new ChildModel({
      parentId: new Types.ObjectId(sanitized.parentId),
      name: sanitized.name,
      birthDate: sanitized.birthDate ? new Date(sanitized.birthDate) : undefined,
      notes: sanitized.notes,
    });
    return child.save();
  }

  static async getById(id: string, parentId?: string): Promise<IChild> {
    await connectOnce();
    const child = await ChildModel.findById(id).lean() as IChild | null;
    if (!child) {
      throw new NotFoundError("Child");
    }
    if (parentId && child.parentId.toString() !== parentId) {
      throw new ForbiddenError("Child does not belong to this parent");
    }
    return child;
  }

  static async getByParent(parentId: string): Promise<IChild[]> {
    await connectOnce();
    return (await ChildModel.find({ parentId: new Types.ObjectId(parentId) })
      .sort({ createdAt: -1 })
      .lean()) as unknown as IChild[];
  }

  static async update(
    id: string,
    data: { name?: string; birthDate?: Date | string; notes?: string },
    parentId: string
  ): Promise<IChild> {
    await connectOnce();

    // Sanitize input
    const sanitized = sanitizeObject(data);

    const child = await ChildModel.findById(id).lean() as IChild | null;
    if (!child) {
      throw new NotFoundError("Child");
    }

    if (child.parentId.toString() !== parentId) {
      throw new ForbiddenError("You can only update your own children");
    }

    const updateData: Partial<IChild> = {};
    if (sanitized.name !== undefined) {
      updateData.name = sanitized.name;
    }
    if (sanitized.birthDate !== undefined) {
      updateData.birthDate = sanitized.birthDate ? new Date(sanitized.birthDate) : undefined;
    }
    if (sanitized.notes !== undefined) {
      updateData.notes = sanitized.notes;
    }

    const updated = await ChildModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean() as IChild | null;
    if (!updated) {
      throw new NotFoundError("Child");
    }
    return updated;
  }

  static async delete(id: string, parentId: string): Promise<void> {
    await connectOnce();

    const child = await ChildModel.findById(id).lean() as IChild | null;
    if (!child) {
      throw new NotFoundError("Child");
    }

    if (child.parentId.toString() !== parentId) {
      throw new ForbiddenError("You can only delete your own children");
    }

    const result = await ChildModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError("Child");
    }
  }
}
