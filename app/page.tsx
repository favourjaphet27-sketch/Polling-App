import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/polls');
  
  // The code below won't execute due to the redirect
  return null;
}
