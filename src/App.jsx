
// src/App.jsx
import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const getInitialData = () => {
  const saved = localStorage.getItem("weightDataByUser");
  return saved ? JSON.parse(saved) : {};
};

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

  const { startWeight, goalWeight, startDate, goalDate, logs } = userData;

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
    const latest = logs[logs.length - 1];
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
    const selected = e.target.value;
    setActiveUser(selected);
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

  return (
    <div className="max-w-xl mx-auto p-4 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Weight Tracker</h1>

      <div className="mb-4">
        <label className="block font-medium mb-1">Select User</label>
        <select value={activeUser} onChange={handleUserChange} className="border p-2 w-full mb-2">
          {users.map((user) => (
            <option key={user} value={user}>{user}</option>
          ))}
        </select>
        <button onClick={handleNewUser} className="bg-gray-200 px-3 py-1 rounded">+ Add User</button>
      </div>

      <div className="mb-4">
        <label className="block font-medium">Log New Weight</label>
        <input
          type="number"
          value={newWeight}
          onChange={(e) => setNewWeight(e.target.value)}
          className="border p-2 w-full"
        />
        <button
          onClick={handleAddWeight}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save Entry
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Progress Chart</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={logs}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Line type="monotone" dataKey="weight" stroke="#8884d8" name="Weight (kg)" />
            <Line type="monotone" dataKey={() => goalWeight} stroke="#82ca9d" name="Goal" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">History</h2>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">Weight (kg)</th>
              <th className="border p-2">Change</th>
              <th className="border p-2">Progress (%)</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((entry, index) => (
              <tr key={index}>
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
  );
}
