import { Link } from 'react-router-dom';

export default function Logo({ size = 'md', linkTo = '/dashboard' }) {
  if (!linkTo) {
    return <span className={`pq-logo pq-logo--${size} pq-logo--static`}>PyQuest</span>;
  }
  return (
    <Link to={linkTo} className={`pq-logo pq-logo--${size}`}>
      PyQuest
    </Link>
  );
}