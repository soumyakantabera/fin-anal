import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export const Card = ({ title, children }) => (
  <div className="bg-card rounded-lg p-4 shadow">
    {title ? <h3 className="text-lg font-semibold mb-2">{title}</h3> : null}
    {children}
  </div>
);

export const Stat = ({ label, value }) => (
  <div className="bg-slate-900 rounded p-3">
    <p className="text-xs uppercase text-slate-400">{label}</p>
    <p className="text-xl font-semibold">{value}</p>
  </div>
);

export const Table = ({ columns, rows }) => (
  <div className="table-scroll">
    <table className="min-w-full text-sm">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} className="text-left py-2 text-slate-300">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.id || index} className="border-t border-slate-800">
            {columns.map((col) => (
              <td key={col.key} className="py-2 pr-4">
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const LineChart = ({ labels, datasets, height = 200 }) => (
  <Line
    height={height}
    data={{ labels, datasets }}
    options={{
      responsive: true,
      plugins: { legend: { labels: { color: '#e2e8f0' } } },
      scales: {
        x: { ticks: { color: '#94a3b8' } },
        y: { ticks: { color: '#94a3b8' } },
      },
    }}
  />
);

export const Pill = ({ children }) => (
  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">{children}</span>
);

export const Button = ({ children, ...props }) => (
  <button
    {...props}
    className={`rounded bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 ${
      props.className || ''
    }`}
  >
    {children}
  </button>
);

export const TextInput = ({ label, ...props }) => (
  <label className="text-xs text-slate-400 flex flex-col gap-1">
    {label}
    <input
      {...props}
      className="rounded bg-slate-100 px-2 py-1 text-sm"
      type={props.type || 'text'}
    />
  </label>
);

export const SelectInput = ({ label, options, ...props }) => (
  <label className="text-xs text-slate-400 flex flex-col gap-1">
    {label}
    <select {...props} className="rounded bg-slate-100 px-2 py-1 text-sm">
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

export const InfoTooltip = ({ text }) => (
  <span className="ml-2 text-slate-400" title={text}>
    ⓘ
  </span>
);
