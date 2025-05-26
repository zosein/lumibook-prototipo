export default function DebugInfo({ isLoggedIn, user, currentPage }) {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-80 text-white p-2 rounded text-xs font-mono z-50">
      <div>Page: {currentPage}</div>
      <div>Logged: {isLoggedIn ? 'Yes' : 'No'}</div>
      <div>Role: {user?.papel || 'None'}</div>
      <div>Name: {user?.nome || 'None'}</div>
    </div>
  );
}