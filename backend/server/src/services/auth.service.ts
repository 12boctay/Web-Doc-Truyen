import crypto from 'crypto';
import { User } from '../models/User';
import { redis } from '../config/redis';
import { signAccessToken, signRefreshToken, getAccessTokenExpiry } from '../utils/jwt';
import type { RegisterInput, LoginInput } from '@webdoctruyen/shared-be';

function userToResponse(user: {
  _id: unknown;
  email: string;
  name: string;
  slug: string;
  avatar: string;
  role: string;
}) {
  return {
    _id: String(user._id),
    email: user.email,
    name: user.name,
    slug: user.slug,
    avatar: user.avatar,
    role: user.role,
  };
}

export async function register(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw { status: 409, message: 'Email already exists' };
  }

  const user = await User.create(input);
  const accessToken = signAccessToken({ userId: String(user._id), role: user.role });
  const refreshToken = signRefreshToken();

  await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refreshToken } });

  return { accessToken, refreshToken, user: userToResponse(user) };
}

export async function login(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select('+password');
  if (!user || !(await user.comparePassword(input.password))) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  if (user.status === 'banned') {
    throw {
      status: 403,
      message: 'Account is banned',
      data: { bannedUntil: user.bannedUntil, bannedReason: user.bannedReason },
    };
  }

  const accessToken = signAccessToken({ userId: String(user._id), role: user.role });
  const refreshToken = signRefreshToken();

  await User.findByIdAndUpdate(user._id, {
    lastLogin: new Date(),
    $push: { refreshTokens: refreshToken },
  });

  return { accessToken, refreshToken, user: userToResponse(user) };
}

export async function refresh(oldRefreshToken: string) {
  const user = await User.findOne({ refreshTokens: oldRefreshToken }).select('+refreshTokens');
  if (!user) {
    // Possible replay attack — check if token was previously valid
    const suspectUser = await User.findOne().select('+refreshTokens');
    // If we can't find the token anywhere, it's simply invalid
    throw { status: 401, message: 'Invalid refresh token' };
  }

  // Rotate: remove old, add new
  const newRefreshToken = signRefreshToken();
  user.refreshTokens = user.refreshTokens.filter((t: string) => t !== oldRefreshToken);
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  const accessToken = signAccessToken({ userId: String(user._id), role: user.role });
  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(userId: string, accessToken: string, refreshToken: string) {
  // Blacklist access token in Redis for its remaining TTL
  const ttl = getAccessTokenExpiry(accessToken);
  if (ttl > 0) {
    await redis.set(`bl:${accessToken}`, '1', 'EX', ttl);
  }

  // Remove refresh token
  await User.findByIdAndUpdate(userId, {
    $pull: { refreshTokens: refreshToken },
  });
}

export async function forgotPassword(email: string) {
  const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires');
  if (!user) return; // Don't reveal if email exists

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // TODO: Send email with resetToken (not hashedToken)
  return resetToken;
}

export async function resetPassword(token: string, newPassword: string) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+resetPasswordToken +resetPasswordExpires +refreshTokens +password');

  if (!user) {
    throw { status: 400, message: 'Invalid or expired reset token' };
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.refreshTokens = []; // Invalidate all sessions
  await user.save();
}

export async function getMe(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }
  return userToResponse(user);
}
