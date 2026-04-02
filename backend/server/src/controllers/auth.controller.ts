import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export async function registerHandler(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.register(req.body);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    res
      .status(201)
      .json({ success: true, data: { accessToken: result.accessToken, user: result.user } });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ success: false, error: error.message || 'Internal server error' });
  }
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.login(req.body);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({ success: true, data: { accessToken: result.accessToken, user: result.user } });
  } catch (error: any) {
    const status = error.status || 500;
    const response: Record<string, unknown> = {
      success: false,
      error: error.message || 'Internal server error',
    };
    if (error.data) response.data = error.data;
    res.status(status).json(response);
  }
}

export async function refreshHandler(req: Request, res: Response): Promise<void> {
  try {
    const oldRefreshToken = req.cookies?.refreshToken;
    if (!oldRefreshToken) {
      res.status(401).json({ success: false, error: 'Refresh token required' });
      return;
    }
    const result = await authService.refresh(oldRefreshToken);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({ success: true, data: { accessToken: result.accessToken } });
  } catch (error: any) {
    res.clearCookie('refreshToken', { path: '/' });
    res
      .status(error.status || 500)
      .json({ success: false, error: error.message || 'Internal server error' });
  }
}

export async function logoutHandler(req: Request, res: Response): Promise<void> {
  try {
    const accessToken = req.headers.authorization?.slice(7) || '';
    const refreshToken = req.cookies?.refreshToken || '';
    await authService.logout(req.user!.userId, accessToken, refreshToken);
    res.clearCookie('refreshToken', { path: '/' });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ success: false, error: error.message || 'Internal server error' });
  }
}

export async function forgotPasswordHandler(req: Request, res: Response): Promise<void> {
  try {
    await authService.forgotPassword(req.body.email);
    // Always return 200 to prevent email enumeration
    res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ success: false, error: error.message || 'Internal server error' });
  }
}

export async function resetPasswordHandler(req: Request, res: Response): Promise<void> {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ success: false, error: error.message || 'Internal server error' });
  }
}

export async function getMeHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ success: false, error: error.message || 'Internal server error' });
  }
}
