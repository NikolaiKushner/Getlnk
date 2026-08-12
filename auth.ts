import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && profile && "sub" in profile && profile.sub) {
        token.sub = `google_${profile.sub}`;
      }
      if (profile && "picture" in profile && typeof profile.picture === "string") {
        token.picture = profile.picture;
      }
      if (profile && "name" in profile && typeof profile.name === "string") {
        token.name = profile.name;
      }
      if (profile && "email" in profile && typeof profile.email === "string") {
        token.email = profile.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        if (token.email) session.user.email = String(token.email);
        if (token.name) session.user.name = String(token.name);
        if (token.picture) session.user.image = String(token.picture);
      }
      return session;
    },
  },
  trustHost: true,
});
