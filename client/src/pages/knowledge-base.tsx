import { useQuery } from "@tanstack/react-query";
import KnowledgeBase from "@/components/knowledge-base";
import type { Analytics } from "@shared/schema";

export default function KnowledgeBasePage() {
  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/analytics'],
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">RM</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900">RareMD Assist</h1>
              </div>
              <span className="text-sm professional-gray">Knowledge Base Management</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-sm text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <KnowledgeBase analytics={analytics} />
      </main>
    </div>
  );
}