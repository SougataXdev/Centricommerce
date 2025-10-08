import { Request, Response } from 'express';
import type { ValidatedData } from '../types/express';
import prisma from '../../../../libs/prisma';
import { sendOtp } from '../helpers/auth.helper';
import bcrypt from 'bcrypt';

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
        message: "Seller with this email already exists",
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
      message: "Seller created successfully",
      seller: createdSeller,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const createShop = async (req:Request , res:Response) =>{
    try {
        const {shopName , bio , address , opening ,website , category , sellerId} = req.body;

        if (!shopName || !category || !address || !sellerId) {
            return res.status(400).json({
                success: false,
                message: "All required fields (shopName, category, address, sellerId) must be provided"
            });
        }

        const shopData:any = {
            name: shopName,  
            category,
            address, 
            sellerId
        }

        if (bio && bio.trim() !== "") {
            shopData.bio = bio;
        }

        if (opening && opening.trim() !== "") {
            shopData.opening = opening;
        }

        if (website && website.trim() !== "") {
            shopData.website = website;
        }

        const createdShop = await prisma.shops.create({
            data:shopData
        })


        return res.status(201).json({
            success:true,
            shop:createdShop,
            message:"shop created succesfully"
        })
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while creating a shop",
            
        });
    }
}



//todo:create stripe url
