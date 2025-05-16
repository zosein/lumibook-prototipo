import { BookMarked } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-blue-700 text-white p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BookMarked size={24} />
          <h1 className="text-xl font-bold">LumiBook</h1>
        </div>
        <div className="flex gap-3">
          <button className="text-sm bg-blue-600 px-3 py-1 rounded">Entrar</button>
          <button className="text-sm bg-blue-600 px-3 py-1 rounded">Cadastrar</button>
        </div>
      </div>
    </header>
  );
}