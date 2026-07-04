'use strict';

const bcrypt = require('bcryptjs');
const env = require('../config/env');
const logger = require('../config/logger');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { signAccessToken, signRefreshToken, verifyRefreshToken, expiryDate } = require('../utils/jwt');
const { ok, created, unauthorized, conflict, serverError } = require('../utils/response');

// ─── Register ────────────────────────────────────────────

async function register(req, res) {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return conflict(res, 'An account with this email already exists.');

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
    const user = await User.create({ name, email, passwordHash });

    const accessToken  = signAccessToken({ userId: user._id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user._id });

    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      expiresAt: expiryDate(env.JWT_REFRESH_EXPIRES_IN),
    });

    logger.info({ userId: user._id }, 'New user registered');
    return created(res, { user, accessToken, refreshToken }, 'Registration successful.');
  } catch (err) {
    logger.error({ err }, 'register error');
    return serverError(res);
  }
}

// ─── Login ───────────────────────────────────────────────

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return unauthorized(res, 'Invalid email or password.');

    const match = await user.comparePassword(password);
    if (!match) return unauthorized(res, 'Invalid email or password.');

    const accessToken  = signAccessToken({ userId: user._id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user._id });

    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      expiresAt: expiryDate(env.JWT_REFRESH_EXPIRES_IN),
    });

    logger.info({ userId: user._id }, 'User logged in');
    return ok(res, {
      user: { id: user._id, name: user.name, email: user.email },
      accessToken,
      refreshToken,
    }, 'Login successful.');
  } catch (err) {
    logger.error({ err }, 'login error');
    return serverError(res);
  }
}

// ─── Refresh ─────────────────────────────────────────────

async function refresh(req, res) {
  const { refreshToken } = req.body;
  try {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return unauthorized(res, 'Invalid or expired refresh token.');
    }

    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored || stored.expiresAt < new Date()) {
      return unauthorized(res, 'Refresh token revoked or expired.');
    }

    const user = await User.findById(payload.userId).select('_id email');
    if (!user) return unauthorized(res, 'User no longer exists.');

    // Rotate tokens
    await RefreshToken.deleteOne({ token: refreshToken });

    const newAccessToken  = signAccessToken({ userId: user._id, email: user.email });
    const newRefreshToken = signRefreshToken({ userId: user._id });

    await RefreshToken.create({
      token: newRefreshToken,
      userId: user._id,
      expiresAt: expiryDate(env.JWT_REFRESH_EXPIRES_IN),
    });

    return ok(res, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Tokens refreshed.');
  } catch (err) {
    logger.error({ err }, 'refresh error');
    return serverError(res);
  }
}

// ─── Logout ──────────────────────────────────────────────

async function logout(req, res) {
  const { refreshToken } = req.body;
  try {
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    return ok(res, null, 'Logged out successfully.');
  } catch (err) {
    logger.error({ err }, 'logout error');
    return serverError(res);
  }
}

module.exports = { register, login, refresh, logout };
