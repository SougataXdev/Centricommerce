import { Request, Response } from 'express';
import type { ValidatedData } from '../types/express';
import prisma from '../../../../libs/prisma';
import { sendOtp } from '../helpers/auth.helper';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

const SELLER_RETURN_PATH = '/signup?step=3&completed=true';
const SELLER_REFRESH_PATH = '/signup?step=3&refresh=true';

const COUNTRY_LABEL_TO_CODE: Record<string, string> = {
  india: 'IN',
  'united states': 'US',
  'united kingdom': 'GB',
  canada: 'CA',
  australia: 'AU',
  germany: 'DE',
  france: 'FR',
  spain: 'ES',
};

const getSellerAppUrl = () =>
  process.env.SELLER_APP_URL ??
  process.env.SELLER_FRONTEND_URL ??
  process.env.APP_URL ??
  'http://localhost:3000';

const buildSellerOnboardingUrl = (path: string) => {
  const base = getSellerAppUrl().replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

const getStripeClient = () => {
  if (stripeClient) {
    return stripeClient;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return null;
  }

  stripeClient = new Stripe(stripeSecretKey);

  return stripeClient;
};

const resolveStripeCountry = (input?: string | null): string => {
  if (!input) {
    return 'US';
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return 'US';
  }

  if (/^[A-Za-z]{2}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  const normalized = trimmed.toLowerCase();
  return COUNTRY_LABEL_TO_CODE[normalized] ?? 'US';
};

export const sendSellerSignUpOtp = async (req: Request, res: Response) => {
  try {
    const payload = (req.validatedData as ValidatedData) ?? req.body;
    const { name, email } = payload;

    if (!name || !email) {
      return res
        .status(400)
        .json({ message: 'all fields are required', success: false });
    }
    const isExistingUser = await prisma.sellers.findUnique({
      where: { email },
    });

    if (isExistingUser) {
      return res.status(409).json({
        message: 'Seller already exists on this email',
        success: false,
      });
    }

    await sendOtp(email, name, 'Seller-verification-mail');

    return res.status(200).json({
      message: 'OTP sent successfully',
      email,
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'internal server error', success: false });
  }
};

export const createSeller = async (req: Request, res: Response) => {
  try {
    const { name, email, phoneNumber, country, password } = req.body;

    const isExistingUser = await prisma.sellers.findUnique({
      where: { email },
    });

    if (isExistingUser) {
      return res.status(409).json({
        success: false,
        message: 'Seller with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 20);

    const createdSeller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        country,
      },
      select: {
        id: true,
        name: true,
        email: true,
        country: true,
        phoneNumber: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Seller created successfully',
      seller: createdSeller,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const createShop = async (req: Request, res: Response) => {
  try {
    const { shopName, bio, address, opening, website, category, sellerId } =
      req.body;

    if (!shopName || !category || !address || !sellerId) {
      return res.status(400).json({
        success: false,
        message:
          'All required fields (shopName, category, address, sellerId) must be provided',
      });
    }

    const shopData: any = {
      name: shopName,
      category,
      address,
      sellerId,
    };

    if (bio && bio.trim() !== '') {
      shopData.bio = bio;
    }

    if (opening && opening.trim() !== '') {
      shopData.opening = opening;
    }

    if (website && website.trim() !== '') {
      shopData.website = website;
    }

    const createdShop = await prisma.shops.create({
      data: shopData,
    });

    return res.status(201).json({
      success: true,
      shop: createdShop,
      message: 'shop created succesfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating a shop',
    });
  }
};

export const loginSeller = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const seller = await prisma.sellers.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        country: true,
        stripeId: true,
        password: true,
      },
    });

    if (!seller || !seller.password) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, seller.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      { id: seller.id, role: 'seller' },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: seller.id, email: seller.email, role: 'seller' },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '7d' }
    );

    res.cookie('accessToken', accessToken, {
      sameSite: 'strict',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      sameSite: 'strict',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _password, ...sellerData } = seller;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      seller: sellerData,
    });
  } catch (error) {
    console.error('Seller login error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const createStripeConnectLink = async (req: Request, res: Response) => {
  try {
    const stripe = getStripeClient();

    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: 'Stripe secret key is not configured',
      });
    }

    const { sellerId } = req.body as { sellerId?: string };

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: 'sellerId is required',
      });
    }

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        email: true,
        name: true,
        stripeId: true,
        country: true,
      },
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      });
    }

    let accountId = seller.stripeId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: seller.email,
        country: resolveStripeCountry(seller.country),
        metadata: {
          sellerId: seller.id,
          sellerName: seller.name,
        },
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
      });

      accountId = account.id;

      await prisma.sellers.update({
        where: { id: seller.id },
        data: { stripeId: accountId },
      });
    }

    const refreshBaseUrl =
      process.env.STRIPE_CONNECT_REFRESH_URL ??
      buildSellerOnboardingUrl(SELLER_REFRESH_PATH);

    const returnBaseUrl =
      process.env.STRIPE_CONNECT_RETURN_URL ??
      buildSellerOnboardingUrl(SELLER_RETURN_PATH);

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshBaseUrl,
      return_url: returnBaseUrl,
      type: 'account_onboarding',
    });

    return res.status(200).json({
      success: true,
      url: accountLink.url,
      expires_at: accountLink.expires_at,
      account: accountId,
    });
  } catch (error) {
    console.error('Stripe connect link error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create Stripe connect link',
    });
  }
};
