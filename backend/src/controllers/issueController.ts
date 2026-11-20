import { Request, Response } from 'express';
import { IssueModel } from '../db/models/Issue.js';
import { connectToDatabase } from '../db/mongodb.js';

export async function getIssues(req: Request, res: Response) {
  try {
    await connectToDatabase();
    // Auto-remove expired demo issues if any
    await IssueModel.deleteMany({ isDemo: true, demoExpiresAt: { $lte: new Date() } });

    const docs = await IssueModel.find().sort({ createdAt: -1 }).lean();
    const issues = docs.map((doc: any) => ({
      ...doc,
      id: doc._id?.toString() || doc.id,
    }));

    return res.json({ issues });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch issues' });
  }
}

export async function updateIssue(req: Request, res: Response) {
  try {
    await connectToDatabase();
    const { status, resolutionNote } = req.body;
    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (resolutionNote !== undefined) updateData.resolutionNote = resolutionNote;

    const doc = await IssueModel.findByIdAndUpdate(req.params.id, updateData, { new: true }).lean();
    if (!doc) {
      return res.status(404).json({ error: 'Issue ticket not found' });
    }

    return res.json({
      success: true,
      issue: {
        ...doc,
        id: (doc as any)._id?.toString() || (doc as any).id,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update issue' });
  }
}
