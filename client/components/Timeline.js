import StageBadge from '@/components/StageBadge'

export default function Timeline({ logs = [] }) {
  if (!logs.length) {
    return <p className="text-sm ff-text-secondary">No timeline updates yet.</p>
  }

  return (
    <ol className="space-y-3">
      {logs.map((log) => (
        <li key={log.id} className="ff-card p-3">
          <div className="flex items-center justify-between gap-3">
            <StageBadge value={log.stage} />
            <span className="text-xs ff-text-secondary">
              {new Date(log.created_at).toLocaleString()}
            </span>
          </div>
          {log.message ? <p className="mt-2 text-sm ff-text-primary">{log.message}</p> : null}
          {log.changed_by?.email ? (
            <p className="mt-1 text-xs ff-text-secondary">Updated by {log.changed_by.email}</p>
          ) : null}
        </li>
      ))}
    </ol>
  )
}
