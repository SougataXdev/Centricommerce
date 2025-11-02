import prisma from '../../../../libs/prisma';

const initializeConfig = async () => {
  try {
    const existingConfig = await prisma.siteConfig.findFirst();
    if (!existingConfig) {
      await prisma.siteConfig.create({
        data: {
          categories: [
            'Electronics',
            'Fashion',
            'Home & Kitchen',
            'Sports & Fitness',
            'Beauty & Personal Care',
            'Books & Media',
            'Toys & Games',
            'Automotive',
            'Health & Wellness',
            'Pet Supplies',
          ],
          subCategories: {
            Electronics: [
              'Mobiles',
              'Laptops',
              'Accessories',
              'Gaming',
              'Cameras',
              'Audio & Headphones',
              'Smart Devices',
            ],
            Fashion: [
              'Men',
              'Women',
              'Kids',
              'Footwear',
              'Watches',
              'Jewelry',
              'Bags & Wallets',
            ],
            'Home & Kitchen': [
              'Furniture',
              'Appliances',
              'Decor',
              'Bedding',
              'Cookware',
              'Storage',
              'Lighting',
            ],
            'Sports & Fitness': [
              'Gym Equipment',
              'Outdoor Sports',
              'Wearables',
              'Yoga',
              'Team Sports',
              'Water Sports',
            ],
            'Beauty & Personal Care': [
              'Skincare',
              'Haircare',
              'Makeup',
              'Fragrances',
              'Bath & Body',
              'Personal Grooming',
            ],
            'Books & Media': [
              'Fiction',
              'Non-Fiction',
              'Educational',
              'Comics',
              'Magazines',
              'Digital Content',
            ],
            'Toys & Games': [
              'Action Figures',
              'Board Games',
              'Puzzles',
              'Building Blocks',
              'Educational Toys',
              'Dolls',
            ],
            Automotive: [
              'Car Accessories',
              'Bike Accessories',
              'Tools & Equipment',
              'Cleaning & Maintenance',
              'Electronics & GPS',
            ],
            'Health & Wellness': [
              'Vitamins & Supplements',
              'Medical Devices',
              'Fitness Trackers',
              'Mental Health',
              'Nutrition',
            ],
            'Pet Supplies': [
              'Dog Products',
              'Cat Products',
              'Fish & Aquatic',
              'Pet Food',
              'Pet Toys',
              'Pet Grooming',
            ],
          },
        },
      });
    }
  } catch (error) {
    console.error('Failed to initialize site config:', error);
  }
};

export default initializeConfig;
