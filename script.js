(function() {
    'use strict';

    const URLS = {
        skins: { local: 'skins.json', remote: 'https://cdn.jsdelivr.net/gh/ByMykel/CSGO-API@main/public/api/en/skins.json' },
        baseWeapons: { local: 'base_weapons.json', remote: 'https://cdn.jsdelivr.net/gh/ByMykel/CSGO-API@main/public/api/en/base_weapons.json' },
        agents: { local: 'agents.json', remote: 'https://cdn.jsdelivr.net/gh/ByMykel/CSGO-API@main/public/api/en/agents.json' },
        stickers: { local: 'stickers.json', remote: 'https://cdn.jsdelivr.net/gh/ByMykel/CSGO-API@main/public/api/en/stickers.json' },
        crates: { local: 'crates.json', remote: 'https://cdn.jsdelivr.net/gh/ByMykel/CSGO-API@main/public/api/en/crates.json' },
        images: { local: null, remote: 'https://cdn.jsdelivr.net/gh/ByMykel/counter-strike-image-tracker@main/static/images.json' }
    };

    const WEAR_FLOAT = { 'Factory New': 0.035, 'Minimal Wear': 0.11, 'Field-Tested': 0.265, 'Well-Worn': 0.415, 'Battle-Scarred': 0.725 };

    const WEAPON_DEF_INDEX = { 'weapon_deagle': 1, 'weapon_elite': 2, 'weapon_fiveseven': 3, 'weapon_glock': 4, 'weapon_ak47': 7, 'weapon_aug': 8, 'weapon_awp': 9, 'weapon_famas': 10, 'weapon_g3sg1': 11, 'weapon_galilar': 13, 'weapon_m249': 14, 'weapon_m4a1': 16, 'weapon_mac10': 17, 'weapon_p90': 19, 'weapon_mp5sd': 23, 'weapon_ump45': 24, 'weapon_xm1014': 25, 'weapon_bizon': 26, 'weapon_mag7': 27, 'weapon_negev': 28, 'weapon_sawedoff': 29, 'weapon_tec9': 30, 'weapon_taser': 31, 'weapon_hkp2000': 32, 'weapon_mp7': 33, 'weapon_mp9': 34, 'weapon_nova': 35, 'weapon_p250': 36, 'weapon_scar20': 38, 'weapon_sg556': 39, 'weapon_ssg08': 40, 'weapon_knife': 42, 'weapon_m4a1_silencer': 60, 'weapon_usp_silencer': 61, 'weapon_cz75a': 63, 'weapon_revolver': 64, 'weapon_bayonet': 500, 'weapon_knife_css': 503, 'weapon_knife_flip': 505, 'weapon_knife_gut': 506, 'weapon_knife_karambit': 507, 'weapon_knife_m9_bayonet': 508, 'weapon_knife_tactical': 509, 'weapon_knife_falchion': 512, 'weapon_knife_survival_bowie': 514, 'weapon_knife_butterfly': 515, 'weapon_knife_push': 516, 'weapon_knife_cord': 517, 'weapon_knife_canis': 518, 'weapon_knife_ursus': 519, 'weapon_knife_gypsy_jackknife': 520, 'weapon_knife_outdoor': 521, 'weapon_knife_stiletto': 522, 'weapon_knife_widowmaker': 523, 'weapon_knife_skeleton': 525, 'weapon_knife_kukri': 526, 'weapon_gloves': 0 };

    const GLOVE_DEF_INDEX = {
        'Bloodhound Gloves': 5027,
        'Sport Gloves': 5030,
        'Driver Gloves': 5031,
        'Hand Wraps': 5032,
        'Moto Gloves': 5033,
        'Specialist Gloves': 5034,
        'Hydra Gloves': 5035,
        'Broken Fang Gloves': 5036
    };

    const WEAPON_NAME_TO_CMD = { 'AK-47': 'weapon_ak47', 'AWP': 'weapon_awp', 'M4A4': 'weapon_m4a1', 'M4A1-S': 'weapon_m4a1_silencer', 'Desert Eagle': 'weapon_deagle', 'USP-S': 'weapon_usp_silencer', 'Glock-18': 'weapon_glock', 'P250': 'weapon_p250', 'Five-SeveN': 'weapon_fiveseven', 'Tec-9': 'weapon_tec9', 'MP9': 'weapon_mp9', 'MP7': 'weapon_mp7', 'UMP-45': 'weapon_ump45', 'P90': 'weapon_p90', 'Nova': 'weapon_nova', 'XM1014': 'weapon_xm1014', 'MAG-7': 'weapon_mag7', 'Sawed-Off': 'weapon_sawedoff', 'SSG 08': 'weapon_ssg08', 'SG 553': 'weapon_sg556', 'AUG': 'weapon_aug', 'FAMAS': 'weapon_famas', 'Galil AR': 'weapon_galilar', 'G3SG1': 'weapon_g3sg1', 'SCAR-20': 'weapon_scar20', 'PP-Bizon': 'weapon_bizon', 'MAC-10': 'weapon_mac10', 'Negev': 'weapon_negev', 'M249': 'weapon_m249', 'Karambit': 'weapon_knife_karambit', 'Bayonet': 'weapon_bayonet', 'Butterfly Knife': 'weapon_knife_butterfly', 'Flip Knife': 'weapon_knife_flip', 'Gut Knife': 'weapon_knife_gut', 'Huntsman Knife': 'weapon_knife_tactical', 'Falchion Knife': 'weapon_knife_falchion', 'Bowie Knife': 'weapon_knife_survival_bowie', 'Shadow Daggers': 'weapon_knife_push', 'Talon Knife': 'weapon_knife_widowmaker', 'Ursus Knife': 'weapon_knife_ursus', 'Navaja Knife': 'weapon_knife_gypsy_jackknife', 'Stiletto Knife': 'weapon_knife_stiletto', 'Classic Knife': 'weapon_knife_css', 'Paracord Knife': 'weapon_knife_cord', 'Survival Knife': 'weapon_knife_canis', 'Nomad Knife': 'weapon_knife_outdoor', 'Skeleton Knife': 'weapon_knife_skeleton', 'Kukri Knife': 'weapon_knife_kukri' };

    let db = { skins: [], knives: [], gloves: [], agents: [], stickers: [], crates: [] };
    let inventory = [];
    let currentTab = 'skins';
    let currentWeapon = 'all';
    let searchQuery = '';
    let currentModalItem = null;
    let renderedCount = 0;
    const BATCH_SIZE = 100;
    let currentFilteredList = [];

    const els = {
        gridContainer: document.getElementById('gridContainer'), 
        loadMoreBtn: document.getElementById('loadMoreBtn'), 
        loadMoreContainer: document.getElementById('loadMoreContainer'), 
        weaponSelect: document.getElementById('weaponSelect'), 
        subBar: document.getElementById('subBar'), 
        inventoryList: document.getElementById('inventoryList'), 
        invCount: document.getElementById('invCount'), 
        searchInput: document.getElementById('searchInput'), 
        tabContainer: document.getElementById('tabContainer'), 
        downloadBtn: document.getElementById('downloadBtn'), 
        clearBtn: document.getElementById('clearBtn'), 
        modalOverlay: document.getElementById('modalOverlay'), 
        modalTitle: document.getElementById('modalTitle'), 
        modalMeta: document.getElementById('modalMeta'), 
        weaponSettings: document.getElementById('weaponSettings'), 
        wearSelect: document.getElementById('wearSelect'), 
        statTrakCheck: document.getElementById('statTrakCheck'), 
        customNameInput: document.getElementById('customNameInput'), 
        equipCT: document.getElementById('equipCT'), 
        equipT: document.getElementById('equipT'), 
        previewBox: document.getElementById('previewBox'), 
        cancelBtn: document.getElementById('cancelBtn'), 
        addBtn: document.getElementById('addBtn'), 
        loading: document.getElementById('loading'), 
        loadingText: document.getElementById('loading-text')
    };

    async function fetchWithTimeout(resource, options = {}) {
        const { timeout = 15000, ...fetchOptions } = options;
        const controller = new AbortController();
        const timerId = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(resource, { ...fetchOptions, signal: controller.signal });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response;
        } finally { clearTimeout(timerId); }
    }

    async function fetchSmart(urlObj) {
        if (urlObj.local) {
            try {
                const res = await fetch(urlObj.local);
                if (res.ok) return await res.json();
            } catch (e) { /* ignore */ }
        }
        const res = await fetchWithTimeout(urlObj.remote, { timeout: 20000 });
        return await res.json();
    }

    function isValidDefIndex(defIndex) {
        if (defIndex === null || defIndex === undefined) return false;
        const n = Number(defIndex);
        return Number.isFinite(n) && n > 0;
    }

    function sanitizeFloat(value) {
        let f = parseFloat(value);
        if (isNaN(f)) return 0.001;
        if (f < 0) return 0.001;
        if (f > 1) return 1.0;
        return f;
    }

    function rarityToNumber(r) { if (typeof r === 'object' && r.name) r = r.name; const v = String(r || 'Default').toLowerCase(); if (v.includes('contraband')) return 7; if (v.includes('covert')) return 6; if (v.includes('classified')) return 5; if (v.includes('restricted')) return 4; if (v.includes('mil-spec') || v.includes('mil spec')) return 3; if (v.includes('industrial')) return 2; if (v.includes('consumer')) return 1; if (v.includes('ancient') || v.includes('extraordinary')) return 7; return 0; }
    function getRarityColor(r) { if (!r) return '#ccc'; if (typeof r === 'object' && r.name) r = r.name; const s = String(r).toLowerCase(); if (s.includes('covert')) return 'var(--covert)'; if (s.includes('classified')) return 'var(--classified)'; if (s.includes('restricted')) return 'var(--restricted)'; if (s.includes('mil-spec')) return 'var(--mil-spec)'; if (s.includes('industrial')) return 'var(--industrial)'; if (s.includes('consumer')) return 'var(--consumer)'; if (s.includes('ancient') || s.includes('extraordinary')) return 'var(--ancient)'; if (s.includes('contraband')) return 'var(--contraband)'; return '#ccc'; }
    function getRarityClass(r) { if (!r) return 'rarity-Default'; if (typeof r === 'object' && r.name) r = r.name; const s = String(r).toLowerCase(); if (s.includes('covert')) return 'rarity-Covert'; if (s.includes('classified')) return 'rarity-Classified'; if (s.includes('restricted')) return 'rarity-Restricted'; if (s.includes('mil-spec')) return 'rarity-Mil-Spec'; if (s.includes('industrial')) return 'rarity-Industrial'; if (s.includes('consumer')) return 'rarity-Consumer'; if (s.includes('ancient') || s.includes('extraordinary')) return 'rarity-Ancient'; if (s.includes('contraband')) return 'rarity-Contraband'; return 'rarity-Default'; }

    function parseGloveName(key) {
        const parts = key.split('/'); if (parts.length < 3) return null;
        const raw = parts[parts.length - 1];
        const match = raw.match(/^(sporty|slick|leather|specialist|bloodhound|hydra|brokenfang|studded|motorized|sport)_(.+)$/i);
        if (match) {
            const typeMap = { sporty: 'Sport Gloves', slick: 'Driver Gloves', leather: 'Hand Wraps', specialist: 'Specialist Gloves', bloodhound: 'Bloodhound Gloves', hydra: 'Hydra Gloves', brokenfang: 'Broken Fang Gloves', studded: 'Moto Gloves', motorized: 'Moto Gloves', sport: 'Sport Gloves' };
            const type = typeMap[match[1].toLowerCase()] || match[1];
            let name = match[2].replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            return `★ ${type} | ${name}`;
        }
        return `★ ${raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`;
    }

    function getWeaponCmdFromName(name) {
        if (!name) return null;
        const clean = name.replace(/^★\s*/, '').trim();
        const base = clean.split('|')[0].trim();
        if (WEAPON_NAME_TO_CMD[base]) return WEAPON_NAME_TO_CMD[base];
        for (const key of Object.keys(WEAPON_NAME_TO_CMD)) { if (base === key || base.startsWith(key + ' ')) return WEAPON_NAME_TO_CMD[key]; }
        if (clean.includes('Gloves') || clean.includes('Hand Wraps')) return 'weapon_gloves';
        return null;
    }

    async function loadData() {
        try {
            els.loadingText.textContent = 'Загрузка баз данных...';
            const reqs = [
                fetchSmart(URLS.skins), fetchSmart(URLS.baseWeapons), fetchSmart(URLS.agents), fetchSmart(URLS.stickers), fetchSmart(URLS.crates), fetchSmart(URLS.images)
            ];
            const results = await Promise.allSettled(reqs);

            if (results[0].status === 'fulfilled' && Array.isArray(results[0].value)) {
                results[0].value.forEach(s => {
                    if (!s || !s.name || !s.image) return;
                    const isGloves = s.name.toLowerCase().includes('gloves');
                    const isKnife = !isGloves && s.name.includes('★');
                    const target = isGloves ? db.gloves : (isKnife ? db.knives : db.skins);
                    let defIndex = WEAPON_DEF_INDEX[getWeaponCmdFromName(s.name)] ?? s.def_index ?? 0;
                    if (isGloves && (!defIndex || defIndex === 0)) {
                        for (const [gName, gId] of Object.entries(GLOVE_DEF_INDEX)) {
                            if (s.name.includes(gName)) { defIndex = gId; break; }
                        }
                    }
                    target.push({ id: s.id || s.name, name: s.name, image: s.image, rarity: s.rarity?.name || 'Default', defIndex: defIndex, weaponName: getWeaponCmdFromName(s.name), paintIndex: s.paint_index ?? 0, seed: s.pattern?.seed ?? 0, category: isGloves ? 'gloves' : (isKnife ? 'knife' : 'weapon') });
                });
            }
            if (results[1].status === 'fulfilled' && Array.isArray(results[1].value)) {
                results[1].value.forEach(bw => {
                    if (!bw || !bw.name || !bw.image) return;
                    const isGloves = bw.name.toLowerCase().includes('gloves');
                    const isKnife = !isGloves && bw.name.includes('★');
                    const target = isGloves ? db.gloves : (isKnife ? db.knives : db.skins);
                    if (!target.find(x => x.name === bw.name)) {
                        let defIndex = WEAPON_DEF_INDEX[getWeaponCmdFromName(bw.name)] ?? bw.def_index ?? 0;
                        if (isGloves && (!defIndex || defIndex === 0)) {
                            for (const [gName, gId] of Object.entries(GLOVE_DEF_INDEX)) {
                                if (bw.name.includes(gName)) { defIndex = gId; break; }
                            }
                        }
                        target.push({ id: bw.id || bw.name, name: bw.name, image: bw.image, rarity: 'Default', defIndex: defIndex, weaponName: getWeaponCmdFromName(bw.name), paintIndex: bw.paint_index ?? 0, seed: 0, category: isGloves ? 'gloves' : (isKnife ? 'knife' : 'weapon') });
                    }
                });
            }
            if (results[2].status === 'fulfilled' && Array.isArray(results[2].value)) { results[2].value.forEach(a => { if (a && a.name && a.image) db.agents.push({ id: a.id || a.name, name: a.name, image: a.image, rarity: a.rarity?.name || 'Default', defIndex: a.def_index || 0, category: 'agents' }); }); }
            if (results[3].status === 'fulfilled' && Array.isArray(results[3].value)) { results[3].value.forEach(s => { if (s && s.name && s.image) db.stickers.push({ id: s.id || s.name, name: s.name, image: s.image, rarity: s.rarity?.name || 'Default', defIndex: s.def_index || 0, category: 'stickers' }); }); }
            if (results[4].status === 'fulfilled' && Array.isArray(results[4].value)) { results[4].value.forEach(c => { if (c && c.name && c.image) db.crates.push({ id: c.id || c.name, name: c.name, image: c.image, rarity: c.rarity?.name || 'Default', defIndex: c.def_index || 0, category: 'crates' }); }); }

            if (results[5].status === 'fulfilled' && results[5].value) {
                const imgMap = results[5].value;
                Object.keys(imgMap).forEach(key => {
                    if (key.startsWith('econ/gloves/')) {
                        const name = parseGloveName(key);
                        if (name && !db.gloves.find(x => x.name === name)) { 
                            let gloveDefIndex = 0;
                            for (const [gName, gId] of Object.entries(GLOVE_DEF_INDEX)) {
                                if (name.includes(gName)) { gloveDefIndex = gId; break; }
                            }
                            db.gloves.push({ id: 'glove_' + key, name: name, image: imgMap[key], rarity: 'Ancient', defIndex: gloveDefIndex, weaponName: 'weapon_gloves', paintIndex: 0, category: 'gloves' }); 
                        }
                    }
                });
            }
            populateWeaponDropdown(); switchTab('skins');
        } catch (e) { 
            console.error(e); 
            els.loadingText.textContent = 'Ошибка загрузки. Проверьте интернет.'; 
        } finally { 
            setTimeout(() => { els.loading.classList.add('hidden'); }, 500); 
        }
    }

    function populateWeaponDropdown() {
        const weapons = new Set();
        db.skins.forEach(s => { if (s.name) weapons.add(s.name.split('|')[0].trim()); });
        els.weaponSelect.innerHTML = '<option value="all">Все оружие</option>';
        Array.from(weapons).sort().forEach(w => { const opt = document.createElement('option'); opt.value = w; opt.textContent = w; els.weaponSelect.appendChild(opt); });
    }

    function switchTab(tab) {
        currentTab = tab; currentWeapon = 'all'; searchQuery = ''; els.searchInput.value = '';
        els.tabContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
        els.subBar.style.display = tab === 'skins' ? 'flex' : 'none'; els.weaponSelect.value = 'all'; renderGrid(true);
    }

    function renderGrid(reset = false) {
        if (reset) { renderedCount = 0; els.gridContainer.innerHTML = ''; }
        let source = [];
        if (currentTab === 'skins') source = db.skins; else if (currentTab === 'knives') source = db.knives; else if (currentTab === 'gloves') source = db.gloves; else if (currentTab === 'agents') source = db.agents; else if (currentTab === 'stickers') source = db.stickers; else if (currentTab === 'crates') source = db.crates;

        currentFilteredList = source.filter(item => {
            if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (currentTab === 'skins' && currentWeapon !== 'all' && !item.name.startsWith(currentWeapon + ' |')) return false;
            return true;
        });
        currentFilteredList.sort((a, b) => a.name.localeCompare(b.name));

        if (currentFilteredList.length === 0) {
            if (reset) els.gridContainer.innerHTML = '<p style="color: #555; grid-column: 1/-1; text-align: center; padding: 40px;">Ничего не найдено</p>';
            els.loadMoreContainer.style.display = 'none'; return;
        }

        const nextBatch = currentFilteredList.slice(renderedCount, renderedCount + BATCH_SIZE);
        const fragment = document.createDocumentFragment();
        nextBatch.forEach(item => {
            const card = document.createElement('div');
            card.className = `skin-card ${getRarityClass(item.rarity)}`;
            card.innerHTML = `<div class="img-wrapper"><img src="${item.image}" loading="lazy"></div><div class="info"><div class="name" title="${item.name}">${item.name}</div><div class="rarity-line"><span class="rarity" style="color: ${getRarityColor(item.rarity)};">${item.rarity}</span><span class="type-tag">${currentTab === 'knives' ? 'Нож' : (currentTab === 'gloves' ? 'Перч.' : (currentTab === 'agents' ? 'Агент' : (currentTab === 'stickers' ? 'Накл.' : (currentTab === 'crates' ? 'Кейс' : 'Оружие'))))}</span></div></div>`;
            card.addEventListener('click', () => openModal(item));
            fragment.appendChild(card);
        });

        els.gridContainer.appendChild(fragment);
        renderedCount += nextBatch.length;
        els.loadMoreContainer.style.display = renderedCount < currentFilteredList.length ? 'block' : 'none';
    }

    els.tabContainer.addEventListener('click', (e) => e.target.classList.contains('tab-btn') && switchTab(e.target.dataset.tab));
    els.weaponSelect.addEventListener('change', (e) => { currentWeapon = e.target.value; renderGrid(true); });
    els.searchInput.addEventListener('input', (e) => { searchQuery = e.target.value; renderGrid(true); });
    els.loadMoreBtn.addEventListener('click', () => renderGrid(false));

    function openModal(item) {
        currentModalItem = item;
        els.modalTitle.textContent = item.name;
        els.modalMeta.innerHTML = `<span style="color: ${getRarityColor(item.rarity)};">${item.rarity}</span> · def_index: ${item.defIndex || '?'}`;

        const isWeapon = ['weapon', 'knife', 'gloves'].includes(item.category);
        els.weaponSettings.style.display = isWeapon ? 'block' : 'none';

        const validDef = isValidDefIndex(item.defIndex);
        els.addBtn.disabled = !validDef;
        els.addBtn.style.opacity = validDef ? '1' : '0.4';
        els.addBtn.title = validDef ? '' : 'У предмета отсутствует корректный def_index — добавление невозможно';

        if (isWeapon) {
            els.wearSelect.value = 'Field-Tested'; 
            els.statTrakCheck.checked = false; 
            els.customNameInput.value = '';
            els.equipCT.checked = false; els.equipT.checked = false; els.equipCT.disabled = false; els.equipT.disabled = false; els.equipCT.parentElement.style.opacity = '1'; els.equipT.parentElement.style.opacity = '1';
            const tOnly = [4, 13, 39, 11, 17, 30, 29, 7]; const ctOnly = [61, 32, 3, 34, 10, 16, 60, 8, 38, 27];
            if (tOnly.includes(item.defIndex)) { els.equipCT.disabled = true; els.equipCT.parentElement.style.opacity = '0.3'; }
            if (ctOnly.includes(item.defIndex)) { els.equipT.disabled = true; els.equipT.parentElement.style.opacity = '0.3'; }
        } else { els.equipCT.checked = false; els.equipT.checked = false; }

        updatePreview(); els.modalOverlay.classList.add('active');
    }

    els.wearSelect.addEventListener('change', updatePreview);
    [els.statTrakCheck, els.customNameInput, els.equipCT, els.equipT].forEach(el => { el.addEventListener('input', updatePreview); el.addEventListener('change', updatePreview); });

    function updatePreview() {
        if (!currentModalItem) return;
        const isWeapon = ['weapon', 'knife', 'gloves'].includes(currentModalItem.category);
        
        const currentWear = els.wearSelect.value;
        const safeFloat = isWeapon ? (WEAR_FLOAT[currentWear] || 0.265) : 0;

        let content = `\t"1"\n\t{\n\t\t"inventory"\t\t"1"\n\t\t"def_index"\t\t"${currentModalItem.defIndex || 0}"\n\t\t"quality"\t\t"${els.statTrakCheck.checked ? 9 : 0}"\n\t\t"rarity"\t\t"${rarityToNumber(currentModalItem.rarity)}"\n`;
        if (els.customNameInput.value) content += `\t\t"custom_name"\t\t"${els.customNameInput.value}"\n`;
        if (isWeapon) {
            content += `\t\t"attributes"\n\t\t{\n\t\t\t"6"\t\t"${currentModalItem.paintIndex || 0}.000000"\n\t\t\t"8"\t\t"${safeFloat.toFixed(6)}"\n`;
            if (els.statTrakCheck.checked) { content += `\t\t\t"80"\t\t"0.000000"\n\t\t\t"81"\t\t"0.000000"\n`; }
            content += `\t\t}\n`;
        }
        content += `\t}\n`; els.previewBox.textContent = content;
    }

    function closeModal() { els.modalOverlay.classList.remove('active'); currentModalItem = null; }
    els.cancelBtn.addEventListener('click', closeModal);
    els.modalOverlay.addEventListener('click', (e) => e.target === els.modalOverlay && closeModal());

    els.addBtn.addEventListener('click', () => {
        if (!currentModalItem) return;

        if (!isValidDefIndex(currentModalItem.defIndex)) {
            alert(`Предмет "${currentModalItem.name}" не имеет корректного def_index и не может быть добавлен.`);
            return;
        }

        const isWeapon = ['weapon', 'knife', 'gloves'].includes(currentModalItem.category);
        const rawFloat = isWeapon ? (WEAR_FLOAT[els.wearSelect.value] || 0.265) : null;

        inventory.push({
            item: currentModalItem,
            float: rawFloat,
            statTrak: isWeapon ? els.statTrakCheck.checked : false,
            customName: els.customNameInput.value.trim(),
            equipCT: els.equipCT.checked,
            equipT: els.equipT.checked
        });
        renderInventory(); closeModal();
    });

    function renderInventory() {
        els.invCount.textContent = inventory.length;
        if (inventory.length === 0) { els.inventoryList.innerHTML = '<div class="empty-state"><div class="empty-icon">＋</div><strong>Пусто</strong></div>'; return; }
        els.inventoryList.innerHTML = '';
        inventory.forEach((entry, idx) => {
            const div = document.createElement('div');
            div.className = 'inv-item';
            let tags = []; if (entry.statTrak) tags.push('ST'); if (entry.equipCT) tags.push('CT'); if (entry.equipT) tags.push('T');
            let subText = tags.length > 0 ? tags.join(', ') : '';
            div.innerHTML = `<img src="${entry.item.image}"><div class="inv-info"><div class="inv-name" title="${entry.item.name}">${entry.customName ? `★ ${entry.customName}` : entry.item.name}</div><div class="inv-wear"><span style="color: ${getRarityColor(entry.item.rarity)};">${subText}</span><span class="float-val">${entry.float !== null ? entry.float.toFixed(4) : '—'}</span></div></div><button class="remove-btn" data-index="${idx}">✕</button>`;
            els.inventoryList.appendChild(div);
        });
        els.inventoryList.querySelectorAll('.remove-btn').forEach(btn => { btn.addEventListener('click', (e) => { inventory.splice(parseInt(e.target.dataset.index), 1); renderInventory(); }); });
    }

    els.downloadBtn.addEventListener('click', () => {
        if (inventory.length === 0) return alert('Инвентарь пуст.');

        let content = '"items"\n{\n';
        let defaultEquips = '"default_equips"\n{\n';
        let hasDefaultEquips = false;
        let writtenCount = 0;
        let skippedCount = 0;

        inventory.forEach((entry) => {
            const item = entry.item;
            if (!item) { skippedCount++; return; }

            if (!isValidDefIndex(item.defIndex)) {
                console.warn(`Пропущен предмет без валидного def_index: "${item.name}" (def_index=${item.defIndex})`);
                skippedCount++;
                return;
            }

            const isWeapon = ['weapon', 'knife', 'gloves'].includes(item.category);
            const defIndex = Number(item.defIndex);
            const itemNumber = writtenCount + 1;

            content += `\t"${itemNumber}"\n\t{\n\t\t"inventory"\t\t"${itemNumber}"\n\t\t"def_index"\t\t"${defIndex}"\n\t\t"level"\t\t"1"\n`;

            let quality = 4;
            if (entry.statTrak) quality = 9;
            else if (item.category === 'knife' || item.category === 'gloves') quality = 3;

            content += `\t\t"quality"\t\t"${quality}"\n\t\t"flags"\t\t"0"\n\t\t"origin"\t\t"8"\n\t\t"in_use"\t\t"0"\n\t\t"rarity"\t\t"${rarityToNumber(item.rarity)}"\n`;
            if (entry.customName) content += `\t\t"custom_name"\t\t"${entry.customName}"\n`;

            if (isWeapon) {
                const safeFloat = sanitizeFloat(entry.float);
                content += `\t\t"attributes"\n\t\t{\n\t\t\t"6"\t\t"${item.paintIndex || 0}.000000"\n\t\t\t"8"\t\t"${safeFloat.toFixed(6)}"\n`;
                if (entry.statTrak) { content += `\t\t\t"80"\t\t"0.000000"\n\t\t\t"81"\t\t"0.000000"\n`; }
                content += `\t\t}\n`;
            }

            if (entry.equipCT || entry.equipT) {
                content += `\t\t"equipped_state"\n\t\t{\n`;
                let slot = 1;
                if (defIndex >= 5000 && defIndex < 6000) slot = 0; // Перчатки
                else if (defIndex >= 500 && defIndex < 5030) slot = 0; // Ножи
                else if ([1, 2, 3, 4, 30, 32, 36, 61, 64].includes(defIndex)) slot = 2; // Пистолеты

                if (entry.equipCT) content += `\t\t\t"3"\t\t"${slot}"\n`;
                if (entry.equipT) content += `\t\t\t"2"\t\t"${slot}"\n`;
                content += `\t\t}\n`;

                hasDefaultEquips = true;
                if (entry.equipCT) defaultEquips += `\t"${defIndex}"\n\t{\n\t\t"class_id"\t\t"3"\n\t\t"slot_id"\t\t"${slot}"\n\t}\n`;
                if (entry.equipT) defaultEquips += `\t"${defIndex}"\n\t{\n\t\t"class_id"\t\t"2"\n\t\t"slot_id"\t\t"${slot}"\n\t}\n`;
            }

            content += `\t}\n`;
            writtenCount++;
        });

        if (writtenCount === 0) {
            alert(`Все предметы (${skippedCount}) содержат некорректный def_index и были пропущены. Файл не создан.`);
            return;
        }

        content += '}\n';
        if (hasDefaultEquips) content += defaultEquips + '}\n';

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'inventory.txt';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        if (skippedCount > 0) console.warn(`Пропущено предметов с некорректным def_index: ${skippedCount}`);
    });

    els.clearBtn.addEventListener('click', () => { if (inventory.length > 0 && confirm('Очистить инвентарь?')) { inventory = []; renderInventory(); } });
    loadData();
})();
