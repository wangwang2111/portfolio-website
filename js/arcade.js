// ── Arcade (Snake · 2048 · Market Sim) ───────────────────────────
(function() {

  /* ===================== SNAKE ===================== */
  const Snake = (function() {
    const cvs = document.getElementById('snake-canvas');
    const ctx = cvs.getContext('2d');
    const SIZE = 20;
    let CELL = cvs.width / SIZE;
    let snake, dir, nextDir, food, score, best = 0, state = 'idle', iv = null, live = false;

    function start() {
      snake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
      dir = {x:1,y:0}; nextDir = {x:1,y:0};
      score = 0; state = 'running';
      placeFood(); updateHud();
      clearInterval(iv); iv = setInterval(step, 130);
      draw();
    }
    function placeFood() {
      let p;
      do { p = {x:Math.floor(Math.random()*SIZE), y:Math.floor(Math.random()*SIZE)}; }
      while (snake.some(s => s.x===p.x && s.y===p.y));
      food = p;
    }
    function updateHud() {
      document.getElementById('snake-score').textContent = score;
      document.getElementById('snake-best').textContent = best;
    }
    function step() {
      dir = nextDir;
      const h = {x:snake[0].x+dir.x, y:snake[0].y+dir.y};
      if (h.x<0||h.x>=SIZE||h.y<0||h.y>=SIZE||snake.some(s=>s.x===h.x&&s.y===h.y)) {
        state='dead'; clearInterval(iv); draw(); return;
      }
      snake.unshift(h);
      if (h.x===food.x && h.y===food.y) {
        score+=10; best=Math.max(score,best); updateHud(); placeFood();
      } else { snake.pop(); }
      draw();
    }
    function setDir(nd) {
      if (state!=='running') return;
      if (nd.x===-dir.x && nd.y===-dir.y) return;
      nextDir = nd;
    }
    function draw() {
      const W=cvs.width, H=cvs.height;
      CELL = W / SIZE;
      ctx.fillStyle='#03050e'; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='rgba(255,255,255,0.03)'; ctx.lineWidth=0.5;
      for (let i=0;i<=SIZE;i++) {
        ctx.beginPath(); ctx.moveTo(i*CELL,0); ctx.lineTo(i*CELL,H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,i*CELL); ctx.lineTo(W,i*CELL); ctx.stroke();
      }
      if (food) {
        ctx.shadowColor='#00b4d8'; ctx.shadowBlur=12;
        ctx.fillStyle='#4dd8f0';
        ctx.fillRect(food.x*CELL+2, food.y*CELL+2, CELL-4, CELL-4);
        ctx.shadowBlur=0;
      }
      if (snake) snake.forEach((s,i) => {
        ctx.shadowColor=i===0?'rgba(201,168,76,0.7)':'rgba(201,168,76,0.12)';
        ctx.shadowBlur=i===0?10:3;
        ctx.fillStyle=i===0?'#c9a84c':`rgba(201,168,76,${Math.max(0.25,0.9-i*0.025)})`;
        ctx.fillRect(s.x*CELL+1, s.y*CELL+1, CELL-2, CELL-2);
      });
      ctx.shadowBlur=0;
      if (state==='idle') {
        ctx.fillStyle='rgba(3,5,14,0.72)'; ctx.fillRect(0,0,W,H);
        ctx.textAlign='center';
        ctx.fillStyle='#c9a84c'; ctx.font=`bold 17px 'Fira Code',monospace`;
        ctx.fillText('Tap or press Start', W/2, H/2-4);
        ctx.fillStyle='#3d4a62'; ctx.font=`11px 'Fira Code',monospace`;
        ctx.fillText('Arrows / WASD / Swipe to move', W/2, H/2+22);
      }
      if (state==='dead') {
        ctx.fillStyle='rgba(3,5,14,0.80)'; ctx.fillRect(0,0,W,H);
        ctx.textAlign='center';
        ctx.fillStyle='#c0392b'; ctx.font=`bold 20px 'Fira Code',monospace`;
        ctx.fillText('Game Over', W/2, H/2-18);
        ctx.fillStyle='#c9a84c'; ctx.font=`13px 'Fira Code',monospace`;
        ctx.fillText('Score: '+score, W/2, H/2+8);
        ctx.fillStyle='#3d4a62'; ctx.font=`11px 'Fira Code',monospace`;
        ctx.fillText('Tap or Start to restart', W/2, H/2+32);
      }
    }

    const DIRS = {
      ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},
      w:{x:0,y:-1},s:{x:0,y:1},a:{x:-1,y:0},d:{x:1,y:0},
      W:{x:0,y:-1},S:{x:0,y:1},A:{x:-1,y:0},D:{x:1,y:0},
    };

    document.addEventListener('keydown', e => {
      if (!live) return;
      if (e.key==='Enter') { e.preventDefault(); start(); return; }
      const d = DIRS[e.key];
      if (d) { e.preventDefault(); setDir(d); }
    });

    // tap / click to start or restart
    cvs.addEventListener('click', () => { if (state!=='running') start(); });

    // swipe to steer (and start on first touch)
    let sx=null, sy=null;
    cvs.addEventListener('touchstart', e => {
      sx=e.touches[0].clientX; sy=e.touches[0].clientY;
      if (state!=='running') start();
    }, {passive:true});
    cvs.addEventListener('touchmove', e => {
      if (sx===null) return;
      const dx=e.touches[0].clientX-sx, dy=e.touches[0].clientY-sy;
      if (Math.abs(dx)<20 && Math.abs(dy)<20) return;
      setDir(Math.abs(dx)>Math.abs(dy) ? {x:dx>0?1:-1,y:0} : {x:0,y:dy>0?1:-1});
      sx=e.touches[0].clientX; sy=e.touches[0].clientY;
    }, {passive:true});

    document.getElementById('snake-start').addEventListener('click', start);

    function setActive(on) {
      live = on;
      if (!on) clearInterval(iv);
      else if (state==='running') { clearInterval(iv); iv=setInterval(step,130); }
      draw();
    }

    draw();
    return { setActive };
  })();

  /* ===================== 2048 (animated tiles) ===================== */
  const G2048 = (function() {
    const N = 4, ANIM = 125;          // ms — matches CSS transition
    const PAD = 2.4, STEP = 24.4;     // % layout: 4×22% cells + gaps
    let grid, tiles = [], score = 0, best = 0, nextId = 1;
    let live = false, busy = false, over = false;

    const boardEl = document.getElementById('g2048-board');
    let overEl;

    const COLORS = {
      2:['#0f1e3a','#e8dcc8'], 4:['#142344','#e8dcc8'], 8:['#7a6230','#f5e9c8'],
      16:['#c9a84c','#03050e'], 32:['#e8c97a','#03050e'], 64:['#00b4d8','#03050e'],
      128:['#0099b8','#f5e9c8'], 256:['#c9a84c','#03050e'], 512:['#00a878','#03050e'],
      1024:['#c0392b','#f5e9c8'], 2048:['#f5e9c8','#03050e'],
    };

    const pct = i => (PAD + i*STEP) + '%';
    const inB = (r,c) => r>=0 && r<N && c>=0 && c<N;

    function styleTile(el, val) {
      const [bg,fg] = COLORS[Math.min(val,2048)] || ['#f5e9c8','#03050e'];
      el.style.background = bg; el.style.color = fg; el.textContent = val;
      el.style.fontSize = (val>=1000 ? '1.25rem' : val>=100 ? '1.55rem' : '1.95rem');
    }

    function buildBackground() {
      boardEl.innerHTML = '';
      for (let r=0;r<N;r++) for (let c=0;c<N;c++) {
        const bg = document.createElement('div');
        bg.className = 'g2048-bg';
        bg.style.left = pct(c); bg.style.top = pct(r);
        boardEl.appendChild(bg);
      }
      overEl = document.createElement('div');
      overEl.className = 'g2048-over';
      overEl.innerHTML = '<span class="t">No moves left</span><span class="s">Press New Game</span>';
      boardEl.appendChild(overEl);
    }

    function syncHud() {
      document.getElementById('g2048-score').textContent = score;
      document.getElementById('g2048-best').textContent = best;
    }
    function emptyCells() {
      const e = [];
      for (let r=0;r<N;r++) for (let c=0;c<N;c++) if (!grid[r][c]) e.push([r,c]);
      return e;
    }
    function spawn() {
      const e = emptyCells();
      if (!e.length) return;
      const [r,c] = e[Math.floor(Math.random()*e.length)];
      const val = Math.random()<0.9 ? 2 : 4;
      const el = document.createElement('div');
      el.className = 'g2048-tile spawn';
      styleTile(el, val);
      el.style.left = pct(c); el.style.top = pct(r);
      boardEl.appendChild(el);
      const t = { id: nextId++, val, r, c, el };
      grid[r][c] = t; tiles.push(t);
    }
    function positionAll() {
      tiles.forEach(t => { t.el.style.left = pct(t.c); t.el.style.top = pct(t.r); });
    }
    function findFarthest(r,c,v) {
      let pr=r, pc=c, nr=r+v[0], nc=c+v[1];
      while (inB(nr,nc) && !grid[nr][nc]) { pr=nr; pc=nc; nr+=v[0]; nc+=v[1]; }
      return { far:{r:pr,c:pc}, next: inB(nr,nc) ? {r:nr,c:nc} : null };
    }
    function traversals(v) {
      const r=[0,1,2,3], c=[0,1,2,3];
      if (v[0]===1) r.reverse();
      if (v[1]===1) c.reverse();
      return { r, c };
    }
    function isGameOver() {
      if (emptyCells().length) return false;
      for (let r=0;r<N;r++) for (let c=0;c<N;c++) {
        const v = grid[r][c].val;
        if ((c<N-1 && grid[r][c+1].val===v) || (r<N-1 && grid[r+1][c].val===v)) return false;
      }
      return true;
    }

    function move(dir) {
      if (over || busy) return;
      const v = {left:[0,-1],right:[0,1],up:[-1,0],down:[1,0]}[dir];
      tiles.forEach(t => t.merged = false);
      const trav = traversals(v);
      const merges = [];
      let moved = false;

      trav.r.forEach(r => trav.c.forEach(c => {
        const tile = grid[r][c];
        if (!tile) return;
        const { far, next } = findFarthest(r,c,v);
        const nextTile = next ? grid[next.r][next.c] : null;
        if (nextTile && nextTile.val===tile.val && !nextTile.merged) {
          grid[r][c] = null;
          nextTile.merged = true;
          tile.r = next.r; tile.c = next.c; tile.dead = true;   // slide onto target, then remove
          merges.push({ target: nextTile, val: nextTile.val*2 });
          moved = true;
        } else if (far.r!==r || far.c!==c) {
          grid[r][c] = null; grid[far.r][far.c] = tile;
          tile.r = far.r; tile.c = far.c;
          moved = true;
        }
      }));

      if (!moved) return;
      busy = true;
      positionAll();                       // CSS transitions animate the slide

      setTimeout(() => {
        tiles = tiles.filter(t => { if (t.dead) { t.el.remove(); return false; } return true; });
        merges.forEach(m => {
          m.target.val = m.val;
          score += m.val; best = Math.max(best, score);
          styleTile(m.target.el, m.val);
          m.target.el.classList.remove('merged');
          void m.target.el.offsetWidth;     // restart pop animation
          m.target.el.classList.add('merged');
        });
        syncHud();
        spawn();
        if (isGameOver()) { over = true; overEl.classList.add('show'); }
        busy = false;
      }, ANIM);
    }

    function newGame() {
      tiles.forEach(t => t.el.remove());
      tiles = []; grid = Array.from({length:N}, () => Array(N).fill(null));
      score = 0; over = false; busy = false;
      if (overEl) overEl.classList.remove('show');
      spawn(); spawn(); syncHud();
    }

    const DMAP = {
      ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',
      a:'left',d:'right',w:'up',s:'down',A:'left',D:'right',W:'up',S:'down',
    };
    document.addEventListener('keydown', e => {
      if (!live) return;
      const d = DMAP[e.key];
      if (d) { e.preventDefault(); move(d); }
    });

    let tx, ty;
    boardEl.addEventListener('touchstart', e => { tx=e.touches[0].clientX; ty=e.touches[0].clientY; }, {passive:true});
    boardEl.addEventListener('touchend', e => {
      if (tx==null) return;
      const dx=e.changedTouches[0].clientX-tx, dy=e.changedTouches[0].clientY-ty;
      if (Math.abs(dx)<20 && Math.abs(dy)<20) return;
      if (Math.abs(dx)>Math.abs(dy)) move(dx>0?'right':'left');
      else move(dy>0?'down':'up');
    }, {passive:true});

    document.getElementById('g2048-new').addEventListener('click', newGame);

    function setActive(on) { live = on; }

    buildBackground();
    newGame();
    return { setActive };
  })();

  /* ===================== MARKET SIM (turn-based · 5 stocks) ===================== */
  const Market = (function() {
    const INIT = 1000000;
    const STOCKS = [
      { tk:'AAPL',  name:'Apple',     base:225, vol:0.020, drift:0.0007 },
      { tk:'MSFT',  name:'Microsoft', base:415, vol:0.017, drift:0.0007 },
      { tk:'NVDA',  name:'NVIDIA',    base:120, vol:0.034, drift:0.0012 },
      { tk:'AMZN',  name:'Amazon',    base:185, vol:0.024, drift:0.0006 },
      { tk:'GOOGL', name:'Alphabet',  base:170, vol:0.020, drift:0.0006 },
    ];
    const STEPS = { weekly:5, biweekly:10, monthly:21 };
    const LABEL = { weekly:'End Week ▶', biweekly:'End 2 Weeks ▶', monthly:'End Month ▶' };
    const stocksEl = document.getElementById('mkt-stocks');
    const pfCanvas = document.getElementById('mkt-pf-chart');
    let cash, turn, turnPnl, netHist, freq = 'weekly', rows = [];

    const fmt = n => (n<0?'-':'') + '$' + Math.round(Math.abs(n)).toLocaleString('en-US');
    const rnd = () => Math.random()*2 - 1;

    function stepPrice(s) {
      const shock = Math.random()<0.05 ? rnd()*0.08 : 0;
      return Math.max(1, s.px * (1 + s.def.drift + s.def.vol*rnd() + shock));
    }
    function getQty(s) { const v = parseInt(s.refs.qty.value,10); return (isNaN(v)||v<0) ? 0 : v; }
    function adjQty(input, d) { let v=parseInt(input.value,10); if(isNaN(v)) v=0; input.value = Math.max(0, v+d); }
    function equity() { return rows.reduce((a,s)=>a + s.shares*s.px, 0); }
    function net() { return cash + equity(); }

    function buy(s) {
      const q = getQty(s); if (q<=0) return;
      const cost = q*s.px;
      if (cash >= cost) { cash -= cost; s.shares += q; render(); }
    }
    function sell(s) {
      const q = getQty(s); if (q<=0) return;
      if (s.shares >= q) { cash += q*s.px; s.shares -= q; render(); }
    }

    function buildRows() {
      stocksEl.innerHTML = '';
      rows = STOCKS.map(def => {
        const row = document.createElement('div');
        row.className = 'mkt-row';
        row.innerHTML = `
          <div class="mkt-id"><div class="mkt-tk">${def.tk}</div><div class="mkt-name">${def.name}</div></div>
          <canvas class="mkt-spark" width="116" height="44"></canvas>
          <div class="mkt-pxwrap"><span class="mkt-px"></span><span class="mkt-chg"></span></div>
          <div class="mkt-pos"></div>
          <div class="mkt-trade">
            <button class="mkt-step dec" aria-label="decrease">−</button>
            <input class="mkt-qty" type="text" inputmode="numeric" value="10" aria-label="quantity">
            <button class="mkt-step inc" aria-label="increase">+</button>
            <button class="game-btn buy">Buy</button>
            <button class="game-btn sell">Sell</button>
          </div>`;
        stocksEl.appendChild(row);
        const refs = {
          px:    row.querySelector('.mkt-px'),
          chg:   row.querySelector('.mkt-chg'),
          pos:   row.querySelector('.mkt-pos'),
          qty:   row.querySelector('.mkt-qty'),
          spark: row.querySelector('.mkt-spark'),
        };
        const s = { def, px:def.base, prev:def.base, hist:[def.base], shares:0, refs };
        row.querySelector('.dec').addEventListener('click', () => adjQty(refs.qty, -10));
        row.querySelector('.inc').addEventListener('click', () => adjQty(refs.qty, 10));
        row.querySelector('.buy').addEventListener('click', () => buy(s));
        row.querySelector('.sell').addEventListener('click', () => sell(s));
        return s;
      });
    }

    // filled area chart, colored by whole-window trend
    function areaChart(x, h, W, H, col, fill0, fill1, pad) {
      const p = pad || 2;
      const mn = Math.min(...h), mx = Math.max(...h), rng = (mx-mn) || 1;
      const X = i => (i/((h.length-1)||1))*W;
      const Y = v => H-p - ((v-mn)/rng)*(H-2*p);
      x.beginPath();
      h.forEach((v,i) => i===0 ? x.moveTo(X(i),Y(v)) : x.lineTo(X(i),Y(v)));
      x.lineTo(W, H); x.lineTo(0, H); x.closePath();
      const g = x.createLinearGradient(0,0,0,H);
      g.addColorStop(0, fill0); g.addColorStop(1, fill1);
      x.fillStyle = g; x.fill();
      x.beginPath();
      h.forEach((v,i) => i===0 ? x.moveTo(X(i),Y(v)) : x.lineTo(X(i),Y(v)));
      x.strokeStyle = col; x.lineWidth = 1.3; x.stroke();
    }

    function drawSpark(s) {
      const c = s.refs.spark, x = c.getContext('2d'), W = c.width, H = c.height;
      x.clearRect(0,0,W,H);
      const up = s.hist[s.hist.length-1] >= s.hist[0];
      areaChart(x, s.hist, W, H, up?'#00a878':'#c0392b',
        up?'rgba(0,168,120,0.26)':'rgba(192,57,43,0.26)', 'rgba(0,0,0,0)', 3);
    }

    function drawPortfolio() {
      const c = pfCanvas, x = c.getContext('2d'), W = c.width, H = c.height;
      x.fillStyle = '#03050e'; x.fillRect(0,0,W,H);
      const h = netHist;
      const mn = Math.min(...h, INIT), mx = Math.max(...h, INIT), rng = (mx-mn) || 1;
      const pl=4, pr=70, pt=10, pb=10, cw=W-pl-pr, ch=H-pt-pb;
      const X = i => pl + (i/((h.length-1)||1))*cw;
      const Y = v => pt + ch*(1 - (v-mn)/rng);
      // gridlines + value labels
      x.strokeStyle='rgba(255,255,255,0.05)'; x.lineWidth=1; x.textAlign='left';
      [0,0.5,1].forEach(f => {
        const y = pt+ch*f;
        x.beginPath(); x.moveTo(pl,y); x.lineTo(W-pr,y); x.stroke();
        x.fillStyle='#3d4a62'; x.font="9px 'Fira Code',monospace";
        x.fillText(fmt(mx-(mx-mn)*f), W-pr+5, y+3);
      });
      // INIT baseline (dashed gold)
      const by = Y(INIT);
      x.setLineDash([4,4]); x.strokeStyle='rgba(201,168,76,0.5)';
      x.beginPath(); x.moveTo(pl,by); x.lineTo(W-pr,by); x.stroke(); x.setLineDash([]);
      // area + line
      const last = h[h.length-1], up = last >= INIT, col = up?'#00a878':'#c0392b';
      x.beginPath(); h.forEach((v,i) => i===0?x.moveTo(X(i),Y(v)):x.lineTo(X(i),Y(v)));
      x.lineTo(X(h.length-1), pt+ch); x.lineTo(pl, pt+ch); x.closePath();
      const g = x.createLinearGradient(0,0,0,H);
      g.addColorStop(0, up?'rgba(0,168,120,0.24)':'rgba(192,57,43,0.24)'); g.addColorStop(1,'rgba(0,0,0,0)');
      x.fillStyle=g; x.fill();
      x.beginPath(); h.forEach((v,i) => i===0?x.moveTo(X(i),Y(v)):x.lineTo(X(i),Y(v)));
      x.strokeStyle=col; x.lineWidth=1.6; x.stroke();
      // last marker
      x.beginPath(); x.arc(X(h.length-1), Y(last), 3.5, 0, Math.PI*2);
      x.fillStyle='#c9a84c'; x.shadowColor='rgba(201,168,76,0.8)'; x.shadowBlur=6; x.fill(); x.shadowBlur=0;
      // empty-state hint: net worth stays flat until you hold something
      if (!rows.some(s => s.shares>0)) {
        x.textAlign='center';
        x.fillStyle='rgba(232,220,200,0.6)'; x.font="11px 'Fira Code',monospace";
        x.fillText('No positions yet — Buy a stock below to grow your net worth', (W-pr)/2 + pl, pt + ch/2);
      }
    }

    function render() {
      document.getElementById('mkt-cash').textContent   = fmt(cash);
      document.getElementById('mkt-equity').textContent = fmt(equity());
      document.getElementById('mkt-net').textContent    = fmt(net());
      document.getElementById('mkt-pf-now').textContent = fmt(net());
      const pnl = net() - INIT;
      const pnlEl = document.getElementById('mkt-pnl');
      pnlEl.textContent = (pnl>=0?'+':'') + fmt(pnl);
      pnlEl.style.color = pnl>=0 ? 'var(--emerald)' : 'var(--ruby)';
      const tp = document.getElementById('mkt-turnpnl');
      if (turnPnl === null) { tp.textContent = '—'; tp.style.color = 'var(--text-dim)'; }
      else { tp.textContent = (turnPnl>=0?'+':'') + fmt(turnPnl); tp.style.color = turnPnl>=0 ? 'var(--emerald)' : 'var(--ruby)'; }
      document.getElementById('mkt-turn').textContent = turn;
      rows.forEach(s => {
        s.refs.px.textContent = '$' + s.px.toFixed(2);
        const chg = (s.px - s.prev)/s.prev*100;
        s.refs.chg.textContent = (chg>=0?'+':'') + chg.toFixed(2) + '%';
        s.refs.chg.className = 'mkt-chg ' + (chg>=0 ? 'up' : 'dn');
        s.refs.pos.textContent = s.shares>0 ? `${s.shares.toLocaleString()} sh · ${fmt(s.shares*s.px)}` : '—';
        drawSpark(s);
      });
      drawPortfolio();
    }

    function endTurn() {
      const before = net();
      rows.forEach(s => s.prev = s.px);          // lock start-of-turn price for % change
      for (let k=0; k<STEPS[freq]; k++) {
        rows.forEach(s => { s.px = stepPrice(s); s.hist.push(s.px); if (s.hist.length>120) s.hist.shift(); });
        netHist.push(net()); if (netHist.length>240) netHist.shift();
      }
      turn++; turnPnl = net() - before;
      render();
    }
    function reset() {
      cash = INIT; turn = 1; turnPnl = null; netHist = [INIT];
      rows.forEach(s => { s.px=s.def.base; s.prev=s.def.base; s.hist=[s.def.base]; s.shares=0; s.refs.qty.value='10'; });
      render();
    }
    function setFreq(f) {
      freq = f;
      document.querySelectorAll('.freq-btn').forEach(b => b.classList.toggle('active', b.dataset.freq===f));
      document.getElementById('mkt-endturn').textContent = LABEL[f];
    }

    function buyAll() { rows.forEach(s => buy(s)); }   // buys each row's quantity

    document.getElementById('mkt-buyall').addEventListener('click', buyAll);
    document.getElementById('mkt-endturn').addEventListener('click', endTurn);
    document.getElementById('mkt-reset').addEventListener('click', reset);
    document.querySelectorAll('.freq-btn').forEach(b => b.addEventListener('click', () => setFreq(b.dataset.freq)));

    function setActive(on) { if (on) render(); }

    buildRows(); setFreq('weekly'); reset();
    return { setActive };
  })();

  /* ===================== TETRIS ===================== */
  const Tetris = (function() {
    const cvs = document.getElementById('tetris-canvas');
    const ctx = cvs.getContext('2d');
    const COLS=10, ROWS=20, CELL=24;
    const COLORS = ['#0b1228','#00b4d8','#c9a84c','#00a878','#c0392b','#e8c97a','#6a0572','#0072c6'];
    const PIECES = [
      {m:[[1,1,1,1]], c:1},            // I
      {m:[[2,2],[2,2]], c:2},          // O
      {m:[[0,3,0],[3,3,3]], c:6},      // T
      {m:[[0,4,4],[4,4,0]], c:3},      // S
      {m:[[5,5,0],[0,5,5]], c:4},      // Z
      {m:[[6,0,0],[6,6,6]], c:7},      // J
      {m:[[0,0,7],[7,7,7]], c:5},      // L
    ];
    let board, cur, score, lines, best=0, over=false, started=false, iv=null, live=false, dropMs=600;

    function newPiece(p){ return { m:p.m.map(r=>[...r]), c:p.c, r:0, col:Math.floor((COLS-p.m[0].length)/2) }; }
    function collide(r,col,m){
      for (let i=0;i<m.length;i++) for (let j=0;j<m[i].length;j++) if (m[i][j]) {
        const R=r+i, C=col+j;
        if (C<0||C>=COLS||R>=ROWS) return true;
        if (R>=0 && board[R][C]) return true;
      }
      return false;
    }
    function spawn(){
      cur = newPiece(PIECES[Math.floor(Math.random()*PIECES.length)]);
      if (collide(cur.r,cur.col,cur.m)) { over=true; stop(); }
    }
    function lock(){
      cur.m.forEach((row,i)=>row.forEach((v,j)=>{ if(v){ const R=cur.r+i,C=cur.col+j; if(R>=0) board[R][C]=cur.c; }}));
      let cleared=0;
      for (let r=ROWS-1;r>=0;r--) {
        if (board[r].every(v=>v)) { board.splice(r,1); board.unshift(Array(COLS).fill(0)); cleared++; r++; }
      }
      if (cleared) {
        score += [0,100,300,500,800][cleared]; lines += cleared; best=Math.max(best,score);
        dropMs = Math.max(120, 600 - Math.floor(lines/10)*55); run();
      }
      spawn(); updateHud();
    }
    function softDrop(){
      if (over) return;
      if (!collide(cur.r+1,cur.col,cur.m)) cur.r++; else lock();
      draw();
    }
    function hardDrop(){
      if (over||!started) return;
      while (!collide(cur.r+1,cur.col,cur.m)) cur.r++;
      lock(); draw();
    }
    function moveH(d){ if (!over && started && !collide(cur.r,cur.col+d,cur.m)) { cur.col+=d; draw(); } }
    function rotate(){
      if (over||!started) return;
      const m = cur.m[0].map((_,i)=>cur.m.map(row=>row[i]).reverse());
      for (const k of [0,-1,1,-2,2]) if (!collide(cur.r,cur.col+k,m)) { cur.col+=k; cur.m=m; break; }
      draw();
    }
    function updateHud(){
      document.getElementById('tetris-score').textContent = score;
      document.getElementById('tetris-lines').textContent = lines;
      document.getElementById('tetris-best').textContent = best;
    }
    function cellRect(r,c,ci){
      ctx.fillStyle = COLORS[ci];
      ctx.fillRect(c*CELL+1, r*CELL+1, CELL-2, CELL-2);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(c*CELL+1, r*CELL+1, CELL-2, 3);
    }
    function draw(){
      ctx.fillStyle='#03050e'; ctx.fillRect(0,0,cvs.width,cvs.height);
      ctx.strokeStyle='rgba(255,255,255,0.03)'; ctx.lineWidth=0.5;
      for (let c=0;c<=COLS;c++){ ctx.beginPath(); ctx.moveTo(c*CELL,0); ctx.lineTo(c*CELL,cvs.height); ctx.stroke(); }
      for (let r=0;r<=ROWS;r++){ ctx.beginPath(); ctx.moveTo(0,r*CELL); ctx.lineTo(cvs.width,r*CELL); ctx.stroke(); }
      if (board) for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) if (board[r][c]) cellRect(r,c,board[r][c]);
      if (cur && started && !over) cur.m.forEach((row,i)=>row.forEach((v,j)=>{ if(v && cur.r+i>=0) cellRect(cur.r+i,cur.col+j,cur.c); }));
      if (!started || over) {
        ctx.fillStyle='rgba(3,5,14,0.80)'; ctx.fillRect(0,0,cvs.width,cvs.height);
        ctx.textAlign='center';
        if (over) {
          ctx.fillStyle='#c0392b'; ctx.font=`bold 20px 'Fira Code',monospace`;
          ctx.fillText('Game Over', cvs.width/2, cvs.height/2-14);
          ctx.fillStyle='#c9a84c'; ctx.font=`13px 'Fira Code',monospace`;
          ctx.fillText('Score: '+score, cvs.width/2, cvs.height/2+10);
          ctx.fillStyle='#3d4a62'; ctx.font=`11px 'Fira Code',monospace`;
          ctx.fillText('Press Start / Enter', cvs.width/2, cvs.height/2+34);
        } else {
          ctx.fillStyle='#c9a84c'; ctx.font=`bold 17px 'Fira Code',monospace`;
          ctx.fillText('Press Start to play', cvs.width/2, cvs.height/2-2);
          ctx.fillStyle='#3d4a62'; ctx.font=`11px 'Fira Code',monospace`;
          ctx.fillText('Arrows / Space / Swipe', cvs.width/2, cvs.height/2+22);
        }
      }
    }
    function run(){ clearInterval(iv); if (live && started && !over) iv=setInterval(softDrop, dropMs); }
    function stop(){ clearInterval(iv); }
    function start(){
      board = Array.from({length:ROWS}, ()=>Array(COLS).fill(0));
      score=0; lines=0; over=false; started=true; dropMs=600;
      spawn(); updateHud(); run(); draw();
    }

    document.addEventListener('keydown', e => {
      if (!live) return;
      if (!started || over) { if (e.key==='Enter') { e.preventDefault(); start(); } return; }
      switch (e.key) {
        case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); moveH(-1); break;
        case 'ArrowRight': case 'd': case 'D': e.preventDefault(); moveH(1); break;
        case 'ArrowDown': case 's': case 'S': e.preventDefault(); softDrop(); break;
        case 'ArrowUp': case 'w': case 'W': e.preventDefault(); rotate(); break;
        case ' ': e.preventDefault(); hardDrop(); break;
      }
    });

    let sx=null, sy=null, st=0;
    cvs.addEventListener('touchstart', e => { sx=e.touches[0].clientX; sy=e.touches[0].clientY; st=Date.now(); }, {passive:true});
    cvs.addEventListener('touchend', e => {
      if (sx===null) return;
      if (!started || over) { start(); sx=null; return; }
      const dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
      if (Math.abs(dx)<16 && Math.abs(dy)<16 && Date.now()-st<250) rotate();
      else if (Math.abs(dx)>Math.abs(dy)) moveH(dx>0?1:-1);
      else if (dy>24) hardDrop();
      sx=null;
    }, {passive:true});

    document.getElementById('tetris-start').addEventListener('click', start);

    function setActive(on){ live=on; if (on){ draw(); run(); } else stop(); }
    draw();
    return { setActive };
  })();

  /* ===================== MEMORY MATCH ===================== */
  const Memory = (function() {
    const POOL = [
      '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵',
      '🐔','🐧','🐦','🦆','🦉','🦄','🐝','🐛','🦋','🐌','🐞','🐢','🐍','🐙','🦑',
      '🦀','🐠','🐬','🐳','🦈','🐊','🐅','🦓','🦒','🐘',
      '🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍒','🍑','🥭','🍍','🥥','🥝',
      '🍅','🥑','🥦','🌽','🥕','🍔','🍟','🍕','🌭','🌮','🍩','🍪','🎂','🍰','🧁',
      '🍫','🍬','🍭','🍮','🍦','☕','🍵','🍺','🍷','🍸',
      '💰','💎','💳','🏦','📈','📉','📊','💹','🪙','💵','🧾','📋','📁','📌','📎',
      '💼','🧮','⚖️','🔐','🔑','🛡️','⏳','⏰','📅','🎯','🚀','🔥','⚡','🌟','🏆',
      '🥇','🎲','♟️','🃏','🎰','🛎️','📞','🖥️','⌨️','💾'
    ];
    const COLS = 8, ROWS = 8;
    const PAIRS = Math.min(Math.floor(COLS*ROWS/2), POOL.length);
    const gridEl = document.getElementById('mem-grid');
    let cards, first, moves, matched, best=null, busy=false;

    function updateHud(){
      document.getElementById('mem-moves').textContent = moves;
      document.getElementById('mem-matched').textContent = matched+'/'+PAIRS;
      document.getElementById('mem-best').textContent = best===null ? '—' : best+' moves';
    }
    function newGame(){
      const syms = [...POOL].sort(()=>Math.random()-0.5).slice(0, PAIRS);
      const deck = [...syms,...syms].sort(()=>Math.random()-0.5);
      moves=0; matched=0; first=null; busy=false;
      gridEl.innerHTML='';
      cards = deck.map((sym,i) => {
        const card = document.createElement('div');
        card.className='mem-card';
        card.innerHTML = `<div class="mem-inner"><div class="mem-face mem-front">◆</div><div class="mem-face mem-back">${sym}</div></div>`;
        card.addEventListener('click', ()=>flip(i));
        gridEl.appendChild(card);
        return { sym, card, done:false };
      });
      // Fill any remaining cells (odd grid count) with inert blank cards.
      for (let i = deck.length; i < COLS*ROWS; i++) {
        const blank = document.createElement('div');
        blank.className = 'mem-card mem-blank';
        gridEl.appendChild(blank);
      }
      updateHud();
    }
    function flip(i){
      if (busy) return;
      const c = cards[i];
      if (c.done || c.card.classList.contains('flipped')) return;
      c.card.classList.add('flipped');
      if (!first) { first = { i, sym:c.sym, card:c.card }; return; }
      if (first.i === i) return;
      moves++; updateHud();
      if (first.sym === c.sym) {
        cards[first.i].done = true; c.done = true;
        first.card.classList.add('matched'); c.card.classList.add('matched');
        matched++; first=null; updateHud();
        if (matched===PAIRS && (best===null||moves<best)) { best=moves; updateHud(); }
      } else {
        busy = true;
        const f = first; first = null;
        setTimeout(()=>{ f.card.classList.remove('flipped'); c.card.classList.remove('flipped'); busy=false; }, 750);
      }
    }
    document.getElementById('mem-new').addEventListener('click', newGame);
    function setActive(on){ /* no loop needed */ }
    newGame();
    return { setActive };
  })();

  /* ===================== REACTION / LATENCY TEST ===================== */
  const Reaction = (function() {
    const pad = document.getElementById('rx-pad');
    const mainEl = document.getElementById('rx-main');
    const subEl = document.getElementById('rx-sub');
    let state='idle', t0=0, timer=null, times=[], best=null;

    function set(cls, main, sub){ pad.className = cls; mainEl.textContent = main; subEl.textContent = sub; }
    function idle(){ state='idle'; set('', 'Click to begin', 'Execution latency test'); }
    function arm(){
      state='wait'; set('wait', 'Wait for green…', 'Hold steady');
      timer = setTimeout(()=>{ state='go'; t0=performance.now(); set('go','EXECUTE','Click now!'); }, 900+Math.random()*2600);
    }
    function hud(last){
      document.getElementById('rx-last').textContent = last==null ? '—' : last+' ms';
      document.getElementById('rx-best').textContent = best===null ? '—' : best+' ms';
      const avg = times.length ? Math.round(times.reduce((a,b)=>a+b,0)/times.length) : null;
      document.getElementById('rx-avg').textContent = avg===null ? '—' : avg+' ms';
    }
    function click(){
      if (state==='idle' || state==='result') { arm(); return; }
      if (state==='wait') { clearTimeout(timer); state='result'; set('early','Too early!','Click to retry'); return; }
      if (state==='go') {
        const ms = Math.round(performance.now()-t0);
        times.push(ms); if (times.length>5) times.shift();
        if (best===null || ms<best) best=ms;
        state='result'; set('', ms+' ms', 'Click to go again'); hud(ms);
      }
    }
    pad.addEventListener('click', click);
    function setActive(on){ if (on) idle(); else { clearTimeout(timer); } }
    idle();
    return { setActive };
  })();

  /* ===================== TRADING BLITZ (60-second timed) ===================== */
  const Blitz = (function() {
    const START = 100000, DURATION = 60, TICK = 350;
    const cvs = document.getElementById('blitz-chart');
    const ctx = cvs.getContext('2d');
    let price, hist, cash, shares, timeLeft, running = false, best = null;
    let tickIv = null, clockIv = null, t0 = 0;

    const fmt = n => (n<0?'-':'') + '$' + Math.round(Math.abs(n)).toLocaleString('en-US');
    const rnd = () => Math.random()*2 - 1;
    const fmtTime = s => Math.floor(s/60) + ':' + String(Math.floor(s%60)).padStart(2,'0');
    const net = () => cash + shares*price;

    function clearTimers() { clearInterval(tickIv); clearInterval(clockIv); tickIv = clockIv = null; }

    function seed() { cash = START; shares = 0; price = 120; hist = [price]; timeLeft = DURATION; }

    function start() {
      clearTimers(); seed(); running = true; t0 = Date.now();
      tickIv = setInterval(tick, TICK);
      clockIv = setInterval(clock, 100);
      render(); draw();
    }
    function clock() {
      timeLeft = Math.max(0, DURATION - (Date.now()-t0)/1000);
      const el = document.getElementById('blitz-time');
      el.textContent = fmtTime(timeLeft);
      el.style.color = timeLeft <= 10 ? 'var(--ruby)' : '';
      if (timeLeft <= 0) end();
    }
    function tick() {
      price = Math.max(1, price * (1 + 0.0008 + 0.013*rnd() + (Math.random()<0.07 ? rnd()*0.05 : 0)));
      hist.push(price); if (hist.length>120) hist.shift();
      render(); draw();
    }
    function goLong() {
      if (!running || shares>0) return;
      const q = Math.floor(cash/price);
      if (q>0) { cash -= q*price; shares += q; render(); draw(); }
    }
    function goFlat() {
      if (!running || shares<=0) return;
      cash += shares*price; shares = 0; render(); draw();
    }
    function end() {
      clearTimers(); running = false;
      if (shares>0) { cash += shares*price; shares = 0; }   // auto-liquidate at buzzer
      const pnl = net() - START;
      const isBest = best===null || pnl>best;
      if (isBest) best = pnl;
      render(); drawResult(pnl, isBest);
    }

    function render() {
      document.getElementById('blitz-cash').textContent = fmt(cash);
      document.getElementById('blitz-pos').textContent = shares>0 ? `Long ${shares.toLocaleString()}` : 'Flat';
      const pnl = net() - START;
      const pe = document.getElementById('blitz-pnl');
      pe.textContent = (pnl>=0?'+':'') + fmt(pnl);
      pe.style.color = pnl>=0 ? 'var(--emerald)' : 'var(--ruby)';
      document.getElementById('blitz-best').textContent = best===null ? '—' : (best>=0?'+':'') + fmt(best);
      document.getElementById('blitz-price').textContent = '$' + price.toFixed(2);
      const prev = hist.length>=2 ? hist[hist.length-2] : price;
      const chg = (price-prev)/prev*100;
      const ce = document.getElementById('blitz-chg');
      ce.textContent = (chg>=0?'+':'') + chg.toFixed(2) + '%';
      ce.className = 'market-change ' + (chg>=0?'up':'dn');
      document.getElementById('blitz-time').textContent = fmtTime(timeLeft);
    }

    function draw() {
      const W=cvs.width, H=cvs.height;
      ctx.fillStyle='#03050e'; ctx.fillRect(0,0,W,H);
      const h=hist, mn=Math.min(...h), mx=Math.max(...h), rng=(mx-mn)||1;
      const pl=4, pr=62, pt=10, pb=10, cw=W-pl-pr, ch=H-pt-pb;
      const X=i=>pl+(i/((h.length-1)||1))*cw, Y=v=>pt+ch*(1-(v-mn)/rng);
      ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1; ctx.textAlign='left';
      [0,0.5,1].forEach(f=>{ const y=pt+ch*f;
        ctx.beginPath(); ctx.moveTo(pl,y); ctx.lineTo(W-pr,y); ctx.stroke();
        ctx.fillStyle='#3d4a62'; ctx.font="9px 'Fira Code',monospace";
        ctx.fillText('$'+(mx-(mx-mn)*f).toFixed(2), W-pr+5, y+3); });
      const long = shares>0;
      const col = long ? '#00b4d8' : '#8a93a8';
      ctx.beginPath(); h.forEach((v,i)=> i===0?ctx.moveTo(X(i),Y(v)):ctx.lineTo(X(i),Y(v)));
      ctx.lineTo(X(h.length-1),pt+ch); ctx.lineTo(pl,pt+ch); ctx.closePath();
      const g=ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0, long?'rgba(0,180,216,0.25)':'rgba(138,147,168,0.12)'); g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g; ctx.fill();
      ctx.beginPath(); h.forEach((v,i)=> i===0?ctx.moveTo(X(i),Y(v)):ctx.lineTo(X(i),Y(v)));
      ctx.strokeStyle=col; ctx.lineWidth=1.6; ctx.stroke();
      ctx.beginPath(); ctx.arc(X(h.length-1),Y(h[h.length-1]),3.5,0,Math.PI*2);
      ctx.fillStyle='#c9a84c'; ctx.fill();
      if (long && running) {
        ctx.textAlign='left'; ctx.fillStyle='#00b4d8'; ctx.font="bold 10px 'Fira Code',monospace";
        ctx.fillText('● LONG', pl+4, pt+12);
      }
    }
    function overlay(title, sub, color) {
      const W=cvs.width, H=cvs.height;
      ctx.fillStyle='rgba(3,5,14,0.80)'; ctx.fillRect(0,0,W,H);
      ctx.textAlign='center';
      ctx.fillStyle=color||'#c9a84c'; ctx.font="bold 19px 'Fira Code',monospace";
      ctx.fillText(title, W/2, H/2-6);
      if (sub) { ctx.fillStyle='#8a93a8'; ctx.font="12px 'Fira Code',monospace"; ctx.fillText(sub, W/2, H/2+16); }
    }
    function drawIdle() { draw(); overlay('Press Start Blitz', '60 seconds · time the market'); }
    function drawResult(pnl, isBest) {
      draw();
      overlay('TIME! P&L ' + (pnl>=0?'+':'') + fmt(pnl),
        isBest ? 'New best run! · Start to retry' : 'Start to retry',
        pnl>=0 ? '#00a878' : '#c0392b');
    }

    document.getElementById('blitz-buy').addEventListener('click', goLong);
    document.getElementById('blitz-sell').addEventListener('click', goFlat);
    document.getElementById('blitz-start').addEventListener('click', start);

    function setActive(on) {
      if (!on) { clearTimers(); running = false; }
      else { draw(); }
    }

    seed(); render(); drawIdle();
    return { setActive };
  })();

  /* ===================== FLAPPY ===================== */
  const Flappy = (function() {
    const cvs = document.getElementById('flappy-canvas');
    const ctx = cvs.getContext('2d');
    const W = cvs.width, H = cvs.height;
    const GRAV = 0.12, FLAP = -4.4, SPEED = 2.0, MAX_VY = 4.2;
    const GAP = 150, PIPE_W = 56, PIPE_IV = 1700;
    const BIRD_X = 90, BIRD_R = 13;
    const GROUND_H = 30, playH = H - GROUND_H, SKY_W = W;
    let y = H/2, vy = 0, pipes = [], score = 0, best = 0, state = 'idle', raf = null, live = false, lastPipe = 0;
    let wingPhase = 0, skyScroll = 0, groundScroll = 0, lastT = 0;

    // ── decorative background, generated once ──
    const stars = Array.from({length:36}, () => ({
      x: Math.random()*W, y: Math.random()*playH*0.8,
      s: Math.random()<0.3 ? 2 : 1, p: Math.random()*6.28
    }));
    const clouds = Array.from({length:4}, () => ({
      x: Math.random()*W, y: 26+Math.random()*110,
      scale: 0.6+Math.random()*0.8, spd: 0.12+Math.random()*0.22
    }));
    const buildings = (() => {
      const arr=[]; let x=0;
      while (x < SKY_W) {
        const w = 24+Math.random()*30, h = 42+Math.random()*92, win=[];
        for (let wy=8; wy<h-6; wy+=12)
          for (let wx=5; wx<w-5; wx+=10)
            if (Math.random()<0.5) win.push({x:wx, y:wy});
        arr.push({x, w, h, win}); x += w + 4 + Math.random()*10;
      }
      return arr;
    })();

    // ── gradients built once (rebuilding per-frame is a major mobile cost) ──
    const SKY_GRAD = ctx.createLinearGradient(0,0,0,playH);
    SKY_GRAD.addColorStop(0,'#06091a'); SKY_GRAD.addColorStop(0.55,'#0c1430'); SKY_GRAD.addColorStop(1,'#1a2750');
    const GLOW_GRAD = ctx.createRadialGradient(W*0.5, playH, 8, W*0.5, playH, W*0.75);
    GLOW_GRAD.addColorStop(0,'rgba(201,168,76,0.14)'); GLOW_GRAD.addColorStop(1,'rgba(201,168,76,0)');
    const GROUND_GRAD = ctx.createLinearGradient(0, playH, 0, H);
    GROUND_GRAD.addColorStop(0,'#21340f'); GROUND_GRAD.addColorStop(1,'#0e1808');
    const BIRD_GRAD = ctx.createRadialGradient(-3,-4,2, 0,0,BIRD_R+5);
    BIRD_GRAD.addColorStop(0,'#ffe7a0'); BIRD_GRAD.addColorStop(0.5,'#f4b400'); BIRD_GRAD.addColorStop(1,'#d07e00');

    function reset() {
      y = H/2; vy = 0; pipes = []; score = 0; lastPipe = 0; state = 'running';
      updateHud();
    }
    function updateHud() {
      document.getElementById('flappy-score').textContent = score;
      document.getElementById('flappy-best').textContent = best;
    }
    function flap() {
      if (state === 'running') { vy = FLAP; wingPhase = -Math.PI/2; return; }
      reset();                       // idle or dead → (re)start
    }
    function addPipe() {
      const margin = 46;
      const top = margin + Math.random() * (playH - GAP - margin*2);
      pipes.push({ x: W, top, passed: false });
    }
    function loop(t) {
      raf = requestAnimationFrame(loop);
      const dt = lastT ? Math.min(2.5, (t - lastT) / 16.667) : 1; lastT = t;  // frames since last tick (60fps = 1)
      const moving = state === 'running';

      // background drifts even on idle/dead so the scene stays alive
      clouds.forEach(c => { c.x -= c.spd * dt; if (c.x < -70) { c.x = W+40; c.y = 26+Math.random()*110; } });
      skyScroll += (moving ? 0.5 : 0.25) * dt;
      groundScroll += (moving ? SPEED : 0.6) * dt;
      wingPhase += (moving ? 0.3 : 0.12) * dt;

      if (moving) {
        if (!lastPipe) lastPipe = t;
        if (t - lastPipe >= PIPE_IV) { addPipe(); lastPipe = t; }

        vy += GRAV * dt; if (vy > MAX_VY) vy = MAX_VY;
        y += vy * dt;
        pipes.forEach(p => p.x -= SPEED * dt);
        pipes = pipes.filter(p => p.x + PIPE_W > 0);

        for (const p of pipes) {
          if (!p.passed && p.x + PIPE_W < BIRD_X) {
            p.passed = true; score++; best = Math.max(score, best); updateHud();
          }
          const inX = BIRD_X + BIRD_R > p.x && BIRD_X - BIRD_R < p.x + PIPE_W;
          const hitGap = y - BIRD_R < p.top || y + BIRD_R > p.top + GAP;
          if (inX && hitGap) die();
        }
        if (y + BIRD_R >= playH || y - BIRD_R <= 0) die();
      }
      draw();
    }
    function die() { state = 'dead'; }

    function drawBackground() {
      // dusk sky gradient + horizon glow (cached)
      ctx.fillStyle = SKY_GRAD; ctx.fillRect(0,0,W,playH);
      ctx.fillStyle = GLOW_GRAD; ctx.fillRect(0,0,W,playH);
      // stars (twinkle)
      stars.forEach(s => {
        ctx.globalAlpha = 0.25 + 0.45*(0.5+0.5*Math.sin(wingPhase*0.5 + s.p));
        ctx.fillStyle = '#dfe6ff'; ctx.fillRect(s.x, s.y, s.s, s.s);
      });
      ctx.globalAlpha = 1;
      // clouds
      clouds.forEach(c => {
        ctx.fillStyle = 'rgba(180,196,230,0.07)';
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, 26*c.scale, 12*c.scale, 0, 0, Math.PI*2);
        ctx.ellipse(c.x+17*c.scale, c.y+4*c.scale, 18*c.scale, 9*c.scale, 0, 0, Math.PI*2);
        ctx.ellipse(c.x-17*c.scale, c.y+4*c.scale, 16*c.scale, 8*c.scale, 0, 0, Math.PI*2);
        ctx.fill();
      });
      // parallax skyline silhouette
      const off = skyScroll % SKY_W;
      for (let base = -off; base < W; base += SKY_W) {
        buildings.forEach(b => {
          const bx = base + b.x;
          if (bx > W || bx + b.w < 0) return;
          ctx.fillStyle = '#0a1228';
          ctx.fillRect(bx, playH-b.h, b.w, b.h);
          ctx.fillStyle = 'rgba(201,168,76,0.22)';
          b.win.forEach(w => ctx.fillRect(bx+w.x, playH-b.h+w.y, 3, 3));
        });
      }
    }
    function drawPipes() {
      pipes.forEach(p => {
        ctx.fillStyle = '#1f7a5a';
        ctx.fillRect(p.x, 0, PIPE_W, p.top);
        ctx.fillRect(p.x, p.top+GAP, PIPE_W, playH-(p.top+GAP));
        // lip caps
        const capH = 14, capO = 4;
        ctx.fillStyle = '#34c08c';
        ctx.fillRect(p.x-capO, p.top-capH, PIPE_W+capO*2, capH);
        ctx.fillRect(p.x-capO, p.top+GAP, PIPE_W+capO*2, capH);
        // highlight + shadow stripes for sheen
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fillRect(p.x+6, 0, 4, p.top);
        ctx.fillRect(p.x+6, p.top+GAP, 4, playH-(p.top+GAP));
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(p.x+PIPE_W-9, 0, 4, p.top);
        ctx.fillRect(p.x+PIPE_W-9, p.top+GAP, 4, playH-(p.top+GAP));
      });
    }
    function drawGround() {
      ctx.fillStyle = GROUND_GRAD; ctx.fillRect(0, playH, W, GROUND_H);
      ctx.fillStyle = '#3aa15c'; ctx.fillRect(0, playH, W, 3);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      const dw = 18, doff = groundScroll % dw;
      for (let x = -doff; x < W; x += dw) ctx.fillRect(x, playH+10, 9, 3);
    }
    function drawBird() {
      const angle = Math.max(-0.5, Math.min(1.1, vy/13));
      ctx.save();
      ctx.translate(BIRD_X, y);
      ctx.rotate(angle);
      // body (cached gradient, no shadow blur)
      ctx.fillStyle = BIRD_GRAD;
      ctx.beginPath(); ctx.ellipse(0, 0, BIRD_R+2, BIRD_R, 0, 0, Math.PI*2); ctx.fill();
      // tail
      ctx.fillStyle = '#cf7d00';
      ctx.beginPath(); ctx.moveTo(-BIRD_R+1,-3); ctx.lineTo(-BIRD_R-8,-7); ctx.lineTo(-BIRD_R-6,4); ctx.closePath(); ctx.fill();
      // wing (flaps)
      const wf = Math.sin(wingPhase);
      ctx.fillStyle = '#ffd45e';
      ctx.beginPath(); ctx.ellipse(-3, 3, 8, 5, -0.35 + wf*0.4, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = 'rgba(150,100,0,0.45)'; ctx.lineWidth = 1; ctx.stroke();
      // eye
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(6,-5, 3.6, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#06091a'; ctx.beginPath(); ctx.arc(7.2,-5, 1.8, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(6.4,-5.7, 0.7, 0, Math.PI*2); ctx.fill();
      // beak
      ctx.fillStyle = '#ff8c1a';
      ctx.beginPath(); ctx.moveTo(BIRD_R-2,-3); ctx.lineTo(BIRD_R+9,-0.5); ctx.lineTo(BIRD_R-2,2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e06d00';
      ctx.beginPath(); ctx.moveTo(BIRD_R-2,2); ctx.lineTo(BIRD_R+8,1.5); ctx.lineTo(BIRD_R-2,4.5); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    function draw() {
      drawBackground();
      drawPipes();
      drawGround();
      drawBird();
      // score (live)
      if (state === 'running') {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f4e6c0'; ctx.font = `bold 32px 'Fira Code',monospace`;
        ctx.fillText(score, W/2, 54);
      }
      if (state === 'idle') {
        ctx.fillStyle = 'rgba(3,5,14,0.55)'; ctx.fillRect(0,0,W,H);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#c9a84c'; ctx.font = `bold 17px 'Fira Code',monospace`;
        ctx.fillText('Tap or press Start', W/2, H/2-4);
        ctx.fillStyle = '#9fb0cc'; ctx.font = `11px 'Fira Code',monospace`;
        ctx.fillText('Click / Space / Tap to flap', W/2, H/2+22);
      }
      if (state === 'dead') {
        ctx.fillStyle = 'rgba(3,5,14,0.66)'; ctx.fillRect(0,0,W,H);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#c0392b'; ctx.font = `bold 20px 'Fira Code',monospace`;
        ctx.fillText('Game Over', W/2, H/2-18);
        ctx.fillStyle = '#c9a84c'; ctx.font = `13px 'Fira Code',monospace`;
        ctx.fillText('Score: '+score, W/2, H/2+8);
        ctx.fillStyle = '#9fb0cc'; ctx.font = `11px 'Fira Code',monospace`;
        ctx.fillText('Tap or Start to retry', W/2, H/2+32);
      }
    }

    cvs.addEventListener('click', flap);
    cvs.addEventListener('touchstart', e => { e.preventDefault(); flap(); }, {passive:false});
    document.addEventListener('keydown', e => {
      if (!live) return;
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'Enter') { e.preventDefault(); flap(); }
    });
    document.getElementById('flappy-start').addEventListener('click', reset);

    function setActive(on) {
      live = on;
      if (on) {
        lastT = 0;                                   // reset delta clock so dt doesn't spike
        if (state === 'running') state = 'idle';   // don't resume mid-fall after switching away
        if (!raf) raf = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(raf); raf = null;
      }
      draw();
    }
    draw();
    return { setActive };
  })();

  /* ===================== BREAKOUT ===================== */
  const Breakout = (function() {
    const cvs = document.getElementById('breakout-canvas');
    const ctx = cvs.getContext('2d');
    const W = cvs.width, H = cvs.height;
    const PADDLE_W = 74, PADDLE_H = 11, PADDLE_Y = H-26;
    const COLS = 8, ROWS = 5, BRICK_H = 16, BRICK_TOP = 46, GAPB = 5;
    const BRICK_W = (W - GAPB*(COLS+1)) / COLS;
    const PALETTE = ['#c0392b','#e8954b','#e8c97a','#2fae7e','#00b4d8'];
    let px = (W-PADDLE_W)/2, ball = null, bricks = [], score = 0, lives = 3, best = 0;
    let state = 'idle', raf = null, live = false, tick = 0, lastT = 0;
    const keys = {};
    const stars = Array.from({length:30}, () => ({x:Math.random()*W, y:Math.random()*H, s:Math.random()<0.3?2:1, p:Math.random()*6.28}));
    const SKY_GRAD = ctx.createLinearGradient(0,0,0,H);
    SKY_GRAD.addColorStop(0,'#06091a'); SKY_GRAD.addColorStop(1,'#16213f');

    function updateHud() {
      document.getElementById('breakout-score').textContent = score;
      document.getElementById('breakout-lives').textContent = lives;
      document.getElementById('breakout-best').textContent = best;
    }
    function buildBricks() {
      bricks = [];
      for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++)
        bricks.push({ x:GAPB+c*(BRICK_W+GAPB), y:BRICK_TOP+r*(BRICK_H+GAPB), w:BRICK_W, h:BRICK_H, alive:true, color:PALETTE[r%PALETTE.length] });
    }
    function launch() { ball = { x:W/2, y:PADDLE_Y-20, vx:(Math.random()<0.5?-1:1)*1.7, vy:-2.2, r:6 }; }
    function reset() { px=(W-PADDLE_W)/2; score=0; lives=3; buildBricks(); launch(); state='running'; updateHud(); }
    function loseLife() { lives--; updateHud(); if (lives<=0) state='dead'; else { launch(); px=(W-PADDLE_W)/2; } }
    function loop(t) {
      raf = requestAnimationFrame(loop);
      const dt = lastT ? Math.min(2.5, (t - lastT) / 16.667) : 1; lastT = t;
      tick += dt;
      if (state==='running') {
        if (keys.left) px -= 6.5*dt; if (keys.right) px += 6.5*dt;
        px = Math.max(0, Math.min(W-PADDLE_W, px));
        ball.x += ball.vx*dt; ball.y += ball.vy*dt;
        if (ball.x-ball.r<0) { ball.x=ball.r; ball.vx*=-1; }
        if (ball.x+ball.r>W) { ball.x=W-ball.r; ball.vx*=-1; }
        if (ball.y-ball.r<0) { ball.y=ball.r; ball.vy*=-1; }
        if (ball.vy>0 && ball.y+ball.r>=PADDLE_Y && ball.y+ball.r<=PADDLE_Y+PADDLE_H+8 && ball.x>=px && ball.x<=px+PADDLE_W) {
          ball.y = PADDLE_Y-ball.r;
          const hit = (ball.x-(px+PADDLE_W/2))/(PADDLE_W/2);
          const speed = Math.min(4.6, Math.hypot(ball.vx,ball.vy)+0.1);
          const ang = hit*1.05;
          ball.vx = speed*Math.sin(ang); ball.vy = -Math.abs(speed*Math.cos(ang));
        }
        if (ball.y-ball.r>H) loseLife();
        for (const b of bricks) {
          if (!b.alive) continue;
          if (ball.x+ball.r>b.x && ball.x-ball.r<b.x+b.w && ball.y+ball.r>b.y && ball.y-ball.r<b.y+b.h) {
            b.alive=false; score+=10; best=Math.max(score,best); updateHud();
            const ox = Math.min(ball.x+ball.r-b.x, b.x+b.w-(ball.x-ball.r));
            const oy = Math.min(ball.y+ball.r-b.y, b.y+b.h-(ball.y-ball.r));
            if (ox<oy) ball.vx*=-1; else ball.vy*=-1;
            break;
          }
        }
        if (bricks.every(b=>!b.alive)) state='win';
      }
      draw();
    }
    function draw() {
      ctx.fillStyle=SKY_GRAD; ctx.fillRect(0,0,W,H);
      stars.forEach(s=>{ ctx.globalAlpha=0.2+0.45*(0.5+0.5*Math.sin(tick*0.04+s.p)); ctx.fillStyle='#dfe6ff'; ctx.fillRect(s.x,s.y,s.s,s.s); });
      ctx.globalAlpha=1;
      bricks.forEach(b=>{ if(!b.alive) return;
        ctx.fillStyle=b.color; ctx.fillRect(b.x,b.y,b.w,b.h);
        ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.fillRect(b.x,b.y,b.w,3);
      });
      ctx.fillStyle='#c9a84c'; ctx.fillRect(px,PADDLE_Y,PADDLE_W,PADDLE_H);
      if (ball) { ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fill(); }
      overlay();
    }
    function overlay() {
      ctx.textAlign='center';
      if (state==='idle') {
        ctx.fillStyle='rgba(3,5,14,0.6)'; ctx.fillRect(0,0,W,H);
        ctx.fillStyle='#c9a84c'; ctx.font=`bold 17px 'Fira Code',monospace`; ctx.fillText('Tap or press Start', W/2, H/2-4);
        ctx.fillStyle='#9fb0cc'; ctx.font=`11px 'Fira Code',monospace`; ctx.fillText('Mouse / Arrows to move the paddle', W/2, H/2+22);
      } else if (state==='dead' || state==='win') {
        ctx.fillStyle='rgba(3,5,14,0.7)'; ctx.fillRect(0,0,W,H);
        ctx.fillStyle = state==='win' ? '#2fae7e' : '#c0392b'; ctx.font=`bold 20px 'Fira Code',monospace`;
        ctx.fillText(state==='win'?'Cleared!':'Game Over', W/2, H/2-18);
        ctx.fillStyle='#c9a84c'; ctx.font=`13px 'Fira Code',monospace`; ctx.fillText('Score: '+score, W/2, H/2+8);
        ctx.fillStyle='#9fb0cc'; ctx.font=`11px 'Fira Code',monospace`; ctx.fillText('Tap or Start to play again', W/2, H/2+32);
      }
    }
    cvs.addEventListener('mousemove', e => { const r=cvs.getBoundingClientRect(); px=Math.max(0,Math.min(W-PADDLE_W,(e.clientX-r.left)/r.width*W-PADDLE_W/2)); });
    cvs.addEventListener('touchmove', e => { e.preventDefault(); const r=cvs.getBoundingClientRect(); px=Math.max(0,Math.min(W-PADDLE_W,(e.touches[0].clientX-r.left)/r.width*W-PADDLE_W/2)); }, {passive:false});
    cvs.addEventListener('click', () => { if (state!=='running') reset(); });
    document.addEventListener('keydown', e => { if(!live) return;
      if (e.key==='ArrowLeft'||e.key==='a'||e.key==='A') keys.left=true;
      if (e.key==='ArrowRight'||e.key==='d'||e.key==='D') keys.right=true;
      if (e.key==='Enter') { e.preventDefault(); if (state!=='running') reset(); } });
    document.addEventListener('keyup', e => {
      if (e.key==='ArrowLeft'||e.key==='a'||e.key==='A') keys.left=false;
      if (e.key==='ArrowRight'||e.key==='d'||e.key==='D') keys.right=false; });
    document.getElementById('breakout-start').addEventListener('click', reset);
    function setActive(on) { live=on; if (on) { lastT=0; if (state==='running') state='idle'; if(!raf) raf=requestAnimationFrame(loop); } else { cancelAnimationFrame(raf); raf=null; } draw(); }
    draw();
    return { setActive };
  })();

  /* ===================== PONG (vs CPU) ===================== */
  const Pong = (function() {
    const cvs = document.getElementById('pong-canvas');
    const ctx = cvs.getContext('2d');
    const W = cvs.width, H = cvs.height;
    const PADDLE_H = 64, PADDLE_W = 10, WIN = 7, LX = 20, RX = W-20-PADDLE_W;
    let lp=(H-PADDLE_H)/2, rp=(H-PADDLE_H)/2, ball=null, sl=0, sr=0;
    let state='idle', raf=null, live=false, tick=0, lastT=0;
    const keys = {};
    const stars = Array.from({length:26}, () => ({x:Math.random()*W, y:Math.random()*H, s:Math.random()<0.3?2:1, p:Math.random()*6.28}));
    const SKY_GRAD = ctx.createLinearGradient(0,0,0,H);
    SKY_GRAD.addColorStop(0,'#06091a'); SKY_GRAD.addColorStop(1,'#101a36');
    const clamp = (v,a,b) => Math.max(a, Math.min(b,v));

    function updateHud() {
      document.getElementById('pong-you').textContent = sr;
      document.getElementById('pong-cpu').textContent = sl;
    }
    function serve(dir) { ball = { x:W/2, y:H/2, vx:dir*2.1, vy:(Math.random()*2-1)*1.6, r:6 }; }
    function reset() { lp=rp=(H-PADDLE_H)/2; sl=0; sr=0; serve(Math.random()<0.5?1:-1); state='running'; updateHud(); }
    function bounce(py) {
      const hit=(ball.y-(py+PADDLE_H/2))/(PADDLE_H/2);
      const speed=Math.min(5.5, Math.hypot(ball.vx,ball.vy)+0.2), ang=hit*0.9;
      ball.vx=(ball.vx>0?-1:1)*Math.abs(speed*Math.cos(ang)); ball.vy=speed*Math.sin(ang);
    }
    function loop(t) {
      raf=requestAnimationFrame(loop);
      const dt = lastT ? Math.min(2.5, (t - lastT) / 16.667) : 1; lastT = t;
      tick += dt;
      if (state==='running') {
        if (keys.up) rp-=6.5*dt; if (keys.down) rp+=6.5*dt;
        rp=clamp(rp,0,H-PADDLE_H);
        const aiC=lp+PADDLE_H/2;                 // CPU tracks ball with capped speed
        if (aiC<ball.y-8) lp+=3.1*dt; else if (aiC>ball.y+8) lp-=3.1*dt;
        lp=clamp(lp,0,H-PADDLE_H);
        ball.x+=ball.vx*dt; ball.y+=ball.vy*dt;
        if (ball.y-ball.r<0) { ball.y=ball.r; ball.vy*=-1; }
        if (ball.y+ball.r>H) { ball.y=H-ball.r; ball.vy*=-1; }
        if (ball.vx<0 && ball.x-ball.r<=LX+PADDLE_W && ball.x>LX && ball.y>=lp && ball.y<=lp+PADDLE_H) { bounce(lp); ball.x=LX+PADDLE_W+ball.r; }
        if (ball.vx>0 && ball.x+ball.r>=RX && ball.x<RX+PADDLE_W && ball.y>=rp && ball.y<=rp+PADDLE_H) { bounce(rp); ball.x=RX-ball.r; }
        if (ball.x+ball.r<0) { sr++; updateHud(); sr>=WIN ? state='win' : serve(-1); }
        if (ball.x-ball.r>W) { sl++; updateHud(); sl>=WIN ? state='lose' : serve(1); }
      }
      draw();
    }
    function draw() {
      ctx.fillStyle=SKY_GRAD; ctx.fillRect(0,0,W,H);
      stars.forEach(s=>{ ctx.globalAlpha=0.2+0.4*(0.5+0.5*Math.sin(tick*0.04+s.p)); ctx.fillStyle='#dfe6ff'; ctx.fillRect(s.x,s.y,s.s,s.s); });
      ctx.globalAlpha=1;
      ctx.fillStyle='rgba(201,168,76,0.18)';
      for (let yy=8; yy<H; yy+=24) ctx.fillRect(W/2-1.5, yy, 3, 13);
      ctx.fillStyle='#9fb0cc'; ctx.font=`bold 30px 'Fira Code',monospace`; ctx.textAlign='center';
      ctx.fillText(sl, W*0.32, 44); ctx.fillStyle='#c9a84c'; ctx.fillText(sr, W*0.68, 44);
      ctx.fillStyle='#7fb0ff'; ctx.fillRect(LX,lp,PADDLE_W,PADDLE_H);
      ctx.fillStyle='#c9a84c'; ctx.fillRect(RX,rp,PADDLE_W,PADDLE_H);
      if (ball) { ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fill(); }
      ctx.textAlign='center';
      if (state==='idle') {
        ctx.fillStyle='rgba(3,5,14,0.6)'; ctx.fillRect(0,0,W,H);
        ctx.fillStyle='#c9a84c'; ctx.font=`bold 17px 'Fira Code',monospace`; ctx.fillText('Tap or press Start', W/2, H/2-4);
        ctx.fillStyle='#9fb0cc'; ctx.font=`11px 'Fira Code',monospace`; ctx.fillText('Mouse / ↑ ↓ · first to '+WIN+' wins', W/2, H/2+22);
      } else if (state==='win'||state==='lose') {
        ctx.fillStyle='rgba(3,5,14,0.7)'; ctx.fillRect(0,0,W,H);
        ctx.fillStyle = state==='win'?'#2fae7e':'#c0392b'; ctx.font=`bold 22px 'Fira Code',monospace`;
        ctx.fillText(state==='win'?'You Win!':'CPU Wins', W/2, H/2-6);
        ctx.fillStyle='#9fb0cc'; ctx.font=`11px 'Fira Code',monospace`; ctx.fillText('Tap or Start to rematch', W/2, H/2+22);
      }
    }
    cvs.addEventListener('mousemove', e => { const r=cvs.getBoundingClientRect(); rp=clamp((e.clientY-r.top)/r.height*H-PADDLE_H/2,0,H-PADDLE_H); });
    cvs.addEventListener('touchmove', e => { e.preventDefault(); const r=cvs.getBoundingClientRect(); rp=clamp((e.touches[0].clientY-r.top)/r.height*H-PADDLE_H/2,0,H-PADDLE_H); }, {passive:false});
    cvs.addEventListener('click', () => { if (state!=='running') reset(); });
    document.addEventListener('keydown', e => { if(!live) return;
      if (e.key==='ArrowUp'||e.key==='w'||e.key==='W') { e.preventDefault(); keys.up=true; }
      if (e.key==='ArrowDown'||e.key==='s'||e.key==='S') { e.preventDefault(); keys.down=true; }
      if (e.key==='Enter') { e.preventDefault(); if (state!=='running') reset(); } });
    document.addEventListener('keyup', e => {
      if (e.key==='ArrowUp'||e.key==='w'||e.key==='W') keys.up=false;
      if (e.key==='ArrowDown'||e.key==='s'||e.key==='S') keys.down=false; });
    document.getElementById('pong-start').addEventListener('click', reset);
    function setActive(on) { live=on; if (on) { lastT=0; if (state==='running') state='idle'; if(!raf) raf=requestAnimationFrame(loop); } else { cancelAnimationFrame(raf); raf=null; } draw(); }
    draw();
    return { setActive };
  })();

  /* ===================== MINESWEEPER ===================== */
  const Mines = (function() {
    const COLS=10, ROWS=10, MINES=15;
    const grid = document.getElementById('mines-grid');
    let cells=[], flags=0, over=false, started=false, secs=0, tInt=null, best=null;

    function updateHud() {
      document.getElementById('mines-flags').textContent = MINES-flags;
      document.getElementById('mines-time').textContent = secs;
      document.getElementById('mines-best').textContent = best===null ? '—' : best+'s';
    }
    function setStatus(t) { document.getElementById('mines-status').textContent = t; }
    function startTimer() { tInt=setInterval(()=>{ secs++; updateHud(); }, 1000); }
    function neighbors(i) {
      const r=Math.floor(i/COLS), c=i%COLS, out=[];
      for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
        if (!dr&&!dc) continue; const nr=r+dr, nc=c+dc;
        if (nr>=0&&nr<ROWS&&nc>=0&&nc<COLS) out.push(nr*COLS+nc);
      }
      return out;
    }
    function placeMines(safe) {
      let placed=0;
      while (placed<MINES) { const i=Math.floor(Math.random()*cells.length); if (cells[i].mine||i===safe) continue; cells[i].mine=true; placed++; }
      cells.forEach((c,i)=>{ if(!c.mine) c.adj=neighbors(i).filter(n=>cells[n].mine).length; });
    }
    function reveal(i) {
      if (over) return; const c=cells[i]; if (c.revealed||c.flagged) return;
      if (!started) { started=true; placeMines(i); startTimer(); }
      c.revealed=true; c.el.classList.add('revealed');
      if (c.mine) { c.el.textContent='💣'; c.el.classList.add('boom'); lose(); return; }
      if (c.adj>0) { c.el.textContent=c.adj; c.el.dataset.n=c.adj; }
      else neighbors(i).forEach(reveal);
      checkWin();
    }
    function toggleFlag(i) {
      if (over) return; const c=cells[i]; if (c.revealed) return;
      c.flagged=!c.flagged; c.el.classList.toggle('flagged',c.flagged);
      c.el.textContent=c.flagged?'🚩':''; flags+=c.flagged?1:-1; updateHud();
    }
    function lose() {
      over=true; clearInterval(tInt); setStatus('💥 Boom!');
      cells.forEach(c=>{ if (c.mine&&!c.revealed){ c.el.textContent='💣'; c.el.classList.add('revealed'); } });
    }
    function checkWin() {
      if (cells.every(c=>c.revealed||c.mine)) {
        over=true; clearInterval(tInt); setStatus('🏆 Cleared!');
        if (best===null||secs<best) best=secs; updateHud();
      }
    }
    function newGame() {
      clearInterval(tInt); tInt=null; started=false; over=false; flags=0; secs=0;
      setStatus('Find all safe cells'); cells=[]; grid.innerHTML='';
      for (let i=0;i<COLS*ROWS;i++) {
        const el=document.createElement('button'); el.className='mine-cell'; const idx=i;
        el.addEventListener('click', ()=>reveal(idx));
        el.addEventListener('contextmenu', e=>{ e.preventDefault(); toggleFlag(idx); });
        let lp=null;
        el.addEventListener('touchstart', ()=>{ lp=setTimeout(()=>{ toggleFlag(idx); lp=null; }, 350); }, {passive:true});
        el.addEventListener('touchend', e=>{ if (lp){ clearTimeout(lp); lp=null; } });
        grid.appendChild(el);
        cells.push({ mine:false, adj:0, revealed:false, flagged:false, el });
      }
      updateHud();
    }
    document.getElementById('mines-new').addEventListener('click', newGame);
    function setActive(on) { if (!on) clearInterval(tInt); else if (started&&!over&&!tInt) startTimer(); }
    newGame();
    return { setActive };
  })();

  /* ===================== WHACK-A-MOLE ===================== */
  const Whack = (function() {
    const grid = document.getElementById('whack-grid');
    const HOLES=9, DURATION=30;
    let holes=[], score=0, best=0, timeLeft=DURATION, running=false, upIdx=-1, spawnT=null, clockT=null, t0=0;

    function updateHud() {
      document.getElementById('whack-score').textContent = score;
      document.getElementById('whack-time').textContent = Math.ceil(timeLeft);
      document.getElementById('whack-best').textContent = best;
    }
    function clearTimers() { clearTimeout(spawnT); clearInterval(clockT); spawnT=clockT=null; }
    function hide() { if (upIdx>=0) holes[upIdx].classList.remove('up'); upIdx=-1; }
    function pop() {
      if (!running) return;
      hide();
      upIdx = Math.floor(Math.random()*HOLES);
      holes[upIdx].classList.add('up');
      const life = 650 + Math.random()*650;
      spawnT = setTimeout(()=>{ hide(); spawnT=setTimeout(pop, 120+Math.random()*250); }, life);
    }
    function hit(i) {
      if (!running || i!==upIdx) return;
      score++; best=Math.max(score,best); updateHud();
      holes[i].classList.add('bonk');
      setTimeout(()=>holes[i].classList.remove('bonk'), 150);
      hide(); clearTimeout(spawnT); spawnT=setTimeout(pop, 120+Math.random()*200);
    }
    function start() {
      clearTimers(); hide(); score=0; timeLeft=DURATION; running=true; t0=Date.now(); updateHud();
      clockT=setInterval(()=>{ timeLeft=Math.max(0,DURATION-(Date.now()-t0)/1000); updateHud(); if (timeLeft<=0) end(); }, 100);
      pop();
    }
    function end() { running=false; clearTimers(); hide(); }
    function build() {
      grid.innerHTML=''; holes=[];
      for (let i=0;i<HOLES;i++) {
        const el=document.createElement('button'); el.className='whack-hole'; el.innerHTML='<span class="mole"></span>'; const idx=i;
        el.addEventListener('click', ()=>hit(idx));
        grid.appendChild(el); holes.push(el);
      }
    }
    document.getElementById('whack-start').addEventListener('click', start);
    function setActive(on) { if (!on) { running=false; clearTimers(); hide(); } }
    build(); updateHud();
    return { setActive };
  })();

  /* ===================== LIBRARY / STAGE COORDINATOR ===================== */
  const games = { snake: Snake, g2048: G2048, market: Market, blitz: Blitz, tetris: Tetris, memory: Memory, reaction: Reaction, flappy: Flappy, breakout: Breakout, pong: Pong, mines: Mines, whack: Whack };
  const library = document.getElementById('arcade-library');
  const stage   = document.getElementById('arcade-stage');

  // show one game's panel inside the stage, pause the rest
  function showGame(g) {
    document.querySelectorAll('.arcade-panel').forEach(p => p.classList.toggle('hidden', p.id !== 'panel-'+g));
    document.querySelectorAll('.qchip').forEach(c => c.classList.toggle('active', c.dataset.game===g));
    Object.keys(games).forEach(k => games[k].setActive(k===g));
  }
  function openGame(g) {
    library.classList.add('arcade-hide');
    stage.classList.remove('arcade-hide');
    showGame(g);
  }
  function backToLibrary() {
    setExpanded(false);
    Object.keys(games).forEach(k => games[k].setActive(false));   // pause all timers
    stage.classList.add('arcade-hide');
    library.classList.remove('arcade-hide');
  }

  // ── Focus / expand mode: lifts the active game into a fullscreen overlay so
  //    clicks and scrolls can't land on the page behind the board ──
  const expandBtn = document.getElementById('arcade-expand');
  function setExpanded(on) {
    stage.classList.toggle('arcade-expanded', on);
    document.body.classList.toggle('arcade-locked', on);
    expandBtn.innerHTML = on
      ? '<i class="fas fa-compress"></i>&nbsp; Exit'
      : '<i class="fas fa-expand"></i>&nbsp; Focus';
    if (on) stage.scrollTop = 0;
  }
  expandBtn.addEventListener('click', () => setExpanded(!stage.classList.contains('arcade-expanded')));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && stage.classList.contains('arcade-expanded')) setExpanded(false);
  });

  document.querySelectorAll('.game-card').forEach(c => c.addEventListener('click', () => openGame(c.dataset.game)));
  document.querySelectorAll('.qchip').forEach(c => c.addEventListener('click', () => showGame(c.dataset.game)));
  document.getElementById('arcade-back').addEventListener('click', backToLibrary);

  // start on the library view with every game paused
  Object.keys(games).forEach(k => games[k].setActive(false));
})();
