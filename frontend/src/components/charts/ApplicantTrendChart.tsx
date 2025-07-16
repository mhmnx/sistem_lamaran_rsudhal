// frontend/src/components/charts/ApplicantTrendChart.tsx
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface ChartData {
  name: string;
  total: number;
}

export function ApplicantTrendChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} />
        <YAxis stroke="#888888" fontSize={12} />
        <Tooltip />
        <Line type="monotone" dataKey="total" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  )
}