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
  const [users, setUsers] = useState(["User"]);
  const [activeUser, setActiveUser] = useState("User");
  const [dataByUser, setDataByUser] = useState(getInitialData);
  const [newWeight, setNewWeight] = useState("");
  const [newDate, setNewDate] = useState("");

  const userData = dataByUser[activeUser] || {
    startWeight: 116.4,
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
    const newEntry = {
      date: newDate,
      weight: parseFloat(newWeight),
      progress: (((startWeight - newWeight) / (startWeight - goalWeight)) * 100).toFixed(1)
    };
    const updatedLogs = [...logs.filter(log => log.date !== newDate), newEntry].sort((a, b) => new Date(a.date) - new Date(b.date));
    updateUserData({ logs: updatedLogs });
    setNewWeight("");
    setNewDate("");
  };

  const handleDelete = (index) => {
    const updatedLogs = [...logs];
    updatedLogs.splice(index, 1);
    updateUserData({ logs: updatedLogs });
  };

  const handleUserChange = (e) => setActiveUser(e.target.value);

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
  const daysRemaining = Math.max(0, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)));
  const totalDays = Math.ceil((targetDate - startDateObj) / (1000 * 60 * 60 * 24));
  const daysElapsed = totalDays - daysRemaining;
  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : startWeight;
  const weightProgress = Math.max(0, Math.min(100, ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100));

  const chartDates = eachDayOfInterval({ start: startDateObj, end: targetDate });
  const chartData = chartDates.map((date, i) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const actualLog = logs.find(log => log.date === dateStr);
    return {
      date: dateStr,
      weight: actualLog ? actualLog.weight : null,
      target: parseFloat((startWeight - ((startWeight - goalWeight) / totalDays) * i).toFixed(1)),
    };
  });

  return (
    <div className="min-h-screen bg-purple-50 p-6 text-purple-900">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
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
          <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="border border-purple-300 p-2 w-full rounded" />
          <input type="number" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="border border-purple-300 p-2 w-full rounded" placeholder="Weight (kg)" />
        </div>
        <button onClick={handleAddWeight} className="mb-8 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded w-full">Save Entry</button>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Progress Chart</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(tick) => format(parseISO(tick), "MMM d")} />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Area type="monotone" dataKey="target" stroke="#c084fc" fill="#e9d5ff" name="Target" dot={false} />
              <Line type="monotone" dataKey="weight" stroke="#7c3aed" dot={{ r: 4 }} name="Actual" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}