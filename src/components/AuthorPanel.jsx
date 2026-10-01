import { pointCount } from '../lib/api.js'

export default function AuthorPanel({ author, blueprints, selected, onSelect }) {
  const total = blueprints.reduce((acc, bp) => acc + pointCount(bp), 0)
  return (
    <div style={{ minWidth: 240 }}>
      <h3 style={{ marginTop: 0 }}>Planos de {author || '—'}</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
            <th>Plano</th>
            <th>Puntos</th>
          </tr>
        </thead>
        <tbody>
          {blueprints.map((bp) => (
            <tr
              key={bp.name}
              onClick={() => onSelect(bp.name)}
              style={{ cursor: 'pointer', background: bp.name === selected ? '#dbeafe' : 'transparent' }}
            >
              <td>{bp.name}</td>
              <td>{pointCount(bp)}</td>
            </tr>
          ))}
          {blueprints.length === 0 && (
            <tr>
              <td colSpan={2} style={{ opacity: 0.6 }}>Sin planos</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: '1px solid #ddd', fontWeight: 600 }}>
            <td>Total</td>
            <td>{total}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
