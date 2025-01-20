
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
 return (await fetch(`${process.env.URL}/api/db/manage-days`)).json().then((res) =>{
          console.log(res,"ooo")
           if (!credentials) return null;

 
           const { email, password } = credentials;
           console.log(1,email,res[0].email,res[0].password,password)
   console.log(2)
           // Replace with your own validation logic, e.g., database lookup
           if (email === res[0].email && password === res[0].password) {
             return { id: "1", name: res[0].name, email: res[0].email };
           }
           return null;

        });


      

        // If login fails, return null
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin", // Custom sign-in page
  },
  session: {
    strategy: "jwt",
  },
};

export default NextAuth(authOptions);
