import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function BadmintonAppFullScoreLimit() {
  const [step, setStep] = useState(1);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);

  const availablePlayers = ['Simon', 'Jason', '小瑞', '承訓', '威威', '下巴', '彥霖', '仲儀', '馬克'];

  const fixedSchedules: Record<number, number[][]> = {
    8: [
      [1, 5, 2, 6], [3, 7, 4, 8], [1, 7, 2, 8], [3, 5, 4, 6],
      [1, 6, 3, 8], [2, 5, 4, 7], [1, 4, 5, 8], [2, 3, 6, 7],
      [1, 8, 2, 7], [3, 6, 4, 5]
    ],
    7: [
      [1, 2, 3, 4], [5, 6, 7, 1], [2, 3, 4, 5], [6, 7, 1, 3],
      [2, 4, 5, 7], [1, 5, 3, 6], [2, 6, 4, 7], [3, 5, 1, 4], [2, 7, 5, 6]
    ]
  };

  const handleSelectPlayer = (name: string) => {
    const exists = selectedPlayers.includes(name);
    let next = exists
      ? selectedPlayers.filter(p => p !== name)
      : [...selectedPlayers, name];
    if (next.length <= playerCount) setSelectedPlayers(next);
  };

  const generateMatches = () => {
    const template = fixedSchedules[playerCount];
    if (!template) return;
    const schedule = template.map((team) => {
      const [a, b, c, d] = team;
      return {
        team1Score: 21,
        team2Score: 21,
        players: [[selectedPlayers[a - 1], selectedPlayers[b - 1]], [selectedPlayers[c - 1], selectedPlayers[d - 1]]]
      };
    });
    setMatches(schedule);
    setStep(3);
  };

  const handleScoreChange = (idx: number, team: number, score: number) => {
    const updated = [...matches];
    if (team === 1) updated[idx].team1Score = score;
    else updated[idx].team2Score = score;
    setMatches(updated);
  };

  const calculateRanking = () => {
    const playerStats: Record<string, { score: number; count: number }> = {};

    for (const match of matches) {
      const [team1, team2] = match.players;

      [...team1, ...team2].forEach(p => {
        if (!playerStats[p]) playerStats[p] = { score: 0, count: 0 };
      });

      team1.forEach(p => {
        if (playerStats[p].count < 5) {
          playerStats[p].score += match.team1Score;
          playerStats[p].count++;
        }
      });
      team2.forEach(p => {
        if (playerStats[p].count < 5) {
          playerStats[p].score += match.team2Score;
          playerStats[p].count++;
        }
      });
    }

    const results = Object.entries(playerStats).map(([name, data]) => ({
      name,
      score: data.score
    })).sort((a, b) => b.score - a.score);

    setRankings(results);
    setStep(4);
  };

  return (
    <div className="px-4 py-6 space-y-6 max-w-full sm:max-w-xl mx-auto bg-green-50 rounded-xl border border-green-200 shadow overflow-hidden">
      <div className="text-sm text-muted-foreground">🎯 目前進度：Step {step}/4</div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">🏸 1️⃣ 選擇參賽人數</h2>
          <div className="flex gap-4">
            <Button onClick={() => { setPlayerCount(7); setStep(2); }}>7 人</Button>
            <Button onClick={() => { setPlayerCount(8); setStep(2); }}>8 人</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">🏸 2️⃣ 選擇 {playerCount} 位參賽者</h2>
          <div className="grid grid-cols-2 gap-2">
            {availablePlayers.map(name => (
              <Button
                key={name}
                variant={selectedPlayers.includes(name) ? 'default' : 'outline'}
                onClick={() => handleSelectPlayer(name)}
              >
                {name}
              </Button>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">✅ 已選擇：{selectedPlayers.length} 位</div>
          <div className="flex gap-2">
            <Button onClick={() => setStep(1)}>🔙 上一步</Button>
            <Button disabled={selectedPlayers.length !== playerCount} onClick={generateMatches}>📋 產生賽程</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">🥇 3️⃣ 輸入比賽分數</h2>
          {matches.map((m, i) => (
            <div key={i} className="space-y-2 bg-white p-4 rounded-xl border shadow-sm">
              <div className="text-green-700 font-semibold">第 {i + 1} 場</div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                {/* 左隊 */}
                <div className="text-center">
                  <div className="font-medium">{m.players[0][0]}</div>
                  <div className="font-medium">{m.players[0][1]}</div>
                  <Input
                    className="mt-1 text-center w-full"
                    type="text"
                    inputMode="numeric"
                    value={m.team1Score === 0 ? '' : m.team1Score}
                    onChange={e => {
                      const value = parseInt(e.target.value, 10);
                      handleScoreChange(i, 1, isNaN(value) ? 0 : value);
                    }}
                  />
                </div>

                {/* VS */}
                <div className="text-center font-extrabold text-gray-500 text-lg">VS</div>

                {/* 右隊 */}
                <div className="text-center">
                  <div className="font-medium">{m.players[1][0]}</div>
                  <div className="font-medium">{m.players[1][1]}</div>
                  <Input
                    className="mt-1 text-center w-full"
                    type="text"
                    inputMode="numeric"
                    value={m.team2Score === 0 ? '' : m.team2Score}
                    onChange={e => {
                      const value = parseInt(e.target.value, 10);
                      handleScoreChange(i, 2, isNaN(value) ? 0 : value);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setStep(2)}>🔙 上一步</Button>
            <Button onClick={calculateRanking}>📊 結算排名</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">🏆 最終排名（每人前五場得分）</h2>
          {rankings.map((p, idx) => {
            const lastFour = rankings.slice(-4).map(r => r.name);
            const isBottom = lastFour.includes(p.name);
            return (
              <div
                key={p.name}
                className={`flex justify-between items-center p-2 rounded ${isBottom ? 'bg-red-100 border border-red-400' : 'bg-white'}`}
              >
                <span className="font-medium">{idx + 1}. {p.name}</span>
                <span className="font-bold text-gray-800">{p.score} 分</span>
              </div>
            );
          })}
          <Button onClick={() => setStep(3)}>🔙 上一步：修改分數</Button>
        </div>
      )}
    </div>
  );
}
