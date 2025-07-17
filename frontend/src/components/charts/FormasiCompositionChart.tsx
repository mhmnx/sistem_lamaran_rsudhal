// frontend/src/components/charts/FormasiCompositionChart.tsx
import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from "recharts"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function FormasiCompositionChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie data={data} dataKey="jumlah_pelamar" nameKey="nama_formasi" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
          {data.map((index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}