import { Request, Response } from 'express';
import prisma from '../../../auth-service/dist/libs/prisma/index';


export const getCategories = async (req: Request, res: Response) => {
    // Sample product data
    const categories = await prisma.siteConfig.findFirst();

    if (!categories) {
        return res.status(404).json({ message: 'Categories not found' });
    }
    
    return res.status(200).json({
        categories: categories.categories,
        subCategories: categories.subCategories,
    });
}