import { BookMarked,LockIcon, UserPlus } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-blue-700 text-white p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BookMarked size={24} />
          <h1 className="text-xl font-bold">LumiBook</h1>
        </div>
        <div className="flex gap-3">
          <button className="bg-sky-500 hover:bg-sky-700 px-3 py-1 rounded flex items-center gap-1">
            <LockIcon size={18} />
            Entrar
          </button>
          <button className="bg-sky-500 hover:bg-sky-700 px-3 py-1 rounded flex items-center gap-1">
            <UserPlus size={18} />
            Cadastrar
          </button>
        </div>
      </div>
    </header>
  );
}