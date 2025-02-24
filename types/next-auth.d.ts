import 'next-auth';
import { User } from '@/db/schema';

declare module 'next-auth' {
  interface Session {
    user: User & {
      id: string;
    };
  }
}
