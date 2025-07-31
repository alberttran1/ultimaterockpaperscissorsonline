import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

const pieData = [
  { name: "Rock", value: 300 },
  { name: "Paper", value: 200 },
  { name: "Scissors", value: 100 },
];

const lineData = [
  { day: "Mon", Rock: 30, Paper: 20, Scissors: 10 },
  { day: "Tue", Rock: 20, Paper: 25, Scissors: 15 },
  { day: "Wed", Rock: 40, Paper: 15, Scissors: 25 },
  { day: "Thu", Rock: 10, Paper: 30, Scissors: 20 },
  { day: "Fri", Rock: 25, Paper: 20, Scissors: 30 },
  { day: "Sat", Rock: 35, Paper: 10, Scissors: 25 },
  { day: "Sun", Rock: 20, Paper: 35, Scissors: 15 },
];

const barData = [{ name: "Wins", Rock: 5, Paper: 8, Scissors: 3 }];

const Graphs = () => {
  return (
    <div className=" bg-[#2c1a4f] text-white font-sans">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-[100%] mx-auto space-y-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {/* Pie Chart */}
          <div className="bg-[#3b2566] p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold text-center mb-4">
              RPS Ratio
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart */}
          <div className="bg-[#3b2566] p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold text-center mb-4">
              Plays Over the Week
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="day" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Rock" stroke="#8884d8" />
                <Line type="monotone" dataKey="Paper" stroke="#82ca9d" />
                <Line type="monotone" dataKey="Scissors" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-[#3b2566] p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold text-center mb-4">
              Wins Today
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="name" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Legend />
                <Bar dataKey="Rock" fill="#8884d8" />
                <Bar dataKey="Paper" fill="#82ca9d" />
                <Bar dataKey="Scissors" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Graphs;
