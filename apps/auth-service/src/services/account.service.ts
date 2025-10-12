import prisma from '../../../../libs/prisma';
import { AuthRole } from './auth-tokens.service';

export type SellerAccount = {
  id: string;
  name: string | null;
  email: string;
  phoneNumber: string | null;
  country: string | null;
  stripeId: string | null;
};

export type UserAccount = {
  id: string;
  name: string | null;
  email: string;
  usertype: string | null;
};

export type AccountRecord = SellerAccount | UserAccount;

export const findAccountByRole = async (
  role: AuthRole,
  id: string
): Promise<AccountRecord | null> => {
  switch (role) {
    case 'seller':
      return prisma.sellers.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          country: true,
          stripeId: true,
        },
      });
    case 'user':
      return prisma.users.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          usertype: true,
        },
      });
    default:
      return null;
  }
};
