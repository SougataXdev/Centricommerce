import express from 'express';
import { validateSignupData } from '../helpers/auth.helper';
import { userSignup } from '../controllers/auth.controller';


const router = express.Router();

router.post("/signup" , validateSignupData("user") , userSignup)





export default router;