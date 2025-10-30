import React, { useState, useEffect } from 'react';

// --- 簡易 UI 元件 (用於 Canvas 預覽) ---
// 為了讓預覽功能正常運作，我們用簡易的 HTML 元件模擬 shadcn/ui 的外觀
// ... (Button, Input, ProgressBar, MatchPreview, ScoreInput 元件程式碼... 保持不變) ...
const Button = ({ className = '', variant = 'default', size = 'default', onClick, disabled, children }) => {
  // 基本樣式
  let baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed border shadow-sm inline-flex items-center justify-center";

  // 變體樣式
  let variantStyles = "";
  switch (variant) {
    case 'destructive':
      variantStyles = "bg-red-500 text-white hover:bg-red-600 border-transparent";
      break;
    case 'outline':
      variantStyles = "bg-white text-slate-700 border-slate-300 hover:bg-slate-50";
      break;
    case 'ghost':
      variantStyles = "bg-transparent text-slate-700 border-transparent hover:bg-slate-100";
      break;
    case 'default':
    default:
      variantStyles = "bg-blue-600 text-white hover:bg-blue-700 border-transparent";
  }

  // 尺寸樣式
  let sizeStyles = "";
  switch (size) {
    case 'sm':
      sizeStyles = "px-3 py-1.5 text-sm";
      break;
    case 'lg':
      sizeStyles = "px-6 py-3 text-lg";
      break;
    case 'icon':
      sizeStyles = "w-9 h-9 p-0";
      break;
    default:
      break;
  }
  
  // 圓形按鈕 (針對 +/-)
  if (className.includes('rounded-full')) {
    sizeStyles += " w-10 h-10 rounded-full";
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = ({ className = '', type = 'text', inputMode, value, onChange, onKeyDown, placeholder, disabled }) => {
  const baseStyles = "w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50";
  
  return (
    <input
      className={`${baseStyles} ${className}`}
      type={type}
      inputMode={inputMode}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

// --- UI/UX 優化元件 ---

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

// ✨ 對戰預覽元件
const MatchPreview = ({ playerCount, selectedPlayers, schedules }) => {
  if (playerCount === 0) return null;

  const scheduleTemplate = schedules[playerCount];
  if (!scheduleTemplate) return null;

  const firstTwoMatches = scheduleTemplate.slice(0, 2);

  const getPlayerName = (playerNumber) => {
    return selectedPlayers[playerNumber - 1] || `編號 ${playerNumber}`;
  };

  return (
    <div className='p-3 bg-blue-50 rounded-lg border border-blue-200 mt-2'>
      <h3 className='font-semibold mb-2 text-blue-800'>前兩場對戰預覽：</h3>
      <div className='space-y-2'>
        {firstTwoMatches.map((match, index) => {
          const [p1, p2, p3, p4] = match;
          return (
            <div key={index} className='text-sm text-slate-700'>
              <strong>第 {index + 1} 場:</strong>
              <span className='ml-2'>{getPlayerName(p1)} & {getPlayerName(p2)}</span>
              <span className='font-bold mx-2 text-blue-600'>VS</span>
              <span>{getPlayerName(p3)} & {getPlayerName(p4)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ✨ [手機優化] 帶有 +/- 按鈕的分數輸入元件
const ScoreInput = ({ score, onScoreChange }) => {
  const handleIncrement = () => onScoreChange(score + 1);
  const handleDecrement = () => onScoreChange(Math.max(0, score - 1));

  return (
    <div className="flex items-center justify-center gap-2 mt-2">
      <Button size="sm" variant="outline" className="w-10 h-10 rounded-full text-lg" onClick={handleDecrement}>-</Button>
      <Input
        className="text-center w-16 h-12 text-2xl font-bold border-2 focus:ring-2 focus:ring-green-500"
        type="text"
        inputMode="numeric"
        value={score === 0 ? '' : score}
        onChange={e => {
          const value = parseInt(e.target.value, 10);
          onScoreChange(isNaN(value) ? 0 : value);
        }}
      />
      <Button size="sm" variant="outline" className="w-10 h-10 rounded-full text-lg" onClick={handleIncrement}>+</Button>
    </div>
  );
};


// --- 主要應用程式元件 ---
export default function BadmintonAppFullScoreLimit() {

  // ✨ 1. 從 localStorage 讀取初始狀態
  const getInitialState = () => {
    try {
      const savedState = localStorage.getItem('badmintonAppState');
      if (savedState) {
        // 如果有儲存的狀態，解析它
        const parsedState = JSON.parse(savedState);
        // ✨ 載入 allPlayers，如果不存在則使用預設值
        if (!parsedState.allPlayers) {
          parsedState.allPlayers = ['Simon', 'Jason', '小瑞', '承訓', '威威', '下巴', '彥霖', '仲儀', '馬克'];
        }
        return parsedState;
      }
    } catch (e) {
      console.error("無法讀取儲存的狀態", e);
    }
    // 如果沒有儲存過或讀取失敗，回傳預設值
    return {
      step: 1,
      playerCount: 0,
      selectedPlayers: [],
      matches: [],
      rankings: [],
      assignmentMode: 'random',
      playoffMatch: null,
      // ✨ 預設 allPlayers
      allPlayers: ['Simon', 'Jason', '小瑞', '承訓', '威威', '下巴', '彥霖', '仲儀', '馬克'],
    };
  };

  const initialState = getInitialState();

  // ✨ 2. 將 useState 的初始值換成從 localStorage 讀取的值
  const [step, setStep] = useState(initialState.step);
  const [playerCount, setPlayerCount] = useState(initialState.playerCount);
  const [selectedPlayers, setSelectedPlayers] = useState(initialState.selectedPlayers);
  const [matches, setMatches] = useState(initialState.matches);
  const [rankings, setRankings] = useState(initialState.rankings);
  const [assignmentMode, setAssignmentMode] = useState(initialState.assignmentMode);
  const [playoffMatch, setPlayoffMatch] = useState(initialState.playoffMatch);
  
  // ✨ 新增 allPlayers 狀態
  const [allPlayers, setAllPlayers] = useState(initialState.allPlayers);

  // ✨ 新增 state 來管理自訂名稱輸入 (這個不需要儲存)
  const [customPlayerName, setCustomPlayerName] = useState('');

  // ✨ 3. 使用 useEffect 在狀態變更時儲存
  useEffect(() => {
    try {
      const appState = {
        step,
        playerCount,
        selectedPlayers,
        matches,
        rankings,
        assignmentMode,
        playoffMatch,
        allPlayers // ✨ 儲存 allPlayers
      };
      localStorage.setItem('badmintonAppState', JSON.stringify(appState));
    } catch (e) {
      console.error("無法儲存狀態", e);
    }
    // 監聽所有需要儲存的狀態
  }, [step, playerCount, selectedPlayers, matches, rankings, assignmentMode, playoffMatch, allPlayers]); // ✨ 監聽 allPlayers


  // const availablePlayers = ['Simon', 'Jason', '小瑞', '承訓', '威威', '下巴', '彥霖', '仲儀', '馬克']; // ✨ 移除
  const presetPlayers = ['Simon', 'Jason', '小瑞', '承訓', '威威', '下巴', '彥霖', '仲儀', '馬克']; // ✨ 用於重置

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

  // 處理從「常用列表」點擊
  const handleSelectPlayer = (name) => {
    const isSelected = selectedPlayers.includes(name);
    
    // ✨ 2. 統一 'random' 和 'ordered' 的選/取消邏輯
    let next = isSelected
      ? selectedPlayers.filter(p => p !== name) // 移除的邏輯
      : [...selectedPlayers, name]; // 新增的邏輯

    // 只有在 "新增" 且 "不超過人數上限" 時才更新
    // 或者是 "移除" (總是允許)
    if (isSelected || next.length <= playerCount) {
      setSelectedPlayers(next);
    }
  };

  // ✨ 新增：處理新增自訂名稱
  const handleAddCustomPlayer = () => {
    const name = customPlayerName.trim();
    if (!name) return; // 避免空名稱
    
    // ✨ 檢查是否已存在
    if (allPlayers.includes(name)) {
      // 如果已存在，但未選，就選取
      if (!selectedPlayers.includes(name) && selectedPlayers.length < playerCount) {
        setSelectedPlayers([...selectedPlayers, name]);
      }
      setCustomPlayerName(''); // 清空輸入框
      return;
    }

    if (selectedPlayers.length >= playerCount) return; // 人數已滿

    // ✨ 新增到 allPlayers 和 selectedPlayers
    setAllPlayers([...allPlayers, name]);
    setSelectedPlayers([...selectedPlayers, name]);
    setCustomPlayerName(''); // 清空輸入框
  };

  // ✨ 新增：處理移除任一玩家
  const handleRemovePlayer = (nameToRemove) => {
    setSelectedPlayers(selectedPlayers.filter(p => p !== nameToRemove));
  };
  
  // ✨ 移除：隨機移除一位玩家 (已移除此函式)
  /*
  const handleRandomRemovePlayer = () => {
    if (selectedPlayers.length === 0) return; // 安全檢查

    // 1. 隨機選擇一個索引
    const randomIndex = Math.floor(Math.random() * selectedPlayers.length);
    
    // 2. 建立一個移除了該玩家的新陣列
    const newPlayers = selectedPlayers.filter((_, index) => index !== randomIndex);
    
    // 3. 更新 state
    setSelectedPlayers(newPlayers);
  };
  */

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
        if (p === undefined || p === null) return; // 防呆，避免 undefined 玩家
        if (!playerStats[p]) playerStats[p] = { score: 0, count: 0 };
      });

      team1.forEach(p => {
        if (!p) return;
        if (playerStats[p].count < 5) {
          playerStats[p].score += match.team1Score;
          playerStats[p].count++;
        }
      });
      team2.forEach(p => {
        if (!p) return;
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

  // ✨ 「重新開始」功能 (已修改)
  const handleRestart = () => {
      setStep(1);
      setPlayerCount(0);
      setSelectedPlayers([]);
      setMatches([]);
      setRankings([]);
      setAssignmentMode('random');
      setPlayoffMatch(null); // 重置挑戰賽
      setCustomPlayerName(''); // ✨ 重置自訂名稱輸入框
      setAllPlayers(presetPlayers); // ✨ 重置 allPlayers 為預設
      
      // ✨ 4. 也要清除儲存的狀態
      try {
        localStorage.removeItem('badmintonAppState');
      } catch (e) {
        console.error("無法清除儲存的狀態", e);
      }
  };
  
  // ✨ 新增：產生挑戰賽對戰組合
  const generatePlayoffMatch = () => {
    if (rankings.length < 4) return; // 確保有足夠的玩家

    const bottomFour = rankings.slice(-4).map(p => p.name);
    const shuffledPlayers = bottomFour.sort(() => Math.random() - 0.5);

    const newPlayoffMatch = {
        team1: [shuffledPlayers[0], shuffledPlayers[1]],
        team2: [shuffledPlayers[2], shuffledPlayers[3]],
        team1Score: 0,
        team2Score: 0,
    };

    setPlayoffMatch(newPlayoffMatch);
    setStep(5); // 進入新的第五步
  };

  // ✨ 新增：處理挑戰賽分數變更
  const handlePlayoffScoreChange = (team, score) => {
    if (!playoffMatch) return;
    const updatedMatch = { ...playoffMatch };
    if (team === 1) updatedMatch.team1Score = score;
    else updatedMatch.team2Score = score;
    setPlayoffMatch(updatedMatch);
  };

  // ✨ 優化進度提示文字
  const progressText = {
    1: '第 1 / 4 步：選擇人數',
    2: '第 2 / 4 步：選擇參賽者',
    3: '第 3 / 4 步：輸入分數',
    4: '🏆 最終排名',
    5: '⚔️ 最終挑戰賽'
  };


  return (
    <div className="px-4 py-6 space-y-8 max-w-full sm:max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden" style={{ fontFamily: 'sans-serif' }}>
      <div className="text-sm text-slate-500 text-center font-medium">🎯 {progressText[step]}</div>

      {step === 1 && (
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-bold text-slate-800">🏸 選擇參賽人數</h2>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="py-6 px-8 text-lg" onClick={() => { setPlayerCount(7); setStep(2); setSelectedPlayers([]); }}>7 人</Button>
            <Button size="lg" className="py-6 px-8 text-lg" onClick={() => { setPlayerCount(8); setStep(2); setSelectedPlayers([]); }}>8 人</Button>
          </div>
        </div>
      )}

      {/* ✨ ================== Step 2 (排版已調整) ================== ✨ */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 text-center">🏸 選擇 {playerCount} 位參賽者</h2>
          <div className='p-1 bg-slate-100 rounded-lg flex gap-1 border'>
            <Button className='flex-1' variant={assignmentMode === 'random' ? 'default' : 'ghost'} onClick={() => { setAssignmentMode('random'); setSelectedPlayers([]); }}>隨機編號</Button>
            <Button className='flex-1' variant={assignmentMode === 'ordered' ? 'default' : 'ghost'} onClick={() => { setAssignmentMode('ordered'); setSelectedPlayers([]); }}>依序編號</Button>
          </div>
          
          <div className="text-center my-3 space-y-2">
              <div className="text-base text-slate-700 font-medium">✅ 已選擇 {selectedPlayers.length} / {playerCount} 位</div>
              <ProgressBar current={selectedPlayers.length} total={playerCount} />

              {/* ✨ 隨機移除按鈕 (已移除) ✨ */}
              {/*
              )}
              */}
          </div>
          
          {/* 現有的常用列表按鈕 (修改 disabled 邏輯) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allPlayers.map(name => { // ✨ 改為 allPlayers
              const playerIndex = selectedPlayers.indexOf(name);
              const isSelected = playerIndex > -1;
              const isFull = selectedPlayers.length >= playerCount;
              
              // 'random' 模式下：選了還能點 (取消)；滿了但沒選 -> 不能點
              // 'ordered' 模式下：選了就不能點 (避免取消)；滿了 -> 不能點
              // ✨ 2. 統一 'ordered' 和 'random' 的 disabled 邏輯
              let isDisabled = !isSelected && isFull;

              return (
                <Button 
                  key={name} 
                  className="py-3 text-base"
                  variant={isSelected ? 'default' : 'outline'} 
                  onClick={() => handleSelectPlayer(name)} 
                  disabled={isDisabled}
                >
                  {assignmentMode === 'ordered' && isSelected ? `${playerIndex + 1}. ${name}` : name}
                </Button>
              );
            })}
          </div>

          {/* ✨ 自訂名稱輸入欄位 (已移動) */}
          <div className="w-full border-t my-4 pt-4 border-slate-200">
            <div className="flex gap-2">
              <Input
                placeholder="輸入自訂名稱..."
                value={customPlayerName}
                onChange={(e) => setCustomPlayerName(e.target.value)}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter') {
                    e.preventDefault(); // 防止表單提交
                    handleAddCustomPlayer();
                  }
                }}
                disabled={selectedPlayers.length >= playerCount}
              />
              <Button 
                onClick={handleAddCustomPlayer} 
                disabled={selectedPlayers.length >= playerCount || !customPlayerName.trim()}
              >
                新增
              </Button>
            </div>
          </div>

          {assignmentMode === 'ordered' && (
            <div className='space-y-3'>
              <div className="text-sm text-slate-500 text-center">請依序點擊或新增球員，順序即為編號。</div>
              <Button variant="destructive" size="sm" onClick={() => setSelectedPlayers([])}>🗑️ 清除重選</Button>
              <MatchPreview 
                playerCount={playerCount} 
                selectedPlayers={selectedPlayers} 
                schedules={fixedSchedules}
              />
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>🔙 上一步</Button>
            <Button className="flex-1" disabled={selectedPlayers.length !== playerCount} onClick={generateMatches}>📋 產生賽程</Button>
          </div>
        </div>
      )}
      {/* ✨ ================== Step 2 結束 ================== ✨ */}


      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 text-center">🥇 輸入比賽分數</h2>
          <div className="space-y-3 max-h-[65vh] overflow-y-auto p-1">
          {matches.map((m, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border-2 border-slate-100 shadow-sm">
              <div className="text-center text-sm font-semibold text-slate-600 mb-3">第 {i + 1} 場</div>
              <div className="flex items-start justify-around">
                  {/* 左隊 */}
                  <div className="flex-1 text-center space-y-1">
                      <div className="font-semibold text-slate-800 text-lg">{m.players[0][0] || 'N/A'}</div>
                      <div className="font-semibold text-slate-800 text-lg">{m.players[0][1] || 'N/A'}</div>
                      <ScoreInput 
                          score={m.team1Score}
                          onScoreChange={newScore => handleScoreChange(i, 1, newScore)}
                      />
                  </div>
                  {/* VS */}
                  <div className="text-center font-bold text-slate-400 text-base mx-1 pt-5">VS</div>
                  {/* 右隊 */}
                  <div className="flex-1 text-center space-y-1">
                      <div className="font-semibold text-slate-800 text-lg">{m.players[1][0] || 'N/A'}</div>
                      <div className="font-semibold text-slate-800 text-lg">{m.players[1][1] || 'N/A'}</div>
                      <ScoreInput 
                          score={m.team2Score}
                          onScoreChange={newScore => handleScoreChange(i, 2, newScore)}
                      />
                  </div>
              </div>
            </div>
          ))}
          </div>
          <div className="flex gap-2 flex-wrap pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>🔙 上一步</Button>
            <Button className="flex-1" onClick={calculateRanking}>📊 結算排名</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold text-slate-800 text-center">🏆 最終排名</h2>
          <p className="text-sm text-slate-500 text-center">僅計算每位選手的前五場比賽得分</p>
          <div className="space-y-2">
          {rankings.map((p, idx) => {
            const lastFour = rankings.slice(-4).map(r => r.name);
            const isBottom = lastFour.includes(p.name);
            const rankEmoji = ["🥇", "🥈", "🥉"];
            return (
              <div key={p.name} className={`flex justify-between items-center p-4 rounded-lg text-lg ${isBottom ? 'bg-red-100 border border-red-300' : 'bg-white border'}`}>
                <span className="font-semibold">{idx < 3 ? rankEmoji[idx] : <span className="inline-block w-7 text-center text-slate-500">{idx + 1}.</span>}{p.name}</span>
                <span className="font-bold text-slate-800">{p.score} 分</span>
              </div>
            );
          })}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-5 border-t">
            <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>🔙 上一步：修改分數</Button>
            {/* ✨ 修改按鈕功能 */}
            <Button onClick={generatePlayoffMatch} className="flex-1">⚔️ 挑戰賽分組</Button>
          </div>
        </div>
      )}

      {/* ✨ 新增第五步：挑戰賽 */}
      {step === 5 && playoffMatch && (
        <div className="space-y-5">
            <h2 className="text-2xl font-bold text-slate-800 text-center">⚔️ 最終挑戰賽</h2>
            <div className="bg-white p-4 rounded-xl border-2 border-amber-300 shadow-lg">
                <div className="flex items-start justify-around">
                    {/* 左隊 */}
                    <div className="flex-1 text-center space-y-1">
                        <div className="font-semibold text-slate-800 text-lg">{playoffMatch.team1[0]}</div>
                        <div className="font-semibold text-slate-800 text-lg">{playoffMatch.team1[1]}</div>
                        <ScoreInput 
                            score={playoffMatch.team1Score}
                            onScoreChange={newScore => handlePlayoffScoreChange(1, newScore)}
                        />
                    </div>
                    {/* VS */}
                    <div className="text-center font-bold text-amber-500 text-base mx-1 pt-5">VS</div>
                    {/* 右隊 */}
                    <div className="flex-1 text-center space-y-1">
                        <div className="font-semibold text-slate-800 text-lg">{playoffMatch.team2[0]}</div>
                        <div className="font-semibold text-slate-800 text-lg">{playoffMatch.team2[1]}</div>
                        <ScoreInput 
                            score={playoffMatch.team2Score}
                            onScoreChange={newScore => handlePlayoffScoreChange(2, newScore)}
                        />
                    </div>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-5 border-t">
                 <Button variant="outline" className="flex-1" onClick={() => setStep(4)}>🔙 返回排名</Button>
                 <Button onClick={handleRestart} className="flex-1">🏸 開始新的一局</Button>
            </div>
        </div>
      )}
    </div>
  );
}



