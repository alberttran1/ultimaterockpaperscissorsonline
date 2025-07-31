import React from "react";

type Player = {
  id: string;
  name: string;
  wins: number;
  losses: number;
  rating: number;
};

type LeaderboardTableProps = {
  leaderboard: Player[];
  currentUserId?: string;
};

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  leaderboard,
  currentUserId,
}) => {
  return (
    <div className="overflow-x-auto w-full bg-[#2c1a4f] p-6 rounded-2xl text-white font-sans">
      <table className="min-w-full text-sm border-separate border-spacing-y-2">
        <thead className="bg-[#3b2566] text-purple-200">
          <tr>
            <th className="px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Player</th>
            <th className="px-4 py-3 text-center">Wins</th>
            <th className="px-4 py-3 text-center">Losses</th>
            <th className="px-4 py-3 text-center">Win Rate</th>
            <th className="px-4 py-3 text-center">Rating</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((player, index) => {
            const totalGames = player.wins + player.losses;
            const winRate =
              totalGames > 0
                ? ((player.wins / totalGames) * 100).toFixed(1)
                : "0.0";
            const isCurrentUser = player.id === currentUserId;

            return (
              <tr
                key={player.id}
                className={`transition-colors ${
                  isCurrentUser
                    ? "bg-yellow-300 text-black font-bold"
                    : "bg-[#472d7c] hover:bg-[#5a3d9e]"
                }`}
              >
                <td className="px-4 py-2 rounded-l-lg">{index + 1}</td>
                <td className="px-4 py-2">{player.name}</td>
                <td className="px-4 py-2 text-center">{player.wins}</td>
                <td className="px-4 py-2 text-center">{player.losses}</td>
                <td className="px-4 py-2 text-center">{winRate}%</td>
                <td className="px-4 py-2 text-center rounded-r-lg">
                  {player.rating}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
