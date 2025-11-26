'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ReferenceLine
} from 'recharts';
import type { ResultsChartProps } from '@/types/results';

export function ResultsChart({ 
  results, 
  candidates, 
  type = 'bar', 
  animated = true, 
  showPercentages = false,
  height = 300 
}: ResultsChartProps) {
  // Combiner les données candidats et résultats
  const chartData = results
    .map(result => {
      const candidate = candidates.find(c => c.id === result.candidateId);
      return candidate ? { 
        ...result, 
        candidate,
        name: candidate.lastName,
        fullName: candidate.fullName,
        party: candidate.party.sigle,
        fill: candidate.party.color
      } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.votes - a.votes);

  // Configuration des couleurs pour les graphiques en secteurs
  const COLORS = chartData.map(data => data.fill);

  // Composant de tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl backdrop-blur-sm min-w-[200px]">
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-5 h-5 rounded-full shadow-sm"
              style={{ backgroundColor: data.fill }}
            />
            <div>
              <p className="font-bold text-gray-900 text-lg">{data.candidate.fullName}</p>
              <p className="text-sm text-gray-500">{data.candidate.party.sigle}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Score :</span>
              <span className="font-bold text-xl" style={{ color: data.fill }}>
                {data.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Voix :</span>
              <span className="font-semibold text-gray-800">
                {data.votes.toLocaleString('fr-FR')}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${data.percentage}%`,
                    backgroundColor: data.fill
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Rendu des graphiques selon le type
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={11}
                stroke="#6b7280"
                interval={0}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                fontSize={11}
                stroke="#6b7280"
                tickFormatter={(value) => value.toLocaleString('fr-FR')}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="votes" 
                radius={[6, 6, 0, 0]}
                animationDuration={animated ? 2000 : 0}
                animationEasing="ease-out"
                maxBarSize={60}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'horizontal-bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart 
              data={chartData} 
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              barGap={10}
              barCategoryGap="15%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} horizontal={true} vertical={false} />
              <XAxis 
                type="number"
                fontSize={11}
                stroke="#6b7280"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 'dataMax + 1000']}
              />
              <YAxis 
                type="category" 
                dataKey="name"
                fontSize={12}
                stroke="#6b7280"
                width={100}
                tick={{ fontSize: 12, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={50}
                iconType="circle"
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value, entry: any) => (
                  <span className="text-sm font-medium" style={{ color: '#4B5563' }}>
                    {entry.payload.fullName}
                  </span>
                )}
              />
              <Bar 
                dataKey="votes" 
                radius={[0, 8, 8, 0]}
                animationDuration={animated ? 2000 : 0}
                animationEasing="ease-out"
                barSize={30}
                label={{ 
                  position: 'right', 
                  formatter: (value: any) => typeof value === 'number' ? value.toLocaleString('fr-FR') : value,
                  fontSize: 11,
                  fontWeight: 600,
                  fill: '#374151'
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={showPercentages ? (props: any) => 
                  props.percent > 0.05 ? `${props.name}: ${(props.percent * 100).toFixed(1)}%` : ''
                : false}
                outerRadius={Math.min(height, 300) / 2 - 20}
                fill="#8884d8"
                dataKey="votes"
                animationDuration={animated ? 2000 : 0}
                animationEasing="ease-out"
                stroke="#ffffff"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={60}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'donut':
        const winner = chartData[0];
        const totalVotes = chartData.reduce((sum, item) => sum + item.votes, 0);
        
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={Math.min(height, 300) / 2 - 20}
                innerRadius={Math.min(height, 300) / 2 - 60}
                fill="#8884d8"
                dataKey="votes"
                animationDuration={animated ? 2000 : 0}
                animationEasing="ease-out"
                stroke="#ffffff"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              
              {/* Texte au centre du donut */}
              <text 
                x="50%" 
                y="45%" 
                textAnchor="middle" 
                className="text-2xl font-bold fill-gray-800"
              >
                {winner?.percentage.toFixed(1)}%
              </text>
              <text 
                x="50%" 
                y="60%" 
                textAnchor="middle" 
                className="text-sm fill-gray-600"
              >
                En tête
              </text>
              
              <Legend 
                verticalAlign="bottom" 
                height={60}
                iconType="circle"
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value, entry: any) => (
                  <span className="text-xs font-medium" style={{ color: '#4B5563' }}>
                    {entry.payload.fullName}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {renderChart()}
    </div>
  );
}
