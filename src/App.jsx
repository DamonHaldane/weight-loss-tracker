
import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { format, parseISO, eachDayOfInterval } from "date-fns";

const COLORS = ["#a78bfa", "#e0d4fc"];

const getInitialData = () => {
  const saved = localStorage.getItem("weightDataByUser");
  return saved ? JSON.parse(saved) : {};
};

export default function App() {
  const [users, setUsers] = useState(["Default"]);
  const [activeUser, setActiveUser] = useState("Default");
  const [dataByUser, setDataByUser] = useState(getInitialData);
  const [newWeight, setNewWeight] = useState("");
  const [newDate, setNewDate] = useState("");

  const userData = dataByUser[activeUser] || {
    startWeight: 120,
    goalWeight: 100,
    startDate: "2025-05-04",
    goalDate: "2025-09-27",
    logs: []
  };

  const { startWeight, goalWeight, startDate, goalDate, logs } = userData;

  useEffect(() => {
    localStorage.setItem("weightDataByUser", JSON.stringify(dataByUser));
  }, [dataByUser]);

  const updateUserData = (updates) => {
    setDataByUser({
      ...dataByUser,
      [activeUser]: { ...userData, ...updates }
    });
  };

  const handleAddWeight = () => {
    if (!newWeight || !newDate) return;
    const parsedDate = new Date(newDate);
    const existingIndex = logs.findIndex(log => log.date === newDate);
    const newEntry = {
      date: newDate,
      weight: parseFloat(newWeight)
    };

    let updatedLogs;
    if (existingIndex !== -1) {
      updatedLogs = [...logs];
      updatedLogs[existingIndex] = newEntry;
    } else {
      updatedLogs = [...logs, newEntry].sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    updateUserData({ logs: updatedLogs });
    setNewWeight("");
    setNewDate("");
  };

  const handleDeleteEntry = (date) => {
    const updatedLogs = logs.filter(entry => entry.date !== date);
    updateUserData({ logs: updatedLogs });
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
          logs: []
        }
      });
    }
  };

  const today = new Date();
  const startDateObj = new Date(startDate);
  const targetDate = new Date(goalDate);
  const daysRemaining = Math.max(0, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)));
  const totalDays = Math.ceil((targetDate - startDateObj) / (1000 * 60 * 60 * 24));
  const daysElapsed = totalDays - daysRemaining;
  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : startWeight;
  const weightProgress = Math.max(0, Math.min(100, ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100));

  const chartDates = eachDayOfInterval({ start: startDateObj, end: targetDate }).map(date => ({
    date: format(date, "yyyy-MM-dd")
  }));

  const progressData = chartDates.map((d, i) => {
    const actual = logs.find(l => l.date === d.date);
    return {
      date: d.date,
      weight: actual ? actual.weight : null,
      target: parseFloat((startWeight - ((startWeight - goalWeight) / totalDays) * i).toFixed(1))
    };
  });

  return (
    <div className="min-h-screen bg-purple-50 p-6 text-purple-900">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-700">Weight Tracker</h1>

        <div className="mb-6">
          <label className="block font-medium mb-1">Select User</label>
          <select value={activeUser} onChange={handleUserChange} className="border border-purple-300 p-2 w-full rounded">
            {users.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
          <button onClick={handleNewUser} className="mt-2 bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-2 rounded">+ Add User</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-medium mb-1">Log New Weight</label>
            <input
              type="number"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="border border-purple-300 p-2 w-full rounded"
              placeholder="Weight (kg)"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="border border-purple-300 p-2 w-full rounded"
            />
          </div>
        </div>
        <button
          onClick={handleAddWeight}
          className="mb-8 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded w-full"
        >
          Save Entry
        </button>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Progress Chart</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(str) => format(parseISO(str), "MMM d")} />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Area type="monotone" dataKey="target" stroke="#c084fc" fill="#e9d5ff" name="Target Trend" dot={false} />
              <Line type="monotone" dataKey="weight" stroke="#7c3aed" dot={{ stroke: '#7c3aed', strokeWidth: 2 }} name="Actual" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">Days Remaining</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={[
                    { name: 'Elapsed', value: daysElapsed },
                    { name: 'Remaining', value: daysRemaining }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Progress to Goal</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={[
                    { name: 'Progress', value: weightProgress },
                    { name: 'Remaining', value: 100 - weightProgress }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
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
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((entry, index) => (
                <tr key={index} className="hover:bg-purple-50">
                  <td className="border p-2">{entry.date}</td>
                  <td className="border p-2">{entry.weight}</td>
                  <td className="border p-2 text-center">
                    <button onClick={() => handleDeleteEntry(entry.date)} className="text-red-500 hover:underline">Delete</button>
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
