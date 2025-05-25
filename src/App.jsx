
import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const getInitialData = () => {
  const saved = localStorage.getItem("weightDataByUser");
  return saved ? JSON.parse(saved) : {};
};

const COLORS = ["#a78bfa", "#e0d4fc"];

export default function App() {
  const [users, setUsers] = useState(["Damo"]);
  const [activeUser, setActiveUser] = useState("Damo");
  const [dataByUser, setDataByUser] = useState(getInitialData);
  const [newWeight, setNewWeight] = useState("");

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
    if (!newWeight) return;
    const latest = logs && logs.length > 0 ? logs[logs.length - 1] : null;
    const difference = latest ? (parseFloat(newWeight) - latest.weight).toFixed(1) : 0;
    const progress = (((startWeight - newWeight) / (startWeight - goalWeight)) * 100).toFixed(1);
    const newEntry = {
      date: new Date().toISOString().split("T")[0],
      weight: parseFloat(newWeight),
      change: parseFloat(difference),
      progress: parseFloat(progress),
    };
    updateUserData({ logs: [...logs, newEntry] });
    setNewWeight("");
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
  const daysRemaining = Math.max(0, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)));
  const totalDays = Math.ceil((targetDate - startDateObj) / (1000 * 60 * 60 * 24));
  const daysElapsed = totalDays - daysRemaining;
  const currentWeight = logs && logs.length > 0 ? logs[logs.length - 1].weight : startWeight;
  const weightProgress = Math.max(0, Math.min(100, ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100));

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
      </div>
    </div>
  );
}
