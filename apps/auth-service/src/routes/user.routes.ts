import express from 'express';
import { validateSignupData, verifyOtp } from '../helpers/auth.helper';
import { createUser, loginUser, sendSignupOtp } from '../controllers/user.controller';
import {
  otpEligibilityGuard,
  otpRequestRecord,
} from '../middlewares/otp-service/guards';
import { normalizeEmail } from '../middlewares/normalize-email';

const router = express.Router();

router.post(
  '/signup',
  validateSignupData('user'),
  normalizeEmail,
  otpEligibilityGuard,
  otpRequestRecord,
  sendSignupOtp
);


router.post('/signup/verify', normalizeEmail, verifyOtp, createUser);

router.post("/login" , loginUser);

export default router;
