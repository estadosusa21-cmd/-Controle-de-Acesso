
import { Navbar } from '@/components/navbar';
import { PainelControle } from '@/components/painel-controle';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container max-w-screen-xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Painel de Controle</h1>
          <p className="text-gray-600 mt-2">Monitoramento em tempo real do pátio logístico</p>
        </div>
        <PainelControle />
      </main>
    </div>
  );
}
