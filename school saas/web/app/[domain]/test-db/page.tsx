import { testDatabaseConnection } from '@/lib/actions/test-db'

export default async function TestPage() {
    const results = await testDatabaseConnection()

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>

            <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border">
                    <h2 className="font-semibold mb-2">Connection Status</h2>
                    <p className={results.success ? 'text-green-600' : 'text-red-600'}>
                        {results.success ? '✅ Connected' : '❌ Failed'}
                    </p>
                    {!results.success && (
                        <p className="text-red-600 text-sm mt-2">Error: {results.error}</p>
                    )}
                </div>

                {results.success && results.results && (
                    <>
                        <div className="p-4 bg-white rounded-lg border">
                            <h2 className="font-semibold mb-2">Tenants Table</h2>
                            <p>Records found: {results.results.tenants.count}</p>
                            {results.results.tenants.error && (
                                <p className="text-red-600 text-sm">Error: {results.results.tenants.error}</p>
                            )}
                        </div>

                        <div className="p-4 bg-white rounded-lg border">
                            <h2 className="font-semibold mb-2">Students Table</h2>
                            <p>Records found: {results.results.students.count}</p>
                            {results.results.students.error && (
                                <p className="text-red-600 text-sm">Error: {results.results.students.error}</p>
                            )}
                        </div>

                        <div className="p-4 bg-white rounded-lg border">
                            <h2 className="font-semibold mb-2">Lessons Table</h2>
                            <p>Records found: {results.results.lessons.count}</p>
                            {results.results.lessons.error && (
                                <p className="text-red-600 text-sm">Error: {results.results.lessons.error}</p>
                            )}
                        </div>

                        <div className="p-4 bg-white rounded-lg border">
                            <h2 className="font-semibold mb-2">Student Progress Table</h2>
                            <p>Records found: {results.results.progress.count}</p>
                            {results.results.progress.error && (
                                <p className="text-red-600 text-sm">Error: {results.results.progress.error}</p>
                            )}
                        </div>

                        <div className="p-4 bg-white rounded-lg border">
                            <h2 className="font-semibold mb-2">Student Activities Table</h2>
                            <p>Records found: {results.results.activities.count}</p>
                            {results.results.activities.error && (
                                <p className="text-red-600 text-sm">Error: {results.results.activities.error}</p>
                            )}
                        </div>
                    </>
                )}

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-6">
                    <h2 className="font-semibold mb-2">What This Means</h2>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>If you see errors about tables not existing, run <code className="bg-gray-100 px-1">migration.sql</code> in Supabase</li>
                        <li>If tables exist but show 0 records, run <code className="bg-gray-100 px-1">complete_setup.sql</code> in Supabase</li>
                        <li>If everything shows data, the dashboard should work - try hard refresh (Ctrl+Shift+R)</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
