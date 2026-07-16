import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    TooltipProps
} from "recharts";

type Project = {
    projectId: number;
    projectName: string;
    leadCount: number;
    unsubscribeLeadCount: number;
    validCount: number;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900/80 backdrop-blur-sm p-4 rounded-lg border border-gray-700 shadow-xl">
                <p className="font-bold text-white mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                        <span className="text-gray-400">{entry.name}:</span>
                        <span className="font-semibold text-white">{entry.value?.toLocaleString('pt-BR')}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function ProjectLeadsBarChart({
                                                 totalLeadsPerProject,
                                             }: {
    totalLeadsPerProject: Project[];
}) {
    const chartData = totalLeadsPerProject.map((proj) => ({
        name: proj.projectName,
        "Total": proj.leadCount,
        "Desinscritos": proj.unsubscribeLeadCount,
        "Válidos": proj.validCount,
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
                barCategoryGap="35%"
            >
                <CartesianGrid stroke="#374151" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#9ca3af"
                    width={120}
                    tick={{ fontSize: 12, fill: '#d1d5db' }}
                    interval={0}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
                />
                <Legend
                    verticalAlign="bottom"
                    wrapperStyle={{ paddingTop: '25px' }}
                />
                <Bar dataKey="Total" fill="#60a5fa" radius={[0, 8, 8, 0]} />
                <Bar dataKey="Válidos" fill="#4ade80" radius={[0, 8, 8, 0]} />
                <Bar dataKey="Desinscritos" fill="#f87171" radius={[0, 8, 8, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
