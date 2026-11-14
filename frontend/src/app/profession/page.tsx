import { redirect } from 'next/navigation';

export default function ProfessionPage() {
  redirect('/shop?section=profession#profession');
}
