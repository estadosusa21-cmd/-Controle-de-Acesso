
import { Navbar } from '@/components/navbar';
import { HistoricoCompleto } from '@/components/historico-completo';

export default function HistoricoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container max-w-screen-xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Histórico Completo</h1>
          <p className="text-gray-600 mt-2">Todos os registros de entrada e saída</p>
        </div>
        <HistoricoCompleto />
      </main>
    </div>
  );
}
