import { redirect } from 'next/navigation';

export default function ImportHotelsPage() {
  redirect('/admin/hotels?view=import');
}
