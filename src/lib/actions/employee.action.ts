'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '../mongoose';
import { UpdateUserParams } from './shared.types';
import { updateUser } from './user.action';
import User from '@/database/user.model';

// update user
export async function createEmployeeProfileByUpdating(
  params: UpdateUserParams
) {
  try {
    connectToDatabase();

    const { clerkId, updateData, path } = params;
    if (clerkId) {
      updateData.role = 'employee';
    }

    const updatedUser = await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true
    });
    console.log('updatedUser', updateUser);

    if (!updatedUser) {
      throw new Error(`User with clerkId ${clerkId} not found`);
    }
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
