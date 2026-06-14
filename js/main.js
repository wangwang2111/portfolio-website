// ── Custom cursor ──────────────────────────────────────────────
const curDot  = document.getElementById('cur-dot');
const curRing = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  curDot.style.left = mx + 'px';
  curDot.style.top  = my + 'px';
});
(function animRing() {
  rx += (mx - rx) * 0.13;
  ry += (my - ry) * 0.13;
  curRing.style.left = rx + 'px';
  curRing.style.top  = ry + 'px';
  requestAnimationFrame(animRing);
})();

document.querySelectorAll('a, button, .s-item, .p-tag, .cert-card, .stat-card, .p-card').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

// ── Navbar scroll ──────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () =>
  navbar.classList.toggle('scrolled', window.scrollY > 32), { passive: true });

// ── Hero particle canvas ───────────────────────────────────────
(function() {
  const cvs = document.getElementById('hero-canvas');
  const ctx = cvs.getContext('2d');
  let W, H;
  function resize() { W = cvs.width = cvs.offsetWidth; H = cvs.height = cvs.offsetHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COLS = ['rgba(201,168,76,', 'rgba(0,180,216,', 'rgba(0,119,182,'];
  const nodes = Array.from({ length: 75 }, () => ({
    x: Math.random() * (typeof W !== 'undefined' ? W : 1200),
    y: Math.random() * (typeof H !== 'undefined' ? H : 900),
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.8 + 0.8,
    col: COLS[Math.floor(Math.random() * COLS.length)],
    a: Math.random() * 0.55 + 0.2,
  }));

  let pmx = 600, pmy = 400;
  cvs.addEventListener('mousemove', e => { const r = cvs.getBoundingClientRect(); pmx = e.clientX - r.left; pmy = e.clientY - r.top; });

  function frame() {
    ctx.clearRect(0, 0, W, H);
    // connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 130) {
          ctx.strokeStyle = `rgba(201,168,76,${(1 - d/130) * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
        }
      }
    }
    // nodes
    for (const n of nodes) {
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
      ctx.fillStyle = n.col + n.a + ')'; ctx.fill();
      // mouse attraction
      const dx = pmx - n.x, dy = pmy - n.y, d = Math.sqrt(dx*dx + dy*dy);
      if (d < 180) { n.vx += dx * 0.00006; n.vy += dy * 0.00006; }
      n.vx *= 0.996; n.vy *= 0.996;
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      n.x = Math.max(0, Math.min(W, n.x));
      n.y = Math.max(0, Math.min(H, n.y));
    }
    requestAnimationFrame(frame);
  }
  frame();
})();

// ── Typewriter ─────────────────────────────────────────────────
(function() {
  const el = document.getElementById('typed');
  const lines = [
    'AI Engineer @ BMO',
    'Data Scientist & ML Engineer',
    'Multi-Agent AI Builder',
    'RAG Pipeline Architect',
    'Quant Trading Systems',
    'GenAI × FinTech',
  ];
  let li = 0, ci = 0, del = false;
  function tick() {
    const line = lines[li];
    if (!del) {
      el.textContent = line.slice(0, ++ci);
      if (ci === line.length) { setTimeout(() => { del = true; tick(); }, 2400); return; }
    } else {
      el.textContent = line.slice(0, --ci);
      if (ci === 0) { del = false; li = (li + 1) % lines.length; }
    }
    setTimeout(tick, del ? 42 : 70);
  }
  setTimeout(tick, 1400);
})();

// ── Ticker tape ────────────────────────────────────────────────
(function() {
  const items = [
    { sym:'PYTHON', val:'3.12', ch:'+∞', up:true },
    { sym:'SPARK', val:'3.5', ch:'+8.2%', up:true },
    { sym:'RAG', val:'LIVE', ch:'+42.0%', up:true },
    { sym:'LLM.ROUTER', val:'Claude+GPT4o', ch:'+10.5%', up:true },
    { sym:'AGENT', val:'MULTI', ch:'+99.9%', up:true },
    { sym:'KAFKA', val:'3.7', ch:'+5.1%', up:true },
    { sym:'AZURE', val:'PROD', ch:'+12.3%', up:true },
    { sym:'DATABRICKS', val:'CERT', ch:'+18.7%', up:true },
    { sym:'FOREX.BOT', val:'LIVE', ch:'+33.1%', up:true },
    { sym:'MSC.GPA', val:'95%', ch:'+MAX', up:true },
    { sym:'DOCKER', val:'26.0', ch:'+6.4%', up:true },
    { sym:'MLFLOW', val:'2.11', ch:'+7.8%', up:true },
    { sym:'FAISS', val:'1.7', ch:'+22.5%', up:true },
    { sym:'LANGCHAIN', val:'0.3', ch:'+15.0%', up:true },
    { sym:'CHROMA', val:'0.5', ch:'+11.2%', up:true },
  ];
  const html = items.map(i => `
    <span class="t-item">
      <span class="t-sym">${i.sym}</span>
      <span class="t-val">${i.val}</span>
      <span class="${i.up ? 't-up' : 't-dn'}">${i.up ? '▲' : '▼'} ${i.ch}</span>
      <span class="t-sep">·</span>
    </span>`).join('');
  const el = document.getElementById('tickerTrack');
  el.innerHTML = html + html;
})();

// ── Scroll reveal ──────────────────────────────────────────────
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

// ── Counters ───────────────────────────────────────────────────
const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.target;
    let cur = 0; const step = target / 50;
    const iv = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = Math.round(cur);
      if (cur >= target) clearInterval(iv);
    }, 28);
    cntObs.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-target]').forEach(el => cntObs.observe(el));

// ── Card 3D tilt ───────────────────────────────────────────────
document.querySelectorAll('.p-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `translateY(-5px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});

// ── Mobile nav ─────────────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
let navOpen = false;
navToggle.addEventListener('click', () => {
  navOpen = !navOpen;
  Object.assign(navLinks.style, navOpen ? {
    display: 'flex', flexDirection: 'column', position: 'absolute',
    top: '72px', left: '0', right: '0',
    background: 'rgba(3,5,14,0.97)', backdropFilter: 'blur(18px)',
    padding: '24px 40px', gap: '22px',
    borderBottom: '1px solid rgba(201,168,76,0.2)',
  } : { display: '' });
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { navOpen = false; navLinks.style.display = ''; }));

// ── Project Modal ───────────────────────────────────────────────
const PROJECTS = {
  bca: {
    color: '#00b4d8',
    type: 'Multi-Agent Platform',
    status: 'priv',
    statusLabel: 'Private · Siemens × ASCI Lab',
    title: 'Building Control Assistant',
    sub: 'Production-grade AI for occupancy analysis & energy optimization',
    desc: `A production-grade multi-agent AI platform developed in collaboration with Siemens and the ASCI Lab at Trent University. The system enables intelligent building control by analyzing occupancy patterns, optimizing energy consumption, and providing real-time decision support through a human-in-the-loop confirmation pipeline.`,
    highlights: [
      'Flask backend serving a Chart.js admin dashboard with real-time SSE streaming — agents push live status updates directly to the browser without polling.',
      'Multi-LLM routing layer dispatches queries to Claude 3, GPT-4o, or locally-hosted Ollama/DeepSeek depending on task complexity and latency budget.',
      'Self-healing execution agents: if a tool call or API request fails, the orchestrator automatically retries with an alternate strategy or escalates to HITL.',
      'Hybrid RAG pipeline combining ChromaDB (semantic search) and FAISS (dense retrieval) over building sensor data, maintenance logs, and control documentation.',
      'Human-in-the-Loop confirmation loop surfaces high-stakes actions (e.g., HVAC overrides) to operators before execution, with full audit trail logging.',
      'Containerized with Docker; all agent traces logged to MLflow for reproducibility and incident review.',
    ],
    media: [
      { src: './architecture.gif', label: 'System Architecture — agent orchestration & data flow' },
    ],
    tags: ['Multi-Agent AI', 'RAG Pipeline', 'Multi-LLM Routing', 'Flask', 'ChromaDB', 'FAISS', 'Self-Healing Agents', 'HITL', 'SSE Streaming', 'Docker', 'MLflow'],
    links: [],
  },
  signet: {
    color: '#c9a84c',
    type: 'Quant Trading System',
    status: 'pub',
    statusLabel: 'GitHub',
    title: 'Signet Trade',
    sub: 'Multi-AI Autonomous Trading Agent — Stocks & Forex',
    desc: `End-to-end autonomous trading system that combines deep learning signal generation with multi-agent orchestration for live execution across both equity and foreign exchange markets. Built for real capital deployment with robust risk controls at every layer.`,
    highlights: [
      'TCN-LSTM hybrid model: Temporal Convolutional Network captures multi-scale patterns; LSTM models sequential dependencies across intraday and daily timeframes.',
      'Multi-agent architecture separates signal generation, position sizing, execution routing, and risk monitoring into independent agents with defined interfaces.',
      'Live execution via Oanda REST API (Forex) and Interactive Brokers Gateway (Stocks) with order management and fill confirmation.',
      'Walk-forward validation prevents lookahead bias — models are retrained on a rolling window and validated on strictly out-of-sample data.',
      'Volatility-adjusted stop-loss dynamically scales risk per trade based on ATR; portfolio-level drawdown controls pause trading during adverse regimes.',
      'Backtesting engine with transaction cost modeling, slippage simulation, and Sharpe/Calmar ratio reporting.',
    ],
    media: [
      { src: './signet_multi_agent_architecture.gif', label: 'Multi-Agent Architecture — signal generation, execution & risk layers' },
    ],
    tags: ['TCN-LSTM', 'Oanda API', 'IB Gateway', 'Multi-Agent', 'Risk Management', 'Walk-Forward', 'Portfolio Allocation', 'PyTorch', 'Backtesting'],
    links: [{ icon: 'fab fa-github', label: 'View on GitHub', href: 'https://github.com/wangwang2111/stocks-and-forex-quantitative-trade-bot' }],
  },
  fraud: {
    color: '#e25a1c',
    type: 'Big Data Pipeline',
    status: 'pub',
    statusLabel: 'Open Source',
    title: 'Real-Time Fraud Detection',
    sub: 'Spark + Kafka + LLM Explanations',
    desc: `Scalable, real-time scam detection pipeline designed to classify phone dialogue transcripts as fraudulent or legitimate. Built on a Spark + Kafka streaming backbone with LLM-generated explanations surfaced per flagged call for human reviewers.`,
    highlights: [
      'Apache Kafka ingests raw call transcript streams; consumer groups route records to the Spark ML classification pipeline with sub-second latency.',
      'Spark MLlib pipeline: TF-IDF vectorization → logistic regression / gradient-boosted tree ensemble, tuned via cross-validation on labeled call datasets.',
      'Per-prediction LLM explanation: a language model generates a short natural-language summary of why a call was flagged, helping human reviewers prioritize.',
      'Fraud score and explanation written back to a results topic consumed by a dashboard service for analyst review.',
      'Modular design — classifiers and explanation prompts are configurable without redeploying the streaming topology.',
    ],
    media: [],
    tags: ['Apache Spark', 'Kafka Streaming', 'LLM Explanations', 'NLP', 'MLlib', 'TF-IDF', 'Python'],
    links: [{ icon: 'fab fa-github', label: 'GitHub', href: 'https://github.com/wangwang2111/fraud-detection-spark-kafka-llm' }],
  },
  collision: {
    color: '#0072c6',
    type: 'Deep Learning · Azure',
    status: 'priv',
    statusLabel: 'Private',
    title: 'Collision Forecasting System',
    sub: 'Azure × Databricks · CNN-LSTM-Transformer',
    desc: `Dual-model deep learning system for forecasting traffic collision risk across Toronto under varying weather and road conditions. Built and deployed on Azure Databricks with an interactive Power BI dashboard for city planners and traffic analysts.`,
    highlights: [
      'CNN-LSTM-Transformer hybrid: CNN layers extract spatial features from road geometry embeddings; LSTM captures temporal collision trends; Transformer attends over multi-day context windows.',
      'Dual-model approach: Model A forecasts collision counts by district; Model B predicts severity class (minor/major/fatal) per incident.',
      'SHAP explainability layer reveals feature importance per prediction — weather conditions, time of day, road type, and proximity to intersections are top drivers.',
      'Power BI dashboard visualizes risk heatmaps, 7-day forecasts, and historical accuracy metrics for non-technical stakeholders.',
      'Deployed as a Databricks job with scheduled retraining on updated Open Toronto collision and weather datasets.',
      'Azure Blob Storage for feature-engineered datasets; MLflow tracking for experiment versioning and model registry.',
    ],
    media: [
      { src: './dashboard_collisions.gif', label: 'Power BI Dashboard — collision risk heatmap & forecasts' },
      { src: './collision_etl_flowchart.png', label: 'ETL Pipeline — data ingestion & feature engineering flow' },
    ],
    tags: ['Azure', 'Databricks', 'CNN-LSTM-Transformer', 'SHAP', 'Power BI', 'MLflow', 'PyTorch', 'Open Toronto Data'],
    links: [],
  },
  rag: {
    color: '#2a6b6b',
    type: 'Full-Stack AI',
    status: 'pub',
    statusLabel: 'Open Source',
    title: 'RAG Application',
    sub: 'React + Flask · LangChain · End-to-End',
    desc: `A complete, production-structured Retrieval-Augmented Generation application demonstrating the full document-to-answer pipeline. React frontend for document upload and chat; Flask API backend orchestrated by LangChain with a vector store for persistent document memory.`,
    highlights: [
      'Document ingestion pipeline: PDF/text upload → recursive text splitter → OpenAI embeddings → ChromaDB vector store with persistent storage.',
      'LangChain RetrievalQA chain with source attribution — responses include which document passages were used to answer the query.',
      'React chat interface with streaming token display, document upload progress, and source citation popover.',
      'Flask REST API with CORS support; conversation history maintained server-side for multi-turn context.',
      'Configurable chunking strategy and retrieval top-k — easy to swap embedding models or vector stores.',
    ],
    media: [],
    tags: ['LangChain', 'React', 'Flask', 'RAG', 'ChromaDB', 'OpenAI', 'Python', 'REST API'],
    links: [{ icon: 'fab fa-github', label: 'GitHub', href: 'https://github.com/wangwang2111/rag-application' }],
  },
  mancala: {
    color: '#6a0572',
    type: 'AI Game Agent',
    status: 'pub',
    statusLabel: 'Open Source',
    title: 'Mancala AI',
    sub: 'DQN + Classical Search · Full-Stack Flask',
    desc: `Web-playable Mancala game featuring five distinct AI opponents ranging from classical search algorithms to a trained deep reinforcement learning agent. Built as a full-stack Flask application with a clean browser interface.`,
    highlights: [
      'Deep Q-Network (DQN) agent trained via self-play — experiences stored in replay buffer, target network updated periodically for stable training.',
      'Minimax with alpha-beta pruning explores the game tree to configurable depth; heuristic evaluation function scores pit counts and capture potential.',
      'Monte Carlo Tree Search (MCTS) agent balances exploration vs exploitation using UCB1 selection, making it strong even without a hand-crafted heuristic.',
      'Advanced heuristic agent encodes Mancala-specific strategy: store maximization, opponent blockade, and avalanche chain opportunities.',
      'All five agents selectable mid-game; difficulty scales by search depth / training epochs.',
      'Flask backend serves game state and AI moves as JSON; vanilla JS frontend renders board state with move animation.',
    ],
    media: [],
    tags: ['DQN', 'Minimax', 'Alpha-Beta', 'MCTS', 'Flask', 'Reinforcement Learning', 'Python', 'JavaScript'],
    links: [{ icon: 'fab fa-github', label: 'GitHub', href: 'https://github.com/wangwang2111/AI-algorithm-for-Mancala-game' }],
  },
  canada: {
    color: '#c9a84c',
    type: 'Quantitative Finance',
    status: 'pub',
    statusLabel: 'Open Source',
    title: 'Canada Quantamental Strategies',
    sub: 'ML Factor Models · Canadian Equity Market',
    desc: `ML-driven quantamental investment framework for the Canadian equity market. Combines systematic factor signals (momentum, value, quality) with XGBoost-based return prediction and macro context overlays for portfolio construction.`,
    highlights: [
      'Factor library: momentum (12-1 month), value (P/B, EV/EBITDA), quality (ROE, debt/equity), and size factors computed on TSX-listed equities.',
      'XGBoost model predicts 1-month forward returns using factor scores, earnings revision signals, and sector dummies as features.',
      'Quantamental overlay: macro indicators (BoC rate, CAD/USD, oil price) modulate factor exposure — e.g., value factor weight increases in rising rate environments.',
      'Portfolio construction via mean-variance optimization with long-only constraints and sector concentration limits.',
      'Walk-forward backtesting from 2010–2023; performance attribution splits alpha into factor vs. stock-selection contributions.',
      'Full tearsheet: cumulative returns, annual Sharpe, max drawdown, sector exposure over time.',
    ],
    media: [],
    tags: ['Factor Models', 'XGBoost', 'Canadian Equities', 'Backtesting', 'Mean-Variance Optimization', 'Python', 'Pandas', 'Quantitative Finance'],
    links: [{ icon: 'fab fa-github', label: 'GitHub', href: 'https://github.com/wangwang2111/canada-quantamental-investing-strategies' }],
  },
  coin98: {
    color: '#1a7a4a',
    type: 'Web Platform',
    status: 'pub',
    statusLabel: 'Open Source',
    title: 'Coin98vn',
    sub: 'Django · Crypto News Platform',
    desc: `Full-stack crypto news and community platform for Vietnamese DeFi users. Built with Django, featuring user authentication, dynamic content rendering, and a responsive design suited for mobile and desktop readers.`,
    highlights: [
      'Django ORM models for articles, categories, authors, and user profiles; admin panel for content management.',
      'User authentication: registration, login, password reset via email, and user profile pages.',
      'Dynamic article rendering with category filtering, search, and pagination.',
      'Responsive design with Bootstrap; optimized for mobile readers following Vietnamese crypto communities.',
      'PostgreSQL backend with query-optimized views for high-traffic article listing pages.',
    ],
    media: [],
    tags: ['Django', 'User Auth', 'PostgreSQL', 'Bootstrap', 'FinTech', 'Python', 'Full-Stack'],
    links: [{ icon: 'fab fa-github', label: 'GitHub', href: 'https://github.com/wangwang2111/coin98vn-django' }],
  },
};

(function() {
  const overlay  = document.getElementById('proj-overlay');
  const modal    = document.getElementById('proj-modal');
  const body     = document.getElementById('proj-modal-body');
  const closeBtn = document.getElementById('proj-close');
  const lightbox    = document.getElementById('pm-lightbox');
  const lbImg       = document.getElementById('pm-lightbox-img');
  const lbCloseBtn  = document.getElementById('pm-lightbox-close');

  function openModal(id) {
    const p = PROJECTS[id];
    if (!p) return;

    // accent color
    modal.style.setProperty('--pm-color', p.color);

    // gallery HTML
    const galleryHtml = p.media.length ? `
      <div class="pm-section">
        <div class="pm-section-title">Media</div>
        <div class="pm-gallery">
          ${p.media.map(m => `
            <div class="pm-gallery-item" data-src="${m.src}" data-alt="${m.label}">
              <img src="${m.src}" alt="${m.label}" loading="lazy" />
              <span class="pm-img-label">${m.label}</span>
            </div>`).join('')}
        </div>
      </div>` : '';

    const linksHtml = p.links.length
      ? p.links.map(l => `<a href="${l.href}" target="_blank" rel="noopener" class="pm-link accent"><i class="${l.icon}"></i>&nbsp;${l.label}</a>`).join('')
      : `<span class="pm-link dim"><i class="fas fa-lock"></i>&nbsp;Private Repository</span>`;

    body.innerHTML = `
      <div class="pm-header">
        <div class="pm-meta">
          <span class="pm-type">${p.type}</span>
          <span class="pm-status ${p.status}"><span class="dot"></span>${p.statusLabel}</span>
        </div>
        <h2 class="pm-title">${p.title}</h2>
        <p class="pm-sub">${p.sub}</p>
      </div>
      <hr class="pm-divider" />
      ${galleryHtml}
      <div class="pm-section">
        <div class="pm-section-title">Overview</div>
        <p class="pm-desc">${p.desc}</p>
      </div>
      <div class="pm-section">
        <div class="pm-section-title">Key Features</div>
        <ul class="pm-highlights">
          ${p.highlights.map(h => `<li>${h}</li>`).join('')}
        </ul>
      </div>
      <hr class="pm-divider" />
      <div class="pm-section">
        <div class="pm-section-title">Tech Stack</div>
        <div class="pm-tags">${p.tags.map(t => `<span class="pm-tag">${t}</span>`).join('')}</div>
      </div>
      <div class="pm-links">${linksHtml}</div>
    `;

    // gallery click → lightbox
    body.querySelectorAll('.pm-gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        lbImg.src = item.dataset.src;
        lbImg.alt = item.dataset.alt;
        lightbox.classList.add('open');
      });
    });

    modal.scrollTop = 0;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lbImg.src = '';
  }

  // profile photos → open full image in the lightbox
  document.querySelectorAll('.js-photo-zoom').forEach(img => {
    img.addEventListener('click', e => {
      e.stopPropagation();
      lbImg.src = img.dataset.full || img.src;
      lbImg.alt = img.alt;
      lightbox.classList.add('open');
    });
  });

  // open on card click (not on link clicks)
  document.querySelectorAll('.p-card[data-project]').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('a')) return; // let links work normally
      openModal(card.dataset.project);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  lbCloseBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox || e.target === lbImg) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (lightbox.classList.contains('open')) closeLightbox();
      else closeModal();
    }
  });
})();
