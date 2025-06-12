import { Users, BookOpen, Book } from 'lucide-react';

export function getProfileTheme(papel) {
  switch (papel) {
    case 'professor':
      return {
        color: 'purple',
        bg: 'bg-gradient-to-r from-purple-700 to-purple-400',
        avatarBorder: 'border-purple-500',
        icon: <Users size={32} />,
        frase: 'Ensino e inspiração',
      };
    case 'bibliotecario':
      return {
        color: 'green',
        bg: 'bg-gradient-to-r from-green-700 to-green-400',
        avatarBorder: 'border-green-500',
        icon: <BookOpen size={32} />,
        frase: 'Organização e conhecimento',
      };
    default:
      return {
        color: 'blue',
        bg: 'bg-gradient-to-r from-blue-600 to-blue-400',
        avatarBorder: 'border-blue-500',
        icon: <Book size={32} />,
        frase: 'Bem-vindo ao seu espaço de aprendizado!',
      };
  }
} 