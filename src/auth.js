import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      name: 'google',
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'string' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const { email, password } = credentials;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error('No user found');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new Error('Invalid password');
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'credentials') {
        return true;
      }
      if (account.provider === 'google') {
        try {
          const { email, name, id: googleId } = user;

          const existingUser = await prisma.user.findUnique({
            where: { email },
          });

          if (existingUser) {
            await prisma.user.update({
              where: { email },
              data: {
                googleid: googleId,
                provider: 'credentials, google', // Optionally update providers
              },
            });
            user.id = existingUser.id; // Set the user id
          } else {
            const newUser = await prisma.user.create({
              data: {
                email,
                name,
                googleid: googleId,
                provider: 'google',
              },
            });
            user.id = newUser.id; // Set the user id
          }
          return true;
        } catch (error) {
          throw new Error(error);
        }
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.provider = token.provider;
      return session;
    },
  },
});
