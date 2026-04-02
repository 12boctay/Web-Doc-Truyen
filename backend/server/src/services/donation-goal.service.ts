import { DonationGoal } from '../models/DonationGoal';

interface CreateGoalInput {
  title: string;
  description?: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
}

export async function create(input: CreateGoalInput) {
  return DonationGoal.create({
    title: input.title,
    description: input.description || '',
    targetAmount: input.targetAmount,
    startDate: new Date(input.startDate),
    endDate: new Date(input.endDate),
    isActive: true,
  });
}

export async function list() {
  return DonationGoal.find().sort({ createdAt: -1 });
}

export async function getActive() {
  return DonationGoal.find({ isActive: true }).sort({ createdAt: -1 });
}

export async function getById(id: string) {
  return DonationGoal.findById(id);
}

export async function update(id: string, data: Partial<CreateGoalInput & { isActive: boolean }>) {
  const updateData: any = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);
  return DonationGoal.findByIdAndUpdate(id, updateData, { new: true });
}

export async function remove(id: string) {
  return DonationGoal.findByIdAndDelete(id);
}

export async function addAmount(id: string, amount: number) {
  return DonationGoal.findByIdAndUpdate(id, { $inc: { currentAmount: amount } }, { new: true });
}
