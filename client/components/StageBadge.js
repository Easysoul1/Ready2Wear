const STAGE_STYLES = {
  pending: 'ff-badge-primary',
  cutting: 'ff-badge-accent',
  sewing: 'ff-badge-primary',
  finishing: 'ff-badge-accent',
  ready: 'ff-badge-accent',
  active: 'ff-badge-primary',
  completed: 'ff-badge-accent',
  cancelled: 'ff-badge-muted',
  order_update: 'ff-badge-primary',
  deadline: 'ff-badge-accent',
  low_stock: 'ff-badge-accent',
  marketplace: 'ff-badge-primary',
  general: 'ff-badge-muted',
  sent: 'ff-badge-accent',
  failed: 'ff-badge-muted',
}

export default function StageBadge({ value }) {
  const style = STAGE_STYLES[value] || 'ff-badge-muted'
  return (
    <span className={`ff-badge-base ${style}`}>
      {value?.replace('_', ' ') || 'unknown'}
    </span>
  )
}
