/* ============================================================
 * 骰子大冒险 · 对局页入口
 * 地址参数：game.html?size=easy&players=rabbit,tibetanfox
 * ============================================================ */

(function () {
  const params = new URLSearchParams(window.location.search);

  const sizeKey = SIZES[params.get('size')] ? params.get('size') : 'easy';

  let ids = (params.get('players') || '')
    .split(',')
    .map(item => item.trim())
    .filter(id => !!ANIMALS[id]);
  ids = ANIMAL_ORDER.filter(id => ids.indexOf(id) >= 0); // 统一按固定顺序
  if (ids.length < MIN_PLAYERS) ids = ANIMAL_ORDER.slice(0, MIN_PLAYERS);
  ids = ids.slice(0, MAX_PLAYERS);

  const state = createGame({ sizeKey, animalIds: ids });

  AdventureUI.init(state, {
    onRoll: roll,
    onCardChoice: choice => AdventureUI.runEvents(resumeTurn(state, choice)),
    onWin: ev => {
      AdventureUI.stopTimer();
      const isNewRecord = saveRecord(sizeKey, {
        rounds: ev.round,
        seconds: AdventureUI.getElapsed(),
        players: ids.length,
        winner: ev.player,
        date: new Date().toISOString().slice(0, 10)
      });
      return isNewRecord ? '🏅 新纪录！这是这个难度里最快的一局' : '';
    }
  });

  function roll() {
    if (state.winner || state.pending || AdventureUI.isBusy()) return;
    AdventureUI.runEvents(playTurn(state));
  }

  AdventureUI.startTimer();
  AdventureUI.runEvents(startGame(state));
})();
