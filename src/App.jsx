
import { useState, useEffect } from "react";
import {
  LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { format, parseISO } from "date-fns";

const getInitialData = () => {
  const saved = localStorage.getItem("weightDataByUser");
  return saved ? JSON.parse(saved) : {};
};

const COLORS = ["#a78bfa", "#e0d4fc"];
const LINE_COLORS = { actual: "#4b0082", target: "#d8b4fe", areaFill: "#ede9fe" };

export default function App() {
  const [users, setUsers] = useState(["Damo"]);
  const [activeUser, setActiveUser] = useState("Damo");
  const [dataByUser, setDataByUser] = useState(getInitialData);
  const [newWeight, setNewWeight] = useState("");
  const [logDate, setLogDate] = useState("");

  const userData = dataByUser[activeUser] || {
    startWeight: 116.4,
    goalWeight: 100,
    startDate: "2025-05-04",
    goalDate: "2025-09-27",
    logs: []
  };

  const { startWeight, goalWeight, startDate, goalDate, logs = [] } = userData;

  useEffect(() => {
    localStorage.setItem("weightDataByUser", JSON.stringify(dataByUser));
  }, [dataByUser]);

  const updateUserData = (updates) => {
    setDataByUser({
      ...dataByUser,
      [activeUser]: { ...userData, ...updates },
    });
  };

  const handleAddWeight = () => {
    if (!newWeight || !logDate) return;
    const latest = logs.length > 0 ? logs[logs.length - 1] : null;
    const difference = latest ? (parseFloat(newWeight) - latest.weight).toFixed(1) : 0;
    const progress = (((startWeight - newWeight) / (startWeight - goalWeight)) * 100).toFixed(1);
    const newEntry = {
      date: logDate,
      weight: parseFloat(newWeight),
      change: parseFloat(difference),
      progress: parseFloat(progress),
    };
    const newLogs = [...logs.filter(l => l.date !== logDate), newEntry].sort((a, b) => new Date(a.date) - new Date(b.date));
    updateUserData({ logs: newLogs });
    setNewWeight("");
    setLogDate("");
  };

  const handleDeleteEntry = (entryDate) => {
    const filteredLogs = logs.filter(entry => entry.date !== entryDate);
    updateUserData({ logs: filteredLogs });
  };

  const handleUserChange = (e) => {
    setActiveUser(e.target.value);
  };

  const handleNewUser = () => {
    const newUser = prompt("Enter new user name:");
    if (newUser && !users.includes(newUser)) {
      setUsers([...users, newUser]);
      setActiveUser(newUser);
      setDataByUser({
        ...dataByUser,
        [newUser]: {
          startWeight: 0,
          goalWeight: 0,
          startDate: "",
          goalDate: "",
          logs: [],
        },
      });
    }
  };

  const today = new Date();
  const targetDate = new Date(goalDate);
  const startDateObj = new Date(startDate);
  const totalDays = Math.max(0, Math.ceil((targetDate - startDateObj) / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.max(0, Math.ceil((today - startDateObj) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : startWeight;
  const weightProgress = Math.max(0, Math.min(100, ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100));

  const logMap = Object.fromEntries(logs.map(l => [l.date, l.weight]));
  const fullChartData = [];

  for (let i = 0; i <= totalDays; i++) {
    const date = new Date(startDateObj);
    date.setDate(date.getDate() + i);
    const isoDate = date.toISOString().split("T")[0];
    const target = startWeight - ((startWeight - goalWeight) / totalDays) * i;
    fullChartData.push({
      date: isoDate,
      target: parseFloat(target.toFixed(1)),
      weight: logMap[isoDate] ?? null
    });
  }

  return (
    <div className="min-h-screen bg-purple-50 p-6 text-purple-900">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-700">Weight Tracker</h1>

        <div className="mb-6">
          <label className="block font-medium mb-1">Select User</label>
          <select value={activeUser} onChange={handleUserChange} className="border border-purple-300 p-2 w-full rounded">
            {users.map((user) => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
          <button onClick={handleNewUser} className="mt-2 bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-2 rounded">+ Add User</button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-medium mb-1">Start Weight</label>
            <input type="number" value={startWeight} onChange={(e) => updateUserData({ startWeight: parseFloat(e.target.value) })} className="border border-purple-300 p-2 w-full rounded" />
          </div>
          <div>
            <label className="block font-medium mb-1">Goal Weight</label>
            <input type="number" value={goalWeight} onChange={(e) => updateUserData({ goalWeight: parseFloat(e.target.value) })} className="border border-purple-300 p-2 w-full rounded" />
          </div>
          <div>
            <label className="block font-medium mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => updateUserData({ startDate: e.target.value })} className="border border-purple-300 p-2 w-full rounded" />
          </div>
          <div>
            <label className="block font-medium mb-1">Goal Date</label>
            <input type="date" value={goalDate} onChange={(e) => updateUserData({ goalDate: e.target.value })} className="border border-purple-300 p-2 w-full rounded" />
          </div>
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-1">Log Weight</label>
          <input type="number" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="border border-purple-300 p-2 w-full rounded mb-2" placeholder="Weight" />
          <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} className="border border-purple-300 p-2 w-full rounded mb-2" />
          <button onClick={handleAddWeight} className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded w-full">Save Entry</button>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Progress Chart</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={fullChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(str) => format(parseISO(str), "MMM d")} angle={-30} dy={10} interval={15} />
              <YAxis domain={['auto', 'auto']} tickFormatter={(v) => v.toFixed(1)} />
              <Tooltip formatter={(value) => parseFloat(value).toFixed(1)} labelFormatter={(label) => format(parseISO(label), "MMM d, yyyy")} />
              <Area type="monotone" dataKey="target" stroke={LINE_COLORS.target} fill={LINE_COLORS.areaFill} name="Target" dot={false} />
              <Line type="monotone" dataKey="weight" stroke={LINE_COLORS.actual} name="Actual" strokeWidth={2} dot connectNulls />
            </LineChart>
          </ResponsiveContainer>}
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">Days Remaining</h2>
            {logs.length > 0 && <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={[
                    { name: 'Elapsed', value: daysElapsed },
                    { name: 'Remaining', value: daysRemaining },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name.slice(0, 8)}: ${value.toFixed(1)}`}
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Progress to Goal</h2>
            {logs.length > 0 && <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={[
                    { name: 'Progress', value: parseFloat(weightProgress.toFixed(1)) },
                    { name: 'Remaining', value: parseFloat((100 - weightProgress).toFixed(1)) },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name.slice(0, 8)}: ${value.toFixed(1)}`}
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>}
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
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((entry, index) => (
                <tr key={index} className="hover:bg-purple-50">
                  <td className="border p-2">{entry.date}</td>
                  <td className="border p-2">{entry.weight.toFixed(1)}</td>
                  <td className="border p-2">{entry.change.toFixed(1)}</td>
                  <td className="border p-2">{entry.progress.toFixed(1)}%</td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleDeleteEntry(entry.date)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
