import { ReactNode } from 'react';

interface MainLayoutProps {
  calendar: ReactNode;
  chat: ReactNode;
}

export function MainLayout({ calendar, chat }: MainLayoutProps) {
  return (
    <div className="h-screen flex bg-white">
      {/* Calendar Section - 65% */}
      <div className="w-[65%] border-r border-gray-200">
        {calendar}
      </div>
      
      {/* Chat Section - 35% */}
      <div className="w-[35%]">
        {chat}
      </div>
    </div>
  );
}
