
import { useState, useEffect } from "react";

const getInitialData = () => {
  const saved = localStorage.getItem("weightData");
  return saved ? JSON.parse(saved) : [];
};

export default function App() {
  const [startWeight, setStartWeight] = useState(116.4);
  const [goalWeight, setGoalWeight] = useState(100);
  const [weightLogs, setWeightLogs] = useState(getInitialData);
  const [newWeight, setNewWeight] = useState("");
  const [startDate, setStartDate] = useState("2025-05-04");
  const [goalDate, setGoalDate] = useState("2025-09-27");

  useEffect(() => {
    localStorage.setItem("weightData", JSON.stringify(weightLogs));
  }, [weightLogs]);

  const handleAddWeight = () => {
    if (!newWeight) return;
    const latestEntry = weightLogs[weightLogs.length - 1];
    const difference = latestEntry ? (parseFloat(newWeight) - latestEntry.weight).toFixed(1) : 0;
    const progress = (((startWeight - newWeight) / (startWeight - goalWeight)) * 100).toFixed(1);

    const newEntry = {
      date: new Date().toISOString().split("T")[0],
      weight: parseFloat(newWeight),
      change: parseFloat(difference),
      progress: parseFloat(progress),
    };

    setWeightLogs([...weightLogs, newEntry]);
    setNewWeight("");
  };

  return (
    <div className="max-w-xl mx-auto p-4 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Weight Loss Tracker</h1>

      <div className="mb-4">
        <label className="block font-medium">Start Weight (kg)</label>
        <input
          type="number"
          value={startWeight}
          onChange={(e) => setStartWeight(parseFloat(e.target.value))}
          className="border p-2 w-full"
        />
        <label className="block font-medium mt-2">Goal Weight (kg)</label>
        <input
          type="number"
          value={goalWeight}
          onChange={(e) => setGoalWeight(parseFloat(e.target.value))}
          className="border p-2 w-full"
        />
        <label className="block font-medium mt-2">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 w-full"
        />
        <label className="block font-medium mt-2">Goal Date</label>
        <input
          type="date"
          value={goalDate}
          onChange={(e) => setGoalDate(e.target.value)}
          className="border p-2 w-full"
        />
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
            {weightLogs.map((entry, index) => (
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
