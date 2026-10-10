/* ==========================================================
   Yu-Gi-Oh! OCG Series 1 Encyclopedia - Application Logic
   ========================================================== */

// --- Constants & Endpoints ---
const IMG_BASE = 'https://images.ygoprodeck.com/images/cards';
const IMG_SMALL = 'https://images.ygoprodeck.com/images/cards_small';

// --- Global State ---
let currentSetId = null;
let currentSetFilter = 'all';
let currentSetSearch = '';
let searchTimeout = null;

// --- DOM Ready Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initScrollListeners();
    initGlobalSearch();
    initHeroCounters();
    initHeroFloatingMonsters();
    renderCensusTable();
    renderSets('all');
    renderSynergies();
    renderMetaDecks();
    renderTimeline();
    initModalBackdrops();
});

// --- Floating Meta Monsters in Hero ---
const META_HERO_MONSTERS = [
    { name: "Summoned Skull", role: "S-Tier Boss (2500 ATK)", badge: "1-TRIBUTE", cls: "float-card-1" },
    { name: "Exodia the Forbidden One", role: "Auto-Win Piece", badge: "WIN-CON", cls: "float-card-2" },
    { name: "Black Skull Dragon", role: "Apex Fusion (3200 ATK)", badge: "FUSION 3200", cls: "float-card-3" },
    { name: "Blue-Eyes White Dragon", role: "Legendary Dragon (3000 ATK)", badge: "RAW 3000", cls: "float-card-4" },
    { name: "Dark Magician", role: "Ultimate Wizard (2500 ATK)", badge: "ACE MAGE", cls: "float-card-5" },
    { name: "Black Luster Soldier", role: "Apex Ritual (3000 ATK)", badge: "RITUAL 3000", cls: "float-card-6" },
    { name: "Red-Eyes Black Dragon", role: "Ferocious Dragon (2400 ATK)", badge: "LEGEND DRAGON" },
    { name: "Penguin Soldier", role: "Flip King (Bounce 2)", badge: "BOUNCE 2" }
];

function initHeroFloatingMonsters() {
    const field = document.getElementById('floatingCardsField');
    const stream = document.getElementById('heroMetaStream');

    // 1. Floating 3D field (flanking the sides)
    if (field) {
        const fieldMonsters = META_HERO_MONSTERS.filter(m => m.cls);
        field.innerHTML = fieldMonsters.map(item => {
            const cardObj = SERIES1_DATA.getCardByName(item.name);
            const imgSrc = getCardImageSmall(cardObj);
            return `
                <div class="float-card ${item.cls}" onclick="openCardModal('${escapeJsString(item.name)}')" title="${item.name}">
                    <div class="float-card-inner">
                        <img class="float-card-img" src="${imgSrc}" alt="${item.name}" onerror="handleImgError(this, '${escapeJsString(item.name)}', 'Monster')">
                    </div>
                    <div class="float-card-tag">⭐ ${item.name} • ${item.badge}</div>
                </div>
            `;
        }).join('');
    }

    // 2. Interactive Stream Showcase
    if (stream) {
        stream.innerHTML = META_HERO_MONSTERS.map((item, idx) => {
            const cardObj = SERIES1_DATA.getCardByName(item.name);
            const imgSrc = getCardImageSmall(cardObj);
            return `
                <div class="stream-card" style="--stream-delay: ${idx * 0.18}s;" onclick="openCardModal('${escapeJsString(item.name)}')" title="${item.name}">
                    <span class="stream-card-badge">${item.badge}</span>
                    <div class="stream-card-img-wrap">
                        <img class="stream-card-img" src="${imgSrc}" alt="${item.name}" loading="lazy" onerror="handleImgError(this, '${escapeJsString(item.name)}', 'Monster')">
                    </div>
                    <div class="stream-card-name">${item.name}</div>
                    <div class="stream-card-role">${item.role}</div>
                </div>
            `;
        }).join('');
    }
}

// --- Particles Effect ---
function initParticles() {
    const container = document.getElementById('bgParticles');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 28; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = `${Math.random() * 100}%`;
        p.style.animationDelay = `${Math.random() * 8}s`;
        p.style.animationDuration = `${6 + Math.random() * 6}s`;
        const size = 1.5 + Math.random() * 2.5;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        container.appendChild(p);
    }
}

// --- Scroll & Header Listeners ---
function initScrollListeners() {
    const header = document.getElementById('header');
    const backToTop = document.getElementById('backToTop');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (header) header.classList.toggle('scrolled', scrollY > 40);
        if (backToTop) backToTop.classList.toggle('visible', scrollY > 500);

        // Highlight active nav item based on scroll position
        const sections = ['census-section', 'sets-section', 'synergies-section', 'meta-section', 'timeline-section'];
        sections.forEach(id => {
            const sec = document.getElementById(id);
            if (sec) {
                const rect = sec.getBoundingClientRect();
                if (rect.top <= 120 && rect.bottom >= 120) {
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('data-section') === id);
                    });
                }
            }
        });
    });
}

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
        const yOffset = -70;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
}

// --- Hero Stats Counter Animation ---
function initHeroCounters() {
    const totalCardsEl = document.getElementById('totalCards');
    const totalSetsEl = document.getElementById('totalSets');
    const totalSynergiesEl = document.getElementById('totalSynergies');
    const totalDecksEl = document.getElementById('totalDecks');

    const totalCards = SERIES1_DATA.cardIndex ? SERIES1_DATA.cardIndex.size : 0;
    const totalSets = SERIES1_DATA.sets ? SERIES1_DATA.sets.length : 23;
    const totalSynergies = SERIES1_DATA.synergies ? SERIES1_DATA.synergies.length : 0;
    const totalDecks = SERIES1_DATA.metaDecks ? SERIES1_DATA.metaDecks.length : 0;

    animateCounter(totalCardsEl, totalCards, 1000);
    if (totalSetsEl) animateCounter(totalSetsEl, totalSets, 700);
    animateCounter(totalSynergiesEl, totalSynergies, 800);
    animateCounter(totalDecksEl, totalDecks, 800);
}

function animateCounter(el, target, duration) {
    if (!el) return;
    let start = 0;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            el.textContent = target;
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(start);
        }
    }, stepTime);
}

// --- Image Fallback Helpers ---
function getCardImageSmall(card) {
    if (!card || !card.id) return createPlaceholderSvg(card ? card.name : 'Unknown');
    return `${IMG_SMALL}/${card.id}.jpg`;
}

function getCardImageFull(card) {
    if (!card || !card.id) return createPlaceholderSvg(card ? card.name : 'Unknown');
    return `${IMG_BASE}/${card.id}.jpg`;
}

function handleImgError(img, cardName, type) {
    img.onerror = null;
    img.src = createPlaceholderSvg(cardName, type);
}

function createPlaceholderSvg(name, type = 'Normal Monster') {
    const bg = type.includes('Spell') ? '#1DA87A' : type.includes('Trap') ? '#B4316E' : type.includes('Fusion') ? '#7B5EA7' : type.includes('Ritual') ? '#4A6FD4' : '#C9A84C';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 230" width="100%" height="100%">
        <rect width="160" height="230" fill="${bg}" rx="6"/>
        <rect x="8" y="8" width="144" height="214" fill="#121220" rx="4"/>
        <rect x="14" y="24" width="132" height="132" fill="#1e1e30" rx="3"/>
        <circle cx="80" cy="90" r="30" fill="${bg}" opacity="0.3"/>
        <text x="80" y="95" fill="#FFD700" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">⚔️</text>
        <text x="80" y="176" fill="#eae8f4" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">${escapeXml(name || 'Card')}</text>
        <text x="80" y="194" fill="#a09db8" font-family="sans-serif" font-size="8" text-anchor="middle">${escapeXml(type)}</text>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function escapeXml(unsafe) {
    return (unsafe || '').replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function getTypeClass(type) {
    if (!type) return 'tag-normal';
    if (type.includes('Spell')) return 'tag-spell';
    if (type.includes('Trap')) return 'tag-trap';
    if (type.includes('Fusion')) return 'tag-fusion';
    if (type.includes('Ritual')) return 'tag-ritual';
    if (type.includes('Effect')) return 'tag-effect';
    return 'tag-normal';
}

// ==========================================================
// --- CENSUS 717 SECTION LOGIC ---
// ==========================================================

function renderCensusTable() {
    const tbody = document.getElementById('censusTableBody');
    if (!tbody || !SERIES1_DATA.meta || !SERIES1_DATA.meta.census) return;

    const totalUnique = 717;
    tbody.innerHTML = SERIES1_DATA.meta.census.map(item => {
        const pct = ((item.count / totalUnique) * 100).toFixed(1);
        const badgeCls = getCensusBadgeClass(item.type);
        return `
            <tr>
                <td><strong>${escapeXml(item.source)}</strong></td>
                <td><span class="${badgeCls}">${escapeXml(item.type)}</span></td>
                <td style="text-align:center;"><strong style="font-family:var(--ff-d); font-size:1.15rem; color:var(--gold);">${item.count}</strong></td>
                <td>
                    <div class="census-table-bar">
                        <div class="ct-bar-track">
                            <div class="ct-bar-fill" style="width: ${pct}%;"></div>
                        </div>
                        <span class="ct-bar-pct">${pct}%</span>
                    </div>
                </td>
                <td style="text-align:center;">
                    <button class="census-btn" onclick="handleCensusAction('${escapeJsString(item.source)}')">Eksplorasi</button>
                </td>
            </tr>
        `;
    }).join('');
}

function getCensusBadgeClass(type) {
    if (type.includes('Core')) return 'set-card-badge badge-volume';
    if (type.includes('Starter')) return 'set-card-badge badge-starter';
    if (type.includes('Carddass')) return 'set-card-badge badge-booster';
    return 'set-card-badge badge-special';
}

function handleCensusAction(source) {
    if (source.includes('Booster 1–7') || source.includes('Vol. 1–7')) {
        filterSets('all');
    } else if (source.includes('Starter Box') || source.includes('EX Starter')) {
        filterSets('starter');
    } else {
        filterSets('special');
    }
    scrollToSection('sets-section');
}

// ==========================================================
// --- SETS SECTION LOGIC ---
// ==========================================================

function filterSets(type) {
    const tabs = document.querySelectorAll('.set-tab');
    tabs.forEach(tab => {
        const text = tab.textContent.toLowerCase();
        if (type === 'all' && text.includes('semua')) tab.classList.add('active');
        else if (type === 'volume' && text.includes('volume')) tab.classList.add('active');
        else if (type === 'booster' && text.includes('booster')) tab.classList.add('active');
        else if (type === 'starter' && text.includes('starter')) tab.classList.add('active');
        else if (type === 'special' && text.includes('special')) tab.classList.add('active');
        else tab.classList.remove('active');
    });
    renderSets(type);
}

function renderSets(filter = 'all') {
    const grid = document.getElementById('setsGrid');
    if (!grid) return;

    let sets = SERIES1_DATA.sets || [];
    if (filter === 'volume') sets = sets.filter(s => s.type === 'volume');
    else if (filter === 'booster') sets = sets.filter(s => s.type === 'booster');
    else if (filter === 'starter') sets = sets.filter(s => s.type === 'starter');
    else if (filter === 'special') sets = sets.filter(s => s.type === 'special');

    grid.innerHTML = sets.map(set => {
        let badgeClass = 'badge-volume';
        let badgeText = 'Volume';
        if (set.type === 'booster') {
            badgeClass = 'badge-booster';
            badgeText = 'Booster (Carddass)';
        } else if (set.type === 'starter') {
            badgeClass = 'badge-starter';
            badgeText = 'Starter Deck';
        } else if (set.type === 'special') {
            badgeClass = 'badge-special';
            badgeText = 'Special Pack';
        }
        const dateFormatted = formatDate(set.releaseDate);
        const cardCount = set.cards ? set.cards.length : 0;

        return `
            <div class="set-card" onclick="openSetDetail('${set.id}')">
                <div class="set-card-header">
                    <span class="set-card-name">${set.name}</span>
                    <span class="set-card-badge ${badgeClass}">${badgeText}</span>
                </div>
                <div class="set-card-date">📅 ${dateFormatted}</div>
                <p class="set-card-desc">${set.description || ''}</p>
                <div class="set-card-footer">
                    <span class="set-card-stat">📦 ${cardCount} Kartu Terdaftar</span>
                    <span class="set-card-stat">⭐ ${set.totalCards} Total di Set</span>
                    ${set.coverCard ? `<span class="set-card-stat" style="color:var(--gold);">👑 ${set.coverCard}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const day = parseInt(parts[2], 10);
    const month = months[parseInt(parts[1], 10) - 1];
    const year = parts[0];
    return `${day} ${month} ${year}`;
}

// --- Set Detail View ---
function openSetDetail(setId) {
    const set = SERIES1_DATA.sets.find(s => s.id === setId);
    if (!set) return;

    currentSetId = setId;
    currentSetFilter = 'all';
    currentSetSearch = '';

    const setsSection = document.getElementById('sets-section');
    const detailSection = document.getElementById('set-detail-section');
    const content = document.getElementById('setDetailContent');

    if (!detailSection || !content) return;

    setsSection.style.display = 'none';
    detailSection.style.display = 'block';

    renderSetDetailContent(set);
    scrollToSection('set-detail-section');
}

function closeSetDetail() {
    const setsSection = document.getElementById('sets-section');
    const detailSection = document.getElementById('set-detail-section');

    if (detailSection) detailSection.style.display = 'none';
    if (setsSection) setsSection.style.display = 'block';

    scrollToSection('sets-section');
}

function renderSetDetailContent(set) {
    const content = document.getElementById('setDetailContent');
    if (!content) return;

    let badgeClass = 'badge-volume';
    let badgeText = 'Volume Pack';
    if (set.type === 'booster') {
        badgeClass = 'badge-booster';
        badgeText = 'Carddass Booster';
    } else if (set.type === 'starter') {
        badgeClass = 'badge-starter';
        badgeText = 'Starter Deck';
    } else if (set.type === 'special') {
        badgeClass = 'badge-special';
        badgeText = 'Special Promo Pack';
    }

    // Rarity breakdown chips
    const raritiesHtml = Object.entries(set.rarityBreakdown || {}).map(([rarity, count]) => {
        let cls = 'rarity-c';
        if (rarity.includes('Ultra')) cls = 'rarity-ur';
        else if (rarity.includes('Super')) cls = 'rarity-sr';
        else if (rarity.includes('Secret')) cls = 'rarity-sec';
        else if (rarity.includes('Rare')) cls = 'rarity-r';
        return `<span class="rarity-pill ${cls}">${rarity}: <strong>${count}</strong></span>`;
    }).join('');

    content.innerHTML = `
        <div class="set-detail-header">
            <div class="set-detail-info">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                    <h2 class="set-detail-title">${set.fullName || set.name}</h2>
                    <span class="set-card-badge ${badgeClass}">${badgeText}</span>
                </div>
                <div class="set-detail-meta">
                    <span class="meta-chip">📅 Rilis: <strong>${formatDate(set.releaseDate)}</strong></span>
                    <span class="meta-chip">🎴 Total Kartu Set: <strong>${set.totalCards}</strong></span>
                    ${set.coverCard ? `<span class="meta-chip">🌟 Cover Card: <strong>${set.coverCard}</strong></span>` : ''}
                </div>
                <p class="set-detail-desc">${set.description || ''}</p>
                <div class="rarity-bars">${raritiesHtml}</div>
            </div>
        </div>

        <!-- Filter & Search in Set -->
        <div class="set-filter-toolbar">
            <div class="set-filter-search">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input type="text" id="setSearchInput" placeholder="Cari dalam set ini..." oninput="handleSetSearch(this.value)">
            </div>
            <div class="set-type-chips">
                <button class="st-chip active" onclick="filterSetCards('all', this)">Semua</button>
                <button class="st-chip" onclick="filterSetCards('Normal Monster', this)">Normal</button>
                <button class="st-chip" onclick="filterSetCards('Effect Monster', this)">Effect</button>
                <button class="st-chip" onclick="filterSetCards('Fusion Monster', this)">Fusion</button>
                <button class="st-chip" onclick="filterSetCards('Ritual Monster', this)">Ritual</button>
                <button class="st-chip" onclick="filterSetCards('Spell Card', this)">Spell</button>
                <button class="st-chip" onclick="filterSetCards('Trap Card', this)">Trap</button>
            </div>
        </div>

        <!-- Cards Grid -->
        <div class="cards-grid" id="setCardsGrid"></div>
    `;

    renderSetCardsGrid(set);
}

function handleSetSearch(query) {
    currentSetSearch = (query || '').toLowerCase().trim();
    const set = SERIES1_DATA.sets.find(s => s.id === currentSetId);
    if (set) renderSetCardsGrid(set);
}

function filterSetCards(type, btn) {
    currentSetFilter = type;
    document.querySelectorAll('.st-chip').forEach(c => c.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const set = SERIES1_DATA.sets.find(s => s.id === currentSetId);
    if (set) renderSetCardsGrid(set);
}

function renderSetCardsGrid(set) {
    const grid = document.getElementById('setCardsGrid');
    if (!grid) return;

    let cards = set.cards || [];

    // Filter by type
    if (currentSetFilter !== 'all') {
        cards = cards.filter(c => c.type === currentSetFilter);
    }

    // Filter by search text
    if (currentSetSearch) {
        cards = cards.filter(c => c.name.toLowerCase().includes(currentSetSearch) || (c.desc && c.desc.toLowerCase().includes(currentSetSearch)));
    }

    if (cards.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-3);font-size:0.9rem;">Tidak ada kartu yang cocok dengan filter atau pencarian.</div>`;
        return;
    }

    grid.innerHTML = cards.map(card => {
        const typeClass = getTypeClass(card.type);
        const isMonster = card.type && card.type.includes('Monster');
        const imgSrc = getCardImageSmall(card);

        let statsLine = '';
        if (isMonster) {
            statsLine = `<span>⚔️ ${card.atk ?? 0}</span> <span>🛡️ ${card.def ?? 0}</span> ${card.level ? `<span>★${card.level}</span>` : ''}`;
        } else {
            statsLine = `<span>${card.race || 'Normal'} ${card.type ? card.type.replace(' Card', '') : ''}</span>`;
        }

        return `
            <div class="card-item" onclick="openCardModal('${escapeJsString(card.name)}')">
                <div class="card-img-wrap">
                    <img class="card-img" src="${imgSrc}" alt="${card.name}" loading="lazy" onerror="handleImgError(this, '${escapeJsString(card.name)}', '${card.type}')">
                </div>
                <div class="card-info">
                    <div class="card-name" title="${card.name}">${card.name}</div>
                    <span class="card-tag ${typeClass}">${card.type ? card.type.replace(' Monster', '').replace(' Card', '') : ''}</span>
                    <div class="card-stats-row">${statsLine}</div>
                </div>
            </div>
        `;
    }).join('');
}

function escapeJsString(str) {
    return (str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// ==========================================================
// --- SYNERGIES SECTION LOGIC ---
// ==========================================================

function renderSynergies() {
    const grid = document.getElementById('synergiesGrid');
    if (!grid) return;

    const synergies = SERIES1_DATA.synergies || [];
    grid.innerHTML = synergies.map(syn => {
        let diffClass = 'diff-medium';
        if (syn.difficulty.includes('Mudah')) diffClass = 'diff-easy';
        else if (syn.difficulty.includes('Sangat Sulit')) diffClass = 'diff-hard';

        const cardsPills = (syn.cards || []).slice(0, 4).map(c => `<span class="synergy-card-pill">${c}</span>`).join('');

        return `
            <div class="synergy-card" style="--synergy-color:${syn.color || 'var(--gold)'}" onclick="openSynergyModal('${syn.id}')">
                <div class="synergy-icon">${syn.icon || '🔗'}</div>
                <h3 class="synergy-name">${syn.name}</h3>
                <div class="synergy-type">${syn.type}</div>
                <p class="synergy-desc">${syn.description}</p>
                <div class="synergy-cards-preview">${cardsPills}</div>
                <div class="synergy-difficulty ${diffClass}">${syn.difficulty}</div>
            </div>
        `;
    }).join('');
}

function openSynergyModal(synergyId) {
    const syn = (SERIES1_DATA.synergies || []).find(s => s.id === synergyId);
    if (!syn) return;

    const modal = document.getElementById('synergyModal');
    const body = document.getElementById('synergyModalBody');
    if (!modal || !body) return;

    // Build cards gallery
    const cardsGalleryHtml = (syn.cards || []).map(cardName => {
        const cardObj = SERIES1_DATA.getCardByName(cardName);
        const imgSrc = getCardImageSmall(cardObj);
        return `
            <div class="syn-card-item" onclick="openCardModal('${escapeJsString(cardName)}')">
                <img src="${imgSrc}" alt="${cardName}" loading="lazy" onerror="handleImgError(this, '${escapeJsString(cardName)}')">
                <span>${cardName}</span>
            </div>
        `;
    }).join('');

    // Support cards pills
    const supportPillsHtml = (syn.supportCards || []).map(cardName => {
        return `<span class="syn-support-pill" onclick="openCardModal('${escapeJsString(cardName)}')">${cardName}</span>`;
    }).join('');

    // Required Sets
    const setsPillsHtml = (syn.sets || []).map(setName => {
        return `<span class="meta-chip" style="font-size:0.75rem;">📦 Set: <strong>${setName}</strong></span>`;
    }).join('');

    body.innerHTML = `
        <div class="syn-modal-header">
            <div class="syn-modal-icon">${syn.icon || '🔗'}</div>
            <div>
                <h2 class="syn-modal-title">${syn.name}</h2>
                <div class="syn-modal-type">${syn.type} • ${syn.difficulty}</div>
                <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">${setsPillsHtml}</div>
            </div>
        </div>

        <div class="cm-group-title">🎴 Kartu-Kartu Kunci dalam Sinergi:</div>
        <div class="syn-cards-grid">${cardsGalleryHtml}</div>

        <div class="syn-strategy">
            <h4>📖 Panduan Strategi & Mekanik:</h4>
            <p>${syn.strategy || syn.description}</p>
        </div>

        ${syn.supportCards && syn.supportCards.length > 0 ? `
            <div class="syn-support">
                <h4>🛡️ Kartu Pendukung yang Direkomendasikan:</h4>
                <div class="syn-support-pills">${supportPillsHtml}</div>
            </div>
        ` : ''}
    `;

    modal.classList.add('active');
}

function closeSynergyModal() {
    const modal = document.getElementById('synergyModal');
    if (modal) modal.classList.remove('active');
}

// ==========================================================
// --- META DECKS SECTION LOGIC ---
// ==========================================================

function renderMetaDecks() {
    const grid = document.getElementById('metaGrid');
    if (!grid) return;

    const decks = SERIES1_DATA.metaDecks || [];
    grid.innerHTML = decks.map(deck => {
        const tierCls = deck.tier === 'S' ? 'tier-s' : 'tier-a';
        const gradient = deck.colors ? `linear-gradient(135deg, ${deck.colors[0]}, ${deck.colors[1]})` : 'linear-gradient(135deg, #FFD700, #FFA500)';

        const keyPills = (deck.keyCards || []).slice(0, 5).map(kc => `<span class="meta-key-pill">${kc.name}</span>`).join('');

        return `
            <div class="meta-card" onclick="openDeckModal('${deck.id}')">
                <div class="meta-card-header" style="--deck-gradient:${gradient};">
                    <div class="meta-card-top">
                        <div class="meta-card-icon">${deck.icon || '🏆'}</div>
                        <span class="meta-tier ${tierCls}">Tier ${deck.tier}</span>
                    </div>
                    <h3 class="meta-card-name">${deck.name}</h3>
                    <div class="meta-card-period">📅 Era: ${deck.period}</div>
                </div>
                <div class="meta-card-body">
                    <p class="meta-card-desc">${deck.description}</p>
                    <div class="deck-section-title" style="margin-top:0;">Kartu Kunci:</div>
                    <div class="meta-key-cards">${keyPills}</div>
                    <div style="margin-top:14px;display:flex;justify-content:flex-end;">
                        <span style="font-family:var(--ff-u);font-size:0.75rem;color:var(--gold);font-weight:700;">Lihat Detail & 40-Card Build →</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function openDeckModal(deckId) {
    const deck = (SERIES1_DATA.metaDecks || []).find(d => d.id === deckId);
    if (!deck) return;

    const modal = document.getElementById('deckModal');
    const body = document.getElementById('deckModalBody');
    if (!modal || !body) return;

    const tierCls = deck.tier === 'S' ? 'tier-s' : 'tier-a';
    const list = deck.deckList || { monsters: [], spells: [], traps: [], extra: [] };

    const totalMonsters = (list.monsters || []).reduce((acc, c) => acc + c.count, 0);
    const totalSpells = (list.spells || []).reduce((acc, c) => acc + c.count, 0);
    const totalTraps = (list.traps || []).reduce((acc, c) => acc + c.count, 0);
    const totalExtra = (list.extra || []).reduce((acc, c) => acc + c.count, 0);
    const totalMain = totalMonsters + totalSpells + totalTraps;

    // Helper to generate visual cards in deck groups
    const renderCardGroup = (title, items, icon) => {
        if (!items || items.length === 0) return '';
        const groupTotal = items.reduce((acc, c) => acc + c.count, 0);
        const cardsHtml = items.map(item => {
            const cardObj = SERIES1_DATA.getCardByName(item.name);
            const imgSrc = getCardImageSmall(cardObj);
            return `
                <div class="deck-card-tile" onclick="openCardModal('${escapeJsString(item.name)}')">
                    <img class="deck-card-tile-img" src="${imgSrc}" alt="${item.name}" loading="lazy" onerror="handleImgError(this, '${escapeJsString(item.name)}')">
                    <span class="deck-card-qty">${item.count}x</span>
                    <div class="deck-card-tile-info">
                        <div class="deck-card-tile-name" title="${item.name}">${item.name}</div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="deck-group">
                <div class="deck-group-title">
                    <span>${icon} ${title}</span>
                    <span style="color:var(--gold);">${groupTotal} Kartu</span>
                </div>
                <div class="deck-cards-grid">${cardsHtml}</div>
            </div>
        `;
    };

    // Pros & Cons
    const prosHtml = (deck.strengths || []).map(s => `<li>${s}</li>`).join('');
    const consHtml = (deck.weaknesses || []).map(w => `<li>${w}</li>`).join('');

    body.innerHTML = `
        <div class="deck-modal-header">
            <div class="deck-modal-top">
                <div style="display:flex;align-items:center;gap:12px;">
                    <span style="font-size:2.2rem;">${deck.icon || '🏆'}</span>
                    <div>
                        <h2 class="deck-modal-title">${deck.name}</h2>
                        <div class="deck-modal-meta">
                            <span>📅 ${deck.period}</span>
                            <span>⚔️ Playstyle: <strong>${deck.playstyle || 'Beatdown'}</strong></span>
                        </div>
                    </div>
                </div>
                <span class="meta-tier ${tierCls}">Tier ${deck.tier}</span>
            </div>

            <!-- Stats Banner -->
            <div class="deck-stats-banner">
                <div class="deck-stat-box">
                    <div class="deck-stat-num">${totalMain}</div>
                    <div class="deck-stat-lbl">Main Deck</div>
                </div>
                <div class="deck-stat-box">
                    <div class="deck-stat-num" style="color:#C9A84C;">${totalMonsters}</div>
                    <div class="deck-stat-lbl">Monster</div>
                </div>
                <div class="deck-stat-box">
                    <div class="deck-stat-num" style="color:#34D399;">${totalSpells}</div>
                    <div class="deck-stat-lbl">Spell</div>
                </div>
                <div class="deck-stat-box">
                    <div class="deck-stat-num" style="color:#F472B6;">${totalTraps}</div>
                    <div class="deck-stat-lbl">Trap</div>
                </div>
                ${totalExtra > 0 ? `
                    <div class="deck-stat-box">
                        <div class="deck-stat-num" style="color:#B18CDF;">${totalExtra}</div>
                        <div class="deck-stat-lbl">Extra/Fusion</div>
                    </div>
                ` : ''}
            </div>
        </div>

        <!-- Strategy Breakdown -->
        <div class="deck-section-title">📋 Analisis Strategi & Cara Memainkan:</div>
        <div class="deck-strategy-box">${deck.strategy || deck.description}</div>

        <!-- Deck List Visual Groups -->
        <div class="deck-section-title">🎴 Rekomendasi 40-Card Decklist (Series 1 Format):</div>
        <div class="deck-groups">
            ${renderCardGroup('Monster Cards', list.monsters, '👾')}
            ${renderCardGroup('Spell Cards', list.spells, '✨')}
            ${renderCardGroup('Trap Cards', list.traps, '🛡️')}
            ${renderCardGroup('Fusion / Extra Deck', list.extra, '🔮')}
        </div>

        <!-- Strengths vs Weaknesses -->
        <div class="deck-section-title">⚖️ Analisis Keunggulan & Kelemahan di Format OCG 1999:</div>
        <div class="deck-analysis-grid">
            <div class="deck-pros-box">
                <h4>Kekuatan Utama</h4>
                <ul>${prosHtml}</ul>
            </div>
            <div class="deck-cons-box">
                <h4>Kelemahan & Counter</h4>
                <ul>${consHtml}</ul>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function closeDeckModal() {
    const modal = document.getElementById('deckModal');
    if (modal) modal.classList.remove('active');
}

// ==========================================================
// --- TIMELINE SECTION LOGIC ---
// ==========================================================

function renderTimeline() {
    const timeline = document.getElementById('timeline');
    if (!timeline) return;

    // Sort all sets chronologically
    const sortedSets = [...SERIES1_DATA.sets].sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));

    timeline.innerHTML = sortedSets.map(set => {
        let dotClass = 'volume';
        let typeLabel = 'Volume Pack';
        if (set.type === 'booster') {
            dotClass = 'booster';
            typeLabel = 'Carddass Booster';
        } else if (set.type === 'starter') {
            dotClass = 'starter';
            typeLabel = 'Starter Box / Deck';
        } else if (set.type === 'special') {
            dotClass = 'special';
            typeLabel = 'Special Promo Pack';
        }

        const dateFormatted = formatDate(set.releaseDate);

        // Highlight notable cards
        const highlights = (set.cards || []).slice(0, 4).map(c => {
            return `<span class="timeline-hl" onclick="openCardModal('${escapeJsString(c.name)}')">${c.name}</span>`;
        }).join('');

        return `
            <div class="timeline-item">
                <div class="timeline-dot ${dotClass}"></div>
                <div class="timeline-date">${dateFormatted} • ${typeLabel}</div>
                <h4 class="timeline-name" style="cursor:pointer;" onclick="openSetDetail('${set.id}')">${set.fullName || set.name}</h4>
                <p class="timeline-desc">${set.description}</p>
                <div class="timeline-highlights">${highlights}</div>
            </div>
        `;
    }).join('');
}

// ==========================================================
// --- CARD DETAIL MODAL LOGIC ---
// ==========================================================

function openCardModal(cardName) {
    const card = SERIES1_DATA.getCardByName(cardName);
    const modal = document.getElementById('cardModal');
    const body = document.getElementById('modalBody');

    if (!modal || !body) return;

    if (!card) {
        body.innerHTML = `
            <div style="text-align:center;padding:40px;">
                <h3 style="color:var(--text-1);font-family:var(--ff-d);">${cardName}</h3>
                <p style="color:var(--text-3);margin-top:8px;">Detail lengkap kartu belum terindeks di Series 1.</p>
            </div>
        `;
        modal.classList.add('active');
        return;
    }

    const typeClass = getTypeClass(card.type);
    const isMonster = card.type && card.type.includes('Monster');
    const imgFull = getCardImageFull(card);

    // Build Monster stats
    let statsBoxesHtml = '';
    if (isMonster) {
        statsBoxesHtml = `
            <div class="card-modal-stats">
                <div class="cm-stat">
                    <span class="cm-stat-label">ATK</span>
                    <span class="cm-stat-value">${card.atk ?? 0}</span>
                </div>
                <div class="cm-stat">
                    <span class="cm-stat-label">DEF</span>
                    <span class="cm-stat-value">${card.def ?? 0}</span>
                </div>
                <div class="cm-stat">
                    <span class="cm-stat-label">LEVEL</span>
                    <span class="cm-stat-value">★${card.level ?? '-'}</span>
                </div>
            </div>
        `;
    }

    // Info grid
    let infoGridHtml = `
        <div class="cm-info-grid">
            <div class="cm-info-cell">
                <div class="cm-info-key">Tipe Kartu</div>
                <div class="cm-info-val"><span class="card-tag ${typeClass}">${card.type}</span></div>
            </div>
            <div class="cm-info-cell">
                <div class="cm-info-key">Raritas</div>
                <div class="cm-info-val" style="color:var(--gold);">${card.rarity || 'Common'}</div>
            </div>
            ${isMonster ? `
                <div class="cm-info-cell">
                    <div class="cm-info-key">Atribut</div>
                    <div class="cm-info-val">${card.attribute || 'EARTH'}</div>
                </div>
                <div class="cm-info-cell">
                    <div class="cm-info-key">Monster Type / Race</div>
                    <div class="cm-info-val">${card.race || 'Normal'}</div>
                </div>
            ` : `
                <div class="cm-info-cell">
                    <div class="cm-info-key">Property</div>
                    <div class="cm-info-val">${card.race || 'Normal'}</div>
                </div>
                <div class="cm-info-cell">
                    <div class="cm-info-key">Icon</div>
                    <div class="cm-info-val">${card.type && card.type.includes('Spell') ? '✨ Spell' : '🛡️ Trap'}</div>
                </div>
            `}
        </div>
    `;

    // Fusion Materials if applicable
    let fusionHtml = '';
    if (card.fusionMaterials && card.fusionMaterials.length > 0) {
        const matPills = card.fusionMaterials.map(m => {
            return `<span class="cm-fusion-pill" onclick="openCardModal('${escapeJsString(m)}')">${m}</span>`;
        }).join('');
        fusionHtml = `
            <div class="cm-group" style="margin-top:12px;">
                <div class="cm-group-title">🔮 Fusion Materials:</div>
                <div class="cm-fusion-mats">${matPills}</div>
            </div>
        `;
    }

    // Synergies cross-links
    const relatedSynergies = (SERIES1_DATA.synergies || []).filter(s => {
        return (s.cards && s.cards.includes(card.name)) || (s.supportCards && s.supportCards.includes(card.name));
    });
    let synergiesHtml = '';
    if (relatedSynergies.length > 0) {
        const synBadges = relatedSynergies.map(s => {
            return `<span class="cm-link-badge syn" onclick="closeCardModal(); openSynergyModal('${s.id}')">${s.icon || '🔗'} ${s.name}</span>`;
        }).join('');
        synergiesHtml = `
            <div class="cm-links-group">
                <div class="cm-group-title">🔗 Terhubung dalam Sinergi:</div>
                <div class="cm-links-wrap">${synBadges}</div>
            </div>
        `;
    }

    // Meta Decks cross-links
    const relatedDecks = (SERIES1_DATA.metaDecks || []).filter(d => {
        const inKey = d.keyCards && d.keyCards.some(kc => kc.name === card.name);
        const inMonsters = d.deckList && d.deckList.monsters && d.deckList.monsters.some(m => m.name === card.name);
        const inSpells = d.deckList && d.deckList.spells && d.deckList.spells.some(s => s.name === card.name);
        const inTraps = d.deckList && d.deckList.traps && d.deckList.traps.some(t => t.name === card.name);
        const inExtra = d.deckList && d.deckList.extra && d.deckList.extra.some(e => e.name === card.name);
        return inKey || inMonsters || inSpells || inTraps || inExtra;
    });
    let decksHtml = '';
    if (relatedDecks.length > 0) {
        const deckBadges = relatedDecks.map(d => {
            return `<span class="cm-link-badge deck" onclick="closeCardModal(); openDeckModal('${d.id}')">${d.icon || '🏆'} ${d.name}</span>`;
        }).join('');
        decksHtml = `
            <div class="cm-links-group">
                <div class="cm-group-title">🏆 Digunakan dalam Meta Deck:</div>
                <div class="cm-links-wrap">${deckBadges}</div>
            </div>
        `;
    }

    // Origin Sets
    let originsHtml = '';
    if (card.setOrigins && card.setOrigins.length > 0) {
        const origins = card.setOrigins.map(s => `<span class="meta-chip" style="font-size:0.75rem;">📦 ${s}</span>`).join(' ');
        originsHtml = `
            <div class="cm-links-group">
                <div class="cm-group-title">📦 Asal Set:</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">${origins}</div>
            </div>
        `;
    }

    body.innerHTML = `
        <div class="card-modal-layout">
            <div class="card-modal-img">
                <img src="${imgFull}" alt="${card.name}" onerror="handleImgError(this, '${escapeJsString(card.name)}', '${card.type}')">
            </div>
            <div class="card-modal-info">
                <h3 class="card-modal-title">${card.name}</h3>
                <div class="card-modal-id">Passcode: #${card.id || 'N/A'}</div>

                ${statsBoxesHtml}
                ${infoGridHtml}

                <div class="cm-group" style="margin-top:14px;">
                    <div class="cm-group-title">📜 Deskripsi / Efek Kartu:</div>
                    <div class="cm-group-text">${card.desc || 'Tidak ada deskripsi.'}</div>
                </div>

                ${fusionHtml}
                ${synergiesHtml}
                ${decksHtml}
                ${originsHtml}
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function closeCardModal() {
    const modal = document.getElementById('cardModal');
    if (modal) modal.classList.remove('active');
}

// ==========================================================
// --- GLOBAL SEARCH LOGIC ---
// ==========================================================

function initGlobalSearch() {
    const input = document.getElementById('globalSearchInput');
    const dropdown = document.getElementById('searchDropdown');
    const clearBtn = document.getElementById('searchClearBtn');

    if (!input || !dropdown) return;

    input.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        const query = input.value.trim();

        if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';

        if (query.length >= 2) {
            searchTimeout = setTimeout(() => executeGlobalSearch(query), 200);
        } else {
            dropdown.classList.remove('active');
            dropdown.innerHTML = '';
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const firstItem = dropdown.querySelector('.search-dropdown-item');
            if (firstItem) {
                firstItem.click();
            }
        }
        if (e.key === 'Escape') {
            clearGlobalSearch();
        }
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-search-wrap')) {
            dropdown.classList.remove('active');
        }
    });
}

function executeGlobalSearch(query) {
    const dropdown = document.getElementById('searchDropdown');
    if (!dropdown) return;

    const lowerQuery = query.toLowerCase();
    const allCards = SERIES1_DATA.getAllCards();

    const matches = allCards.filter(card => {
        return card.name.toLowerCase().includes(lowerQuery) ||
               (card.race && card.race.toLowerCase().includes(lowerQuery)) ||
               (card.type && card.type.toLowerCase().includes(lowerQuery)) ||
               (card.desc && card.desc.toLowerCase().includes(lowerQuery));
    }).slice(0, 10);

    if (matches.length === 0) {
        dropdown.innerHTML = `<div class="search-empty">Tidak ada kartu yang cocok dengan "<strong>${escapeXml(query)}</strong>" di Series 1.</div>`;
        dropdown.classList.add('active');
        return;
    }

    dropdown.innerHTML = matches.map(card => {
        const typeClass = getTypeClass(card.type);
        const imgSrc = getCardImageSmall(card);
        const isMonster = card.type && card.type.includes('Monster');
        const stats = isMonster ? `ATK: ${card.atk ?? 0} / DEF: ${card.def ?? 0}` : card.type;
        const setBadge = card.setOrigins ? card.setOrigins.join(', ') : '';

        return `
            <div class="search-dropdown-item" onclick="selectSearchResult('${escapeJsString(card.name)}')">
                <img class="sdi-thumb" src="${imgSrc}" alt="${card.name}" onerror="handleImgError(this, '${escapeJsString(card.name)}')">
                <div class="sdi-info">
                    <div class="sdi-name">${card.name}</div>
                    <div class="sdi-meta">
                        <span class="card-tag ${typeClass}" style="font-size:0.6rem;padding:1px 5px;">${card.type.replace(' Monster', '').replace(' Card', '')}</span>
                        <span>${stats}</span>
                        ${setBadge ? `<span style="color:var(--gold);">• ${setBadge}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    dropdown.classList.add('active');
}

function selectSearchResult(cardName) {
    clearGlobalSearch();
    openCardModal(cardName);
}

function clearGlobalSearch() {
    const input = document.getElementById('globalSearchInput');
    const dropdown = document.getElementById('searchDropdown');
    const clearBtn = document.getElementById('searchClearBtn');

    if (input) input.value = '';
    if (dropdown) {
        dropdown.classList.remove('active');
        dropdown.innerHTML = '';
    }
    if (clearBtn) clearBtn.style.display = 'none';
}

// ==========================================================
// --- MODAL BACKDROP & ESCAPE KEY LISTENERS ---
// ==========================================================

function initModalBackdrops() {
    const modals = ['cardModal', 'synergyModal', 'deckModal'];
    modals.forEach(id => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(id => {
                const modal = document.getElementById(id);
                if (modal) modal.classList.remove('active');
            });
            clearGlobalSearch();
        }
    });
}
