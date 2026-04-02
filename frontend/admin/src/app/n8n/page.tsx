'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button, Toast } from '@webdoctruyen/ui';

interface Workflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Execution {
  id: string;
  workflowId: string;
  finished: boolean;
  mode: string;
  startedAt: string;
  stoppedAt: string;
  status: string;
}

interface CrawlerStatus {
  isRunning: boolean;
  currentComic: string | null;
  progress: { completed: number; total: number };
  errors: string[];
  startedAt: string | null;
}

export default function N8nPage() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data: workflowsData, isLoading: loadingWorkflows } = useQuery({
    queryKey: ['n8n-workflows'],
    queryFn: async () => {
      const { data } = await api.get('/n8n/workflows');
      return data;
    },
  });

  const { data: executionsData, isLoading: loadingExecutions } = useQuery({
    queryKey: ['n8n-executions'],
    queryFn: async () => {
      const { data } = await api.get('/n8n/executions');
      return data;
    },
  });

  const { data: statusData, refetch: refetchStatus } = useQuery<{ data: CrawlerStatus }>({
    queryKey: ['crawler-status'],
    queryFn: async () => {
      const { data } = await api.get('/n8n/crawler-status');
      return data;
    },
    refetchInterval: 5000,
  });

  const triggerMutation = useMutation({
    mutationFn: async () => {
      await api.post('/n8n/trigger-crawl', { siteName: 'truyenqq' });
    },
    onSuccess: () => {
      setToast({ message: 'Crawl triggered successfully', type: 'success' });
      refetchStatus();
    },
    onError: () => {
      setToast({ message: 'Failed to trigger crawl', type: 'error' });
    },
  });

  const workflows: Workflow[] = workflowsData?.data?.data || [];
  const executions: Execution[] = executionsData?.data?.data || [];
  const crawlerStatus: CrawlerStatus | null = statusData?.data || null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">n8n & Crawler Monitor</h1>

      {/* Crawler Status */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Crawler Status</h2>
        {crawlerStatus ? (
          <div className="space-y-2 text-sm">
            <p>
              Status:{' '}
              <span className={crawlerStatus.isRunning ? 'font-bold text-green-600' : 'text-gray-500'}>
                {crawlerStatus.isRunning ? 'Running' : 'Idle'}
              </span>
            </p>
            {crawlerStatus.isRunning && (
              <>
                <p>Current: {crawlerStatus.currentComic}</p>
                <p>
                  Progress: {crawlerStatus.progress.completed}/{crawlerStatus.progress.total}
                </p>
              </>
            )}
            {crawlerStatus.errors.length > 0 && (
              <div className="mt-2">
                <p className="font-medium text-red-600">Errors:</p>
                <ul className="ml-4 list-disc text-red-500">
                  {crawlerStatus.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400">Không thể kết nối crawler service</p>
        )}
        <div className="mt-4">
          <Button
            onClick={() => triggerMutation.mutate()}
            isLoading={triggerMutation.isPending}
            disabled={crawlerStatus?.isRunning}
          >
            Trigger Crawl
          </Button>
        </div>
      </div>

      {/* Workflows */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Workflows</h2>
        {loadingWorkflows ? (
          <p className="text-gray-400">Loading...</p>
        ) : workflows.length === 0 ? (
          <p className="text-gray-400">No workflows found. Make sure n8n is running.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-gray-500">
                <tr>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Active</th>
                  <th className="pb-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {workflows.map((wf) => (
                  <tr key={wf.id} className="border-b">
                    <td className="py-2 font-medium">{wf.name}</td>
                    <td className="py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs ${wf.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {wf.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2 text-gray-500">{new Date(wf.updatedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Executions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Recent Executions</h2>
        {loadingExecutions ? (
          <p className="text-gray-400">Loading...</p>
        ) : executions.length === 0 ? (
          <p className="text-gray-400">No executions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-gray-500">
                <tr>
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Mode</th>
                  <th className="pb-2">Started</th>
                  <th className="pb-2">Finished</th>
                </tr>
              </thead>
              <tbody>
                {executions.map((ex) => (
                  <tr key={ex.id} className="border-b">
                    <td className="py-2 font-mono text-xs">{ex.id}</td>
                    <td className="py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                          ex.status === 'success'
                            ? 'bg-green-100 text-green-700'
                            : ex.status === 'error'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {ex.status}
                      </span>
                    </td>
                    <td className="py-2 text-gray-500">{ex.mode}</td>
                    <td className="py-2 text-gray-500">{new Date(ex.startedAt).toLocaleString()}</td>
                    <td className="py-2 text-gray-500">
                      {ex.stoppedAt ? new Date(ex.stoppedAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
