import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api', 
  withCredentials: true 
});

export default function SuperadminLogsPage() {
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/v1/logs/');
      setLogs(response.data.logs);
    } catch (error) {
      console.error("Gagal memuat log:", error);
      setLogs("Gagal memuat log.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Tampilan Log Aplikasi</h1>
        <Button onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      <Card>
        <CardContent className="p-4">
          <pre className="text-xs bg-gray-900 text-white p-4 rounded-md overflow-x-auto h-[60vh]">
            <code>
              {logs}
            </code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}