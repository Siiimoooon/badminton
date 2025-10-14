import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// ✨ 進度條元件
const ProgressBar = ({ current, total }) => {
    if (total === 0) return null;
    const dots = Array.from({ length: total }, (_, i) => (
        <div
            key={i}
            className={`w-5 h-5 rounded-full transition-colors duration-300 ${
                i < current ? 'bg-green-500' : 'bg-gray-300'
            }`}
        ></div>
    ));
    return <div className="flex justify-center gap-2 my-2">{dots}</div>;
};

// --- 主要應用程式元件 ---
export default function BadmintonAppFullScoreLimit() {
  const [step, setStep] = useState(1);
  const [playerCount, setPlayerCount] = useState(0);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [assignmentMode, setAssignmentMode] = useState('random');

  const availablePlayers = ['Simon', 'Jason', '小瑞', '承訓', '威威', '下巴', '彥霖', '仲儀', '馬克'];

  const fixedSchedules = {
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

  const handleSelectPlayer = (name) => {
    const isSelected = selectedPlayers.includes(name);
    if (assignmentMode === 'random') {
      let next = isSelected
        ? selectedPlayers.filter(p => p !== name)
        : [...selectedPlayers, name];
      if (next.length <= playerCount) setSelectedPlayers(next);
    } else { 
      if (!isSelected && selectedPlayers.length < playerCount) setSelectedPlayers([...selectedPlayers, name]);
    }
  };
  
  const generateMatches = () => {
    const template = fixedSchedules[playerCount];
    if (!template) return;
    let playersForSchedule = assignmentMode === 'random' ? [...selectedPlayers].sort(() => Math.random() - 0.5) : selectedPlayers;
    const schedule = template.map(([a, b, c, d]) => ({
      team1Score: 21,
      team2Score: 21,
      players: [[playersForSchedule[a - 1], playersForSchedule[b - 1]], [playersForSchedule[c - 1], playersForSchedule[d - 1]]]
    }));
    setMatches(schedule);
    setStep(3);
  };

  const handleScoreChange = (idx, team, score) => {
    const updated = [...matches];
    if (team === 1) updated[idx].team1Score = score;
    else updated[idx].team2Score = score;
    setMatches(updated);
  };

  const calculateRanking = () => {
    const playerStats = {};

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

  // ✨ 「重新開始」功能
  const handleRestart = () => {
      setStep(1);
      setPlayerCount(0);
      setSelectedPlayers([]);
      setMatches([]);
      setRankings([]);
      setAssignmentMode('random');
  };


  return (
    <div className="px-4 py-6 space-y-6 max-w-full sm:max-w-xl mx-auto bg-green-50 rounded-xl border border-green-200 shadow-lg overflow-hidden">
      <div className="text-sm text-slate-500">🎯 目前進度：Step {step}/4</div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">🏸 1️⃣ 選擇參賽人數</h2>
          <div className="flex gap-4">
            <Button onClick={() => { setPlayerCount(7); setStep(2); setSelectedPlayers([]); }}>7 人</Button>
            <Button onClick={() => { setPlayerCount(8); setStep(2); setSelectedPlayers([]); }}>8 人</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">🏸 2️⃣ 選擇 {playerCount} 位參賽者</h2>
          <div className='p-1 bg-gray-200 rounded-lg flex gap-1'>
            <Button className='flex-1' variant={assignmentMode === 'random' ? 'default' : 'ghost'} onClick={() => { setAssignmentMode('random'); setSelectedPlayers([]); }}>隨機編號</Button>
            <Button className='flex-1' variant={assignmentMode === 'ordered' ? 'default' : 'ghost'} onClick={() => { setAssignmentMode('ordered'); setSelectedPlayers([]); }}>依序編號</Button>
          </div>
          
          <div className="text-center my-2 space-y-2">
              <div className="text-sm text-slate-600 font-medium">✅ 已選擇 {selectedPlayers.length} / {playerCount} 位</div>
              <ProgressBar current={selectedPlayers.length} total={playerCount} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availablePlayers.map(name => (
              <Button key={name} variant={selectedPlayers.includes(name) ? 'default' : 'outline'} onClick={() => handleSelectPlayer(name)} disabled={assignmentMode === 'ordered' && selectedPlayers.length >= playerCount && !selectedPlayers.includes(name)}>{name}</Button>
            ))}
          </div>

          {assignmentMode === 'ordered' && (
            <div className='space-y-2'>
              <div className="text-sm text-slate-500">請依序點擊球員，點擊順序即為編號順序 (1, 2, 3...)。</div>
              <div className='p-3 bg-white rounded-lg border'>
                <h3 className='font-semibold mb-2'>已選順序：</h3>
                {selectedPlayers.length > 0 ? (
                  <ol className='list-decimal list-inside space-y-1'>
                    {selectedPlayers.map((name, index) => (
                      <li key={index}>{name}</li>
                    ))}
                  </ol>
                ) : (
                  <div className='text-gray-500'>尚未選擇</div>
                )}
              </div>
              <Button variant="destructive" size="sm" onClick={() => setSelectedPlayers([])}>🗑️ 清除重選</Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>🔙 上一步</Button>
            <Button disabled={selectedPlayers.length !== playerCount} onClick={generateMatches}>📋 產生賽程</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">🥇 3️⃣ 輸入比賽分數</h2>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {matches.map((m, i) => (
            <div key={i} className="space-y-2 bg-white p-4 rounded-xl border shadow-sm">
              <div className="text-green-700 font-semibold">第 {i + 1} 場</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="text-center space-y-1">
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
                <div className="text-center font-extrabold text-gray-500 text-lg hidden sm:block">VS</div>
                <div className="text-center space-y-1">
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
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setStep(2)}>🔙 上一步</Button>
            <Button onClick={calculateRanking}>📊 結算排名</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">🏆 最終排名</h2>
          <p className="text-sm text-slate-500">僅計算每位選手的前五場比賽得分</p>
          <div className="space-y-2">
          {rankings.map((p, idx) => {
            const lastFour = rankings.slice(-4).map(r => r.name);
            const isBottom = lastFour.includes(p.name);
            const rankEmoji = ["🥇", "🥈", "🥉"];
            return (
              <div key={p.name} className={`flex justify-between items-center p-3 rounded-lg text-base ${isBottom ? 'bg-red-100 border border-red-300' : 'bg-white border'}`}>
                <span className="font-medium">{idx < 3 ? rankEmoji[idx] : <span className="inline-block w-6 text-center">{idx + 1}.</span>}{p.name}</span>
                <span className="font-bold text-gray-800">{p.score} 分</span>
              </div>
            );
          })}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setStep(3)} className="flex-1">🔙 上一步：修改分數</Button>
            <Button onClick={handleRestart} className="flex-1">🏸 開始新的一局</Button>
          </div>
        </div>
      )}
    </div>
  );
}  

