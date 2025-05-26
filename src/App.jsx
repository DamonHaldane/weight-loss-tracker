import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#a78bfa", "#e0d4fc"];

export default function App() {
  const [weightLogs, setWeightLogs] = useState([]);
  const [newWeight, setNewWeight] = useState("");
  const [startWeight, setStartWeight] = useState(116.4);
  const [goalWeight, setGoalWeight] = useState(100);
  const [startDate, setStartDate] = useState("2025-05-04");
  const [goalDate, setGoalDate] = useState("2025-09-27");

  useEffect(() => {
    const saved = localStorage.getItem("weightLogs");
    if (saved) setWeightLogs(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("weightLogs", JSON.stringify(weightLogs));
  }, [weightLogs]);

  const handleAddWeight = () => {
    if (!newWeight) return;
    const date = new Date().toISOString().split("T")[0];
    const last = weightLogs[weightLogs.length - 1];
    const change = last ? parseFloat(newWeight) - last.weight : 0;
    const progress = ((startWeight - parseFloat(newWeight)) / (startWeight - goalWeight)) * 100;
    setWeightLogs([...weightLogs, {
      date,
      weight: parseFloat(newWeight),
      change: parseFloat(change.toFixed(1)),
      progress: parseFloat(progress.toFixed(1))
    }]);
    setNewWeight("");
  };

  const today = new Date();
  const goal = new Date(goalDate);
  const start = new Date(startDate);
  const totalDays = Math.ceil((goal - start) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.max(0, totalDays - elapsedDays);
  const latestWeight = weightLogs.length ? weightLogs[weightLogs.length - 1].weight : startWeight;
  const weightProgress = Math.min(100, Math.max(0, ((startWeight - latestWeight) / (startWeight - goalWeight)) * 100));

  const targetData = Array.from({ length: totalDays + 1 }).map((_, i) => {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    return {
      date: day.toISOString().split("T")[0],
      target: startWeight - ((startWeight - goalWeight) / totalDays) * i
    };
  });

  const mergedData = targetData.map(td => {
    const log = weightLogs.find(wl => wl.date === td.date);
    return { ...td, weight: log?.weight };
  });

  return (
    <div className="min-h-screen bg-purple-50 p-6 text-purple-900">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-700">Weight Tracker</h1>

        <div className="mb-6">
          <label className="block font-medium mb-1">Log New Weight</label>
          <input
            type="number"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="border border-purple-300 p-2 w-full rounded"
          />
          <button
            onClick={handleAddWeight}
            className="mt-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded w-full"
          >
            Save Entry
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Progress Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mergedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Line type="monotone" dataKey="target" stroke="#c084fc" fill="#e9d5ff" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="weight" stroke="#7c3aed" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">Days Remaining</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie dataKey="value" data={[
                  { name: "Elapsed", value: elapsedDays },
                  { name: "Remaining", value: remainingDays }
                ]} cx="50%" cy="50%" outerRadius={80} label>
                  {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Progress to Goal</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie dataKey="value" data={[
                  { name: "Progress", value: weightProgress },
                  { name: "Remaining", value: 100 - weightProgress }
                ]} cx="50%" cy="50%" outerRadius={80} label>
                  {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Weight History</h2>
          <table className="w-full border rounded overflow-hidden">
            <thead className="bg-purple-100">
              <tr>
                <th className="border p-2">Date</th>
                <th className="border p-2">Weight (kg)</th>
                <th className="border p-2">Change</th>
                <th className="border p-2">Progress (%)</th>
              </tr>
            </thead>
            <tbody>
              {weightLogs.map((entry, index) => (
                <tr key={index} className="hover:bg-purple-50">
                  <td className="border p-2">{entry.date}</td>
                  <td className="border p-2">{entry.weight}</td>
                  <td className="border p-2">{entry.change}</td>
                  <td className="border p-2">{entry.progress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
