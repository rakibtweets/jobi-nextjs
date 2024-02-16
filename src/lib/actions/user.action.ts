'use server';

import User from '@/database/user.model';
import { connectToDatabase } from '../mongoose';
import {
  ClerkUpdateUserParams,
  CreateUserParams,
  DeleteUserParams,
  UpdateUserParams
} from './shared.types';
import { revalidatePath } from 'next/cache';
import Resume from '@/database/resume.model';
import connectToCloudinary from '../cloudinary';
import cloudinary from 'cloudinary';
import { userSchema } from '@/utils/validation';
import * as z from 'zod';

export async function getUserById(params: any) {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();
    const newUser = await User.create(userData);
    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

type createUserByAdminParams = z.infer<typeof userSchema>;
export async function createUserByAdmin(userData: createUserByAdminParams) {
  try {
    connectToDatabase();
    connectToCloudinary();
    const { picture } = userData;
    if (picture) {
      const result = await cloudinary.v2.uploader.upload(picture as string, {
        folder: 'users',
        unique_filename: false,
        use_filename: true
      });

      userData.picture = result.secure_url;
    }
    const newUser = await User.create(userData);
    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
// update user
export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase();
    connectToCloudinary();
    const { clerkId, updateData, path } = params;
    const { picture } = updateData;

    console.log('updateData', updateData);

    if (picture) {
      const result = await cloudinary.v2.uploader.upload(picture as string, {
        folder: 'users',
        unique_filename: false,
        use_filename: true
      });

      updateData.picture = result.secure_url;
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

// update clerk user

export async function clekUserUpdate(params: ClerkUpdateUserParams) {
  try {
    connectToDatabase();
    const { clerkId, name, email, picture, username, path } = params;

    const updateData = {
      clerkId,
      name,
      email,
      picture,
      username
    };
    const updatedUser = await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true
    });
    if (!updatedUser) {
      throw new Error(`User with clerkId ${clerkId} not found`);
    }
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    connectToDatabase();

    const { clerkId } = params;

    const user = await User.findOneAndDelete({ clerkId });

    if (!user) {
      throw new Error('User not found');
    }

    // delete candidate resume
    await Resume.deleteMany({ user: user._id });

    const deletedUser = await User.findByIdAndDelete(user._id);

    return deletedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
