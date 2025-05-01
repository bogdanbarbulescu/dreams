// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const body = document.body;
    const mainContent = document.getElementById('main-content');

    // Views
    const views = document.querySelectorAll('.view');
    const dashboardView = document.getElementById('dashboard-view');
    const dreamDetailView = document.getElementById('dream-detail-view');
    const planView = document.getElementById('plan-view');
    const historyView = document.getElementById('history-view');
    const reflectionView = document.getElementById('reflection-view'); // New View
    const quotesView = document.getElementById('quotes-view');
    const settingsView = document.getElementById('settings-view');

    // Navigation
    const bottomNav = document.querySelector('.bottom-nav');
    const navButtons = document.querySelectorAll('.nav-btn');

    // Dashboard Elements
    const dreamCardsContainer = document.getElementById('dream-cards-container');
    const noDreamsMessage = document.getElementById('no-dreams-message');
    const addDreamBtn = document.getElementById('add-dream-btn');

    // Dream Detail Elements
    const detailHeaderTitle = document.getElementById('detail-view-title');
    const detailDreamText = document.getElementById('detail-dream-text');
    const detailSmartGoalText = document.getElementById('detail-smart-goal-text');
    const detailGoalDeadlineDisplay = document.getElementById('detail-goal-deadline-display');
    const detailConsistencyProgress = document.getElementById('detail-consistency-progress');
    const detailConsistencyPercentage = document.getElementById('detail-consistency-percentage');
    const detailHabitsList = document.getElementById('detail-habits-list');
    const dailyNoteInput = document.getElementById('daily-note-input');
    const metricsChartsSection = document.getElementById('metrics-charts-section');
    const streakMetricsElement = document.getElementById('streak-metrics');
    const currentStreakSpan = document.getElementById('current-streak');
    const longestStreakSpan = document.getElementById('longest-streak');
    const habitBreakdownContainer = document.getElementById('habit-breakdown-chart-container');
    const habitBreakdownCanvas = document.getElementById('habit-breakdown-chart');
    const heatmapContainer = document.getElementById('heatmap-container');
    const heatmapGridElement = document.getElementById('heatmap-grid');
    const backToDashboardBtn = dreamDetailView.querySelector('.back-btn');
    const editSelectedDreamBtn = document.getElementById('edit-selected-dream-btn');

    // Plan View Elements
    const planHeaderTitle = document.getElementById('plan-view-title');
    const goalForm = document.getElementById('goal-form');
    const editingDreamIdInput = document.getElementById('editing-dream-id');
    const dreamInput = document.getElementById('dream-input');
    const smartGoalInput = document.getElementById('smart-goal-input');
    const goalDeadlineInput = document.getElementById('goal-deadline-input');
    const habitsInputContainer = document.getElementById('habits-input-container');
    const addHabitInputBtn = document.getElementById('add-habit-btn');
    const savePlanBtn = document.getElementById('save-plan-btn');
    const deleteDreamBtn = document.getElementById('delete-dream-btn');
    const cancelPlanBtn = planView.querySelector('.cancel-plan-btn');

    // History View Elements
    const historyDreamTitle = document.getElementById('history-dream-title');
    const historyLogList = document.getElementById('history-log-list');
    const historyPagination = document.getElementById('history-pagination');
    const historyPrevBtn = document.getElementById('history-prev-btn');
    const historyNextBtn = document.getElementById('history-next-btn');
    const historyPageInfo = document.getElementById('history-page-info');
    const historyBackBtn = historyView.querySelector('.back-btn');

    // Reflection View Elements
    const reflectionListContainer = document.getElementById('reflection-list'); // New Container

    // Quotes View Elements
    const quoteTextElement = document.getElementById('quote-text');
    const quoteAuthorElement = document.getElementById('quote-author');
    const nextQuoteBtn = document.getElementById('next-quote-btn');

    // Settings View Elements
    const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
    const resetDataBtn = document.getElementById('reset-data-btn');

    // --- State & Data ---
    const STORAGE_KEY = 'ascentAppData_v3'; // Increment version for new structure
    const THEME_KEY = 'ascentAppTheme';
    const CONSISTENCY_DAYS = 7;
    const HISTORY_ITEMS_PER_PAGE = 15;
    const NOTE_KEY = "_note";
    const HEATMAP_DAYS = 35;

    const defaultData = {
        dreams: [],
        reflections: {}, // New property for reflection answers
        settings: { consistencyPeriodDays: CONSISTENCY_DAYS }
    };

    let appData = loadData();
    let currentView = 'dashboard-view';
    let currentDreamId = null;
    let prominenceTimeout = null;
    let historyCurrentPage = 1;
    let historyTotalPages = 1;
    let sortedLogEntries = [];
    let habitChartInstance = null;

    // Reflection Questions Data
    const reflectionQuestions = [
        { id: "q1", text: "Ce momente din 2024 mi-au adus cea mai mare bucurie și împlinire? Cum pot crea intenționat mai multe astfel de momente în 2025?" },
        { id: "q2", text: "Cum mi-am folosit timpul în 2024? Am investit în ceea ce contează cu adevărat pentru mine sau m-am lăsat distras de lucruri superficiale și cerințele altora?" },
        { id: "q3", text: "De ce am renunțat sau încetinit ritmul atunci când lucrurile au devenit dificile? A fost cu adevărat imposibil să merg mai departe, sau am fost paralizat de frică, nesiguranță sau autovictimizare?" },
        { id: "q4", text: "Ce scuze îmi spun de obicei pentru a evita să dau tot ce am mai bun? Cum aș putea să înfrunt aceste scuze și să le transform în motivație?" },
        { id: "q5", text: "Cum se va schimba viața mea dacă îmi ating obiectivele în 2025? Ce mă inspiră la acel viitor și de ce merită să lupt pentru el?" },
        { id: "q6", text: "Sunt obiectivele mele pentru 2025 cu adevărat despre mine? Le-am ales pentru că le simt profund relevante, sau sunt doar o încercare de a câștiga acceptarea și iubirea celorlalți?" },
        { id: "q7", text: "Cine vreau să devin până la finalul lui 2025? Descrie clar acea versiune a ta - cum gândește, cum acționează, ce prioritizează și ce fel de viață creează." },
        { id: "q8", text: "Obiceiurile și mentalitatea mea actuală mă conduc spre succesul pe care mi-l doresc? Ce schimbări sunt necesare pentru ca versiunea mea ideală din 2025 să devină realitate?" }
    ];


    // Sample Quotes Data
    const quotes = [
        { text: "The only thing standing between you and your dream is the will to try and the belief that it is actually possible.", author: "Joel Brown" },
        { text: "Dreams without goals are just dreams. And ultimately, they fuel disappointment. On the road to achieving your dreams, you must apply discipline but more importantly, consistency because without commitment you’ll never start, but without consistency, you’ll never finish.", author: "Denzel Washington" },
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
        { text: "Our goals can only be reached through a vehicle of a plan, in which we must fervently believe, and upon which we must vigorously act. There is no other route to success.", author: "Pablo Picasso"}
    ];
    let currentQuoteIndex = -1;

    // --- Initialization ---
    function init() {
        loadTheme();
        setupEventListeners();
        // Determine initial view based on data existence (dreams or reflections might exist)
        const initialView = (appData.dreams && appData.dreams.length > 0) || (appData.reflections && Object.keys(appData.reflections).length > 0) ? 'dashboard-view' : 'plan-view';
        navigateTo(initialView, { forceNoId: (initialView === 'plan-view') });
    }

    function setupEventListeners() {
        bottomNav.addEventListener('click', handleNavClick);
        addDreamBtn.addEventListener('click', handleAddDreamClick);
        dreamCardsContainer.addEventListener('click', handleDreamCardClick);
        backToDashboardBtn.addEventListener('click', () => navigateTo('dashboard-view'));
        editSelectedDreamBtn.addEventListener('click', handleEditDreamClick);
        detailHabitsList.addEventListener('change', handleHabitCheck);
        dailyNoteInput.addEventListener('input', debounce(handleDailyNoteInput, 500));
        goalForm.addEventListener('submit', handlePlanFormSubmit);
        addHabitInputBtn.addEventListener('click', handleAddHabitInput);
        habitsInputContainer.addEventListener('click', handleRemoveHabitInput);
        deleteDreamBtn.addEventListener('click', handleDeleteDream);
        cancelPlanBtn.addEventListener('click', handleCancelPlan);
        historyPrevBtn.addEventListener('click', handleHistoryPrev);
        historyNextBtn.addEventListener('click', handleHistoryNext);
        historyBackBtn?.addEventListener('click', () => navigateTo('dream-detail-view'));
        reflectionListContainer?.addEventListener('click', handleReflectionActionClick); // Listener for reflection buttons
        nextQuoteBtn.addEventListener('click', displayRandomQuote);
        themeToggleCheckbox.addEventListener('change', handleThemeToggle);
        resetDataBtn.addEventListener('click', handleResetData);
    }

    // --- Data Persistence & Access ---
    function loadData() {
        const storedData = localStorage.getItem(STORAGE_KEY);
        try {
            if (storedData) {
                const parsed = JSON.parse(storedData);
                // Ensure essential structure exists, including reflections
                if (!parsed.dreams) parsed.dreams = [];
                if (!parsed.reflections) parsed.reflections = {}; // Add reflections if missing
                if (!parsed.settings) parsed.settings = defaultData.settings;
                return parsed;
            }
        } catch (error) {
            console.error("Error parsing data:", error);
        }
        return JSON.parse(JSON.stringify(defaultData)); // Deep copy default data
    }
    function saveData() { /* (Same - will now save reflections too) */
       try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appData)); } catch (error) { console.error("Error saving data:", error); alert("Could not save progress."); }
    }
    function getDreamById(dreamId) { return appData.dreams.find(dream => dream.id === dreamId); }
    function generateUUID() { /* (Same) */ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) { var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); }); }

    // --- Theme Management ---
    function loadTheme() { /* (Same) */ const savedTheme = localStorage.getItem(THEME_KEY) || 'light-theme'; setTheme(savedTheme, false); }
    function setTheme(themeName, save = true) { /* (Same - chart re-render still applies) */ body.className = themeName; themeToggleCheckbox.checked = (themeName === 'dark-theme'); if (save) { localStorage.setItem(THEME_KEY, themeName); } if (currentView === 'dream-detail-view' && currentDreamId) { const dream = getDreamById(currentDreamId); renderHabitBreakdownChart(dream?.smartGoal?.log || {}, dream?.smartGoal?.habits || {}); } }
    function handleThemeToggle() { /* (Same) */ const newTheme = themeToggleCheckbox.checked ? 'dark-theme' : 'light-theme'; setTheme(newTheme); }

    // --- View Management ---
    function showView(viewId) { /* (Same) */ views.forEach(view => { view.classList.toggle('active', view.id === viewId); }); currentView = viewId; mainContent.scrollTop = 0; }
    function updateActiveNavButton(viewId) { /* (Same) */ navButtons.forEach(btn => { btn.classList.toggle('active', btn.dataset.view === viewId); }); }
    function navigateTo(viewId, options = {}) {
        if (!document.getElementById(viewId)) { console.error(`View ID "${viewId}" not found.`); viewId = 'dashboard-view'; options.forceNoId = true; }

        // Handle context clearing
        const contextSensitiveViews = ['dream-detail-view', 'plan-view', 'history-view'];
        if (contextSensitiveViews.includes(currentView) && !contextSensitiveViews.includes(viewId)) { currentDreamId = null; }
        if ((viewId === 'dream-detail-view' || viewId === 'history-view') && !currentDreamId && !options.forceNoId) { console.warn(`Nav to ${viewId} blocked, no ID.`); navigateTo('dashboard-view'); return; }
        if (currentView === 'history-view' && viewId !== 'history-view') { historyCurrentPage = 1; }

        // Destroy chart if navigating away from detail view
        if (currentView === 'dream-detail-view' && viewId !== 'dream-detail-view' && habitChartInstance) { habitChartInstance.destroy(); habitChartInstance = null; }

        // Render content BEFORE showing
        try {
            switch (viewId) {
                case 'dashboard-view': renderDashboard(); break;
                case 'dream-detail-view': renderDreamDetail(currentDreamId); break;
                case 'plan-view': renderPlanView(options.editMode ? currentDreamId : null); break;
                case 'history-view': renderHistoryView(currentDreamId); break;
                case 'reflection-view': renderReflectionView(); break; // Render new view
                case 'quotes-view': renderQuotesView(); break;
                case 'settings-view': renderSettingsView(); break;
            }
            showView(viewId);
            updateActiveNavButton(viewId);
        } catch (error) { console.error(`Error rendering ${viewId}:`, error); alert(`Error loading ${viewId}.`); navigateTo('dashboard-view', { forceNoId: true }); }
    }
    function handleNavClick(event) { /* (Same - handles new button via dataset) */
        const targetButton = event.target.closest('.nav-btn'); if (targetButton?.dataset.view) { navigateTo(targetButton.dataset.view); }
    }

    // --- Rendering Functions ---
    function renderDashboard() { /* (Same) */
        dreamCardsContainer.innerHTML = ''; if (appData.dreams.length === 0) { noDreamsMessage.style.display = 'block'; } else { noDreamsMessage.style.display = 'none'; appData.dreams.forEach(dream => { dreamCardsContainer.appendChild(createDreamCard(dream)); }); }
    }
    function createDreamCard(dream) { /* (Same) */
        const card = document.createElement('div'); card.className = 'dream-card'; card.dataset.dreamId = dream.id; const title = document.createElement('h3'); title.textContent = dream.dreamText; const goalSummary = document.createElement('p'); goalSummary.className = 'goal-summary'; goalSummary.textContent = dream.smartGoal?.text || 'No goal set'; const metricDiv = document.createElement('div'); metricDiv.className = 'card-metric'; const metricLabel = document.createElement('label'); metricLabel.textContent = `Consistency (${CONSISTENCY_DAYS}d):`; const metricValueSpan = document.createElement('span'); const metricProgress = document.createElement('progress'); metricProgress.max = 100; const consistency = calculateConsistency(dream.smartGoal?.habits || [], dream.smartGoal?.log || {}, CONSISTENCY_DAYS); metricValueSpan.textContent = `${consistency.percentage}%`; metricProgress.value = consistency.percentage; metricDiv.appendChild(metricLabel); metricDiv.appendChild(metricValueSpan); metricDiv.appendChild(metricProgress); card.appendChild(title); card.appendChild(goalSummary); card.appendChild(metricDiv); return card;
    }

    function renderDreamDetail(dreamId) { /* (Same - calls chart renders) */
        const dream = getDreamById(dreamId); if (!dream) { navigateTo('dashboard-view'); return; }
        detailHeaderTitle.textContent = dream.dreamText || "Dream Details"; detailDreamText.textContent = dream.dreamText || '[No Dream Text]'; detailSmartGoalText.textContent = dream.smartGoal?.text || '[No SMART Goal Set]'; detailSmartGoalText.classList.remove('goal-boosted');
        if (dream.smartGoal?.deadline) { try { const d = new Date(dream.smartGoal.deadline + 'T00:00:00'); detailGoalDeadlineDisplay.textContent = `Target: ${d.toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})}`; detailGoalDeadlineDisplay.style.display='block'; } catch(e){ detailGoalDeadlineDisplay.textContent = `Target: ${dream.smartGoal.deadline}`; detailGoalDeadlineDisplay.style.display='block'; } } else { detailGoalDeadlineDisplay.style.display = 'none'; }
        const habits = dream.smartGoal?.habits || []; const log = dream.smartGoal?.log || {}; const todayStr = getTodayDateString();
        renderHabitList(habits, log, detailHabitsList); updateConsistencyProgress(habits, log, detailConsistencyProgress, detailConsistencyPercentage); renderStreakMetrics(log, habits);
        if (habitBreakdownCanvas && heatmapGridElement) { renderHabitBreakdownChart(log, habits); renderHeatmap(log, habits); } else { console.error("Chart/heatmap container missing"); }
        dailyNoteInput.value = log[todayStr]?.[NOTE_KEY] || ''; dailyNoteInput.setCustomValidity('');
    }

    function renderHabitList(habits, log, targetListElement) { /* (Same) */
        targetListElement.innerHTML = ''; const todayStr = getTodayDateString(); const todaysLog = log[todayStr] || {}; if (!habits || habits.length === 0) { targetListElement.innerHTML = '<li class="text-muted" style="text-align: center; padding: 10px;">No habits defined.</li>'; return; } habits.forEach(habit => { const li = document.createElement('li'); li.className = 'habit-item'; const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.id = `habit-checkbox-${habit.id}`; checkbox.dataset.habitId = habit.id; checkbox.checked = todaysLog[habit.id] === true; const label = document.createElement('label'); label.htmlFor = `habit-checkbox-${habit.id}`; label.textContent = habit.text; li.appendChild(checkbox); li.appendChild(label); targetListElement.appendChild(li); });
    }

    function calculateConsistency(habits, log, days) { /* (Same) */
        let totalPossible = 0; let totalCompleted = 0; const endDate = new Date(); if (!habits || habits.length === 0) return { percentage: 0, completed: 0, possible: 0 }; for (let i = 0; i < days; i++) { const date = new Date(endDate); date.setDate(endDate.getDate() - i); const dateStr = getISODateString(date); const dailyLog = log[dateStr] || {}; totalPossible += habits.length; habits.forEach(habit => { if (dailyLog[habit.id] === true) totalCompleted++; }); } const percentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0; return { percentage, completed: totalCompleted, possible: totalPossible };
    }
    function updateConsistencyProgress(habits, log, progressElement, percentageElement) { /* (Same) */
        const consistency = calculateConsistency(habits, log, CONSISTENCY_DAYS); if (progressElement) progressElement.value = consistency.percentage; if (percentageElement) percentageElement.textContent = `${consistency.percentage}%`; return consistency;
    }

    function renderStreakMetrics(log, habits) { /* (Same) */
        if (!habits || habits.length === 0) { currentStreakSpan.textContent = '0'; longestStreakSpan.textContent = '0'; return; } const { currentStreak, longestStreak } = calculateStreaks(log, habits); currentStreakSpan.textContent = currentStreak; longestStreakSpan.textContent = longestStreak;
    }
    function calculateStreaks(log, habits) { /* (Same - using corrected logic) */
        let currentStreak = 0; let longestStreak = 0; const habitIds = habits.map(h => h.id); const sortedDates = Object.keys(log).sort(); if (sortedDates.length === 0) return { currentStreak: 0, longestStreak: 0 }; let potentialStreak = 0; let lastStreakDate = null; for (const dateStr of sortedDates) { const dailyLog = log[dateStr]; const allCompleted = habitIds.every(id => dailyLog[id] === true); const currentDate = new Date(dateStr + "T00:00:00"); if (allCompleted) { if (lastStreakDate) { const diffTime = currentDate - lastStreakDate; const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); if (diffDays === 1) { potentialStreak++; } else { potentialStreak = 1; } } else { potentialStreak = 1; } lastStreakDate = currentDate; if (potentialStreak > longestStreak) { longestStreak = potentialStreak; } } else { potentialStreak = 0; lastStreakDate = null; } } if (lastStreakDate) { const today = new Date(); const todayStr = getISODateString(today); const lastStreakDayStr = getISODateString(lastStreakDate); if(lastStreakDayStr === todayStr) { currentStreak = potentialStreak; } else { const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1); if (getISODateString(yesterday) === lastStreakDayStr) { currentStreak = potentialStreak; } else { currentStreak = 0; } } } else { currentStreak = 0; } if (potentialStreak > longestStreak) { longestStreak = potentialStreak; } return { currentStreak, longestStreak };
    }

    function renderHabitBreakdownChart(log, habits) { /* (Same - uses Chart.js) */
        const container = habitBreakdownCanvas?.parentNode; if (!container) return; container.style.display = (!habits || habits.length === 0) ? 'none' : 'block'; if (habitChartInstance) { habitChartInstance.destroy(); habitChartInstance = null; } if (!habits || habits.length === 0 || !habitBreakdownCanvas) { return; }
        const ctx = habitBreakdownCanvas.getContext('2d'); const daysToAnalyze = 7; const habitData = {}; const habitLabels = []; const habitPercentages = []; habits.forEach(h => { habitData[h.id] = { completed: 0, possible: 0, text: h.text }; habitLabels.push(h.text); }); const endDate = new Date(); for (let i = 0; i < daysToAnalyze; i++) { const date = new Date(endDate); date.setDate(endDate.getDate() - i); const dateStr = getISODateString(date); const dailyLog = log[dateStr] || {}; habits.forEach(habit => { habitData[habit.id].possible++; if (dailyLog[habit.id] === true) { habitData[habit.id].completed++; } }); } habitLabels.forEach(label => { const habit = habits.find(h => h.text === label); if (habit) { const data = habitData[habit.id]; const percentage = (data.possible > 0) ? Math.round((data.completed / data.possible) * 100) : 0; habitPercentages.push(percentage); } else { habitPercentages.push(0); } });
        const isDarkMode = body.classList.contains('dark-theme'); const gridColor = isDarkMode ? 'hsla(var(--gg-accent-hue), 20%, 50%, 0.3)' : 'rgba(0, 0, 0, 0.1)'; const tickColor = isDarkMode ? 'hsl(var(--gg-accent-hue), 15%, 70%)' : '#666'; const barBackgroundColor = isDarkMode ? `hsla(${getComputedStyle(body).getPropertyValue('--gg-accent-hue')}, 85%, 55%, 0.6)` : 'rgba(0, 122, 255, 0.6)'; const barBorderColor = isDarkMode ? `hsl(${getComputedStyle(body).getPropertyValue('--gg-accent-hue')}, 85%, 55%)` : 'rgb(0, 122, 255)'; const chartFont = isDarkMode ? getComputedStyle(body).getPropertyValue('--gg-font') : getComputedStyle(body).getPropertyValue('--font-primary-base');
        habitChartInstance = new Chart(ctx, { type: 'bar', data: { labels: habitLabels, datasets: [{ label: '% Completed', data: habitPercentages, backgroundColor: barBackgroundColor, borderColor: barBorderColor, borderWidth: 1 }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true, max: 100, ticks: { color: tickColor, font: { family: chartFont }, callback: value => value + "%" }, grid: { color: gridColor } }, y: { ticks: { color: tickColor, font: { family: chartFont } }, grid: { display: false } } }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => `${context.dataset.label}: ${context.raw}%` } } } } });
    }

    function renderHeatmap(log, habits) { /* (Same - generates heatmap divs) */
        if (!heatmapGridElement) return; heatmapGridElement.innerHTML = ''; heatmapGridElement.style.display = (!habits || habits.length === 0) ? 'none' : 'grid'; heatmapContainer.style.display = (!habits || habits.length === 0) ? 'none' : 'block'; if (!habits || habits.length === 0) { return; }
        const numHabits = habits.length; const endDate = new Date(); const startDate = new Date(); startDate.setDate(endDate.getDate() - (HEATMAP_DAYS - 1));
        for (let i = 0; i < HEATMAP_DAYS; i++) { const date = new Date(startDate); date.setDate(startDate.getDate() + i); const dateStr = getISODateString(date); const dailyLog = log[dateStr] || {}; let completedCount = 0; habits.forEach(habit => { if (dailyLog[habit.id] === true) { completedCount++; } }); const percentage = numHabits > 0 ? (completedCount / numHabits) : 0; let level = 0; if (percentage > 0) { level = Math.min(4, Math.max(1, Math.ceil(percentage * 4))); } const dayCell = document.createElement('div'); dayCell.className = `heatmap-day heatmap-level-${level}`; dayCell.title = `${date.toLocaleDateString()}: ${Math.round(percentage * 100)}% (${completedCount}/${numHabits})`; heatmapGridElement.appendChild(dayCell); }
    }

    function renderPlanView(dreamId = null) { /* (Same) */
        currentDreamId = dreamId; populatePlanForm(dreamId); if (dreamId) { planHeaderTitle.textContent = "Edit Your Ascent"; savePlanBtn.textContent = "Update Plan"; deleteDreamBtn.style.display = 'block'; } else { planHeaderTitle.textContent = "Plan Your Ascent"; savePlanBtn.textContent = "Save Plan"; deleteDreamBtn.style.display = 'none'; }
    }
    function populatePlanForm(dreamId) { /* (Same) */
        const dream = dreamId ? getDreamById(dreamId) : null; editingDreamIdInput.value = dreamId || ''; dreamInput.value = dream?.dreamText || ''; smartGoalInput.value = dream?.smartGoal?.text || ''; goalDeadlineInput.value = dream?.smartGoal?.deadline || ''; habitsInputContainer.innerHTML = ''; const habits = dream?.smartGoal?.habits || []; const habitsToDisplay = habits.length > 0 ? habits : [{ id: '', text: '' }, { id: '', text: '' }, { id: '', text: '' }]; habitsToDisplay.forEach((habit, index) => { createHabitInputElement(habit.text || '', index); }); updateRemoveButtonsVisibility();
    }
    function createHabitInputElement(value = '', index) { /* (Same) */
        const div = document.createElement('div'); div.className = 'habit-input-group'; const input = document.createElement('input'); input.type = 'text'; input.className = 'habit-input'; input.placeholder = `Habit ${index + 1}`; input.value = value; input.required = true; const removeBtn = document.createElement('button'); removeBtn.type = 'button'; removeBtn.className = 'remove-habit-btn'; removeBtn.title = 'Remove habit'; removeBtn.innerHTML = '×'; div.appendChild(input); div.appendChild(removeBtn); habitsInputContainer.appendChild(div);
    }
    function handleAddHabitInput() { /* (Same) */
        const h = habitsInputContainer.querySelectorAll('.habit-input-group'); createHabitInputElement('', h.length); updateRemoveButtonsVisibility();
    }
    function handleRemoveHabitInput(event) { /* (Same) */
        if (event.target.classList.contains('remove-habit-btn')) { const h = habitsInputContainer.querySelectorAll('.habit-input-group'); if (h.length > 3) { event.target.closest('.habit-input-group').remove(); updateRemoveButtonsVisibility(); } else { alert("Minimum of 3 habits required."); } }
    }
     function updateRemoveButtonsVisibility() { /* (Same) */
        const h=habitsInputContainer.querySelectorAll('.habit-input-group');const s=h.length>3; h.forEach(g=>{const b=g.querySelector('.remove-habit-btn');if(b){b.style.display=s?'inline-block':'none';}});
     }

    function renderHistoryView(dreamId) { /* (Same) */
        const dream = getDreamById(dreamId); if (!dream) { navigateTo('dashboard-view'); return; } historyDreamTitle.textContent = `History for: ${dream.dreamText}`; const log = dream.smartGoal?.log || {}; sortedLogEntries = Object.entries(log).sort(([dateA], [dateB]) => dateB.localeCompare(dateA)); historyTotalPages = Math.ceil(sortedLogEntries.length / HISTORY_ITEMS_PER_PAGE); historyCurrentPage = Math.max(1, Math.min(historyCurrentPage, historyTotalPages)); renderHistoryPage();
    }
    function renderHistoryPage() { /* (Same) */
        historyLogList.innerHTML = '<li class="history-loading">Rendering...</li>'; const startIndex = (historyCurrentPage - 1) * HISTORY_ITEMS_PER_PAGE; const endIndex = startIndex + HISTORY_ITEMS_PER_PAGE; const pageEntries = sortedLogEntries.slice(startIndex, endIndex); historyLogList.innerHTML = ''; if (pageEntries.length === 0) { historyLogList.innerHTML = '<li class="text-muted" style="text-align: center;">No log entries found.</li>'; } else { const dream = getDreamById(currentDreamId); const habitsMap = new Map(dream?.smartGoal?.habits?.map(h => [h.id, h.text]) || []); pageEntries.forEach(([dateStr, dailyLog]) => { const li = document.createElement('li'); li.className = 'history-log-item'; const dateEl = document.createElement('span'); dateEl.className = 'log-date'; try { const d = new Date(dateStr + 'T00:00:00'); dateEl.textContent = d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}); } catch(e) { dateEl.textContent = dateStr; } li.appendChild(dateEl); if(dailyLog[NOTE_KEY]){ const noteEl = document.createElement('p'); noteEl.className = 'log-note'; noteEl.textContent = `Note: ${dailyLog[NOTE_KEY]}`; li.appendChild(noteEl); } Object.entries(dailyLog).forEach(([key, value]) => { if (key !== NOTE_KEY) { const habitText = habitsMap.get(key) || `Unknown Habit (ID: ${key})`; const habitStatus = value === true; const habitEl = document.createElement('div'); habitEl.className = 'log-habit'; habitEl.innerHTML = `<span class="log-habit-status">${habitStatus ? '✅' : '❌'}</span> <span>${habitText}</span>`; li.appendChild(habitEl); } }); historyLogList.appendChild(li); }); } historyPageInfo.textContent = `Page ${historyCurrentPage} of ${historyTotalPages || 1}`; historyPrevBtn.disabled = historyCurrentPage <= 1; historyNextBtn.disabled = historyCurrentPage >= historyTotalPages;
    }

    // *** NEW: Render Reflection View ***
    function renderReflectionView() {
        if (!reflectionListContainer) return;
        reflectionListContainer.innerHTML = ''; // Clear previous items

        reflectionQuestions.forEach(question => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'reflection-item card';
            itemDiv.dataset.questionId = question.id;

            const questionText = document.createElement('p');
            questionText.className = 'question-text';
            questionText.textContent = question.text;

            const answerTextarea = document.createElement('textarea');
            answerTextarea.rows = 4;
            answerTextarea.placeholder = 'Your thoughts...';
            answerTextarea.dataset.questionId = question.id; // Link textarea to question
            answerTextarea.readOnly = true; // Start as read-only
            answerTextarea.value = appData.reflections[question.id] || ''; // Load saved answer

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'reflection-actions';

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.className = 'edit-reflection-btn secondary-button';
            editBtn.dataset.questionId = question.id;

            const saveBtn = document.createElement('button');
            saveBtn.textContent = 'Save';
            saveBtn.className = 'save-reflection-btn'; // Primary style
            saveBtn.dataset.questionId = question.id;
            saveBtn.style.display = 'none'; // Hidden initially

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete-reflection-btn danger-button';
            deleteBtn.dataset.questionId = question.id;
            // Hide delete button if there's no answer yet
            deleteBtn.style.display = appData.reflections[question.id] ? 'inline-block' : 'none';

            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(saveBtn);
            actionsDiv.appendChild(deleteBtn);

            itemDiv.appendChild(questionText);
            itemDiv.appendChild(answerTextarea);
            itemDiv.appendChild(actionsDiv);

            reflectionListContainer.appendChild(itemDiv);
        });
    }


    function renderQuotesView() { displayRandomQuote(); }
    function displayRandomQuote() { /* (Same) */
         let r; if (quotes.length > 1) { do { r = Math.floor(Math.random() * quotes.length); } while (r === currentQuoteIndex); } else { r = 0; } currentQuoteIndex = r; const q = quotes[r]; quoteTextElement.textContent = q.text; quoteAuthorElement.textContent = q.author || "Unknown";
    }
    function renderSettingsView() { themeToggleCheckbox.checked = body.classList.contains('dark-theme'); }


    // --- Action Handlers ---
    function handleAddDreamClick() { /* (Same) */ currentDreamId = null; navigateTo('plan-view', { editMode: false }); }
    function handleDreamCardClick(event) { /* (Same) */ const card = event.target.closest('.dream-card'); if (card?.dataset.dreamId) { currentDreamId = card.dataset.dreamId; navigateTo('dream-detail-view'); } }
    function handleEditDreamClick() { /* (Same) */ if (currentDreamId) { navigateTo('plan-view', { editMode: true }); } else { console.error("No current dream selected."); navigateTo('dashboard-view'); } }
    function handleCancelPlan() { /* (Same) */ if (editingDreamIdInput.value) { navigateTo('dream-detail-view'); } else { navigateTo('dashboard-view'); } }

    function handlePlanFormSubmit(event) { /* (Same) */
        event.preventDefault(); const editingId = editingDreamIdInput.value; const isEditing = !!editingId; const habitInputs = habitsInputContainer.querySelectorAll('.habit-input'); const newHabitTexts = Array.from(habitInputs).map(input => input.value.trim()).filter(text => text !== ''); if (newHabitTexts.length < 3) { alert("Min 3 habits."); return; } let targetDream, habitsChanged = false, existingHabits = []; if (isEditing) { targetDream = getDreamById(editingId); if (!targetDream) { navigateTo('dashboard-view'); return; } existingHabits = targetDream.smartGoal?.habits || []; habitsChanged = existingHabits.length !== newHabitTexts.length || !existingHabits.every((o, i) => newHabitTexts[i] && o.text === newHabitTexts[i]); } else { targetDream = { id: generateUUID(), dreamText: '', smartGoal: { id: generateUUID(), text: '', deadline: '', habits: [], log: {} } }; habitsChanged = true; } const newHabits = newHabitTexts.map(text => ({ id: generateUUID(), text: text })); targetDream.dreamText = dreamInput.value.trim(); targetDream.smartGoal.text = smartGoalInput.value.trim(); targetDream.smartGoal.deadline = goalDeadlineInput.value; targetDream.smartGoal.habits = newHabits; if (!targetDream.smartGoal.log) targetDream.smartGoal.log = {}; if (habitsChanged && Object.keys(targetDream.smartGoal.log).length > 0) { console.warn("Habits changed, resetting log."); targetDream.smartGoal.log = {}; } if (isEditing) { const index = appData.dreams.findIndex(d => d.id === editingId); if (index > -1) appData.dreams[index] = targetDream; } else { appData.dreams.push(targetDream); } saveData(); navigateTo('dashboard-view');
    }
    function handleDeleteDream() { /* (Same) */
        const id = editingDreamIdInput.value; if (!id) return; const dream = getDreamById(id); if (!dream) return; if (confirm(`Delete "${dream.dreamText}"?`)) { appData.dreams = appData.dreams.filter(d => d.id !== id); saveData(); currentDreamId = null; navigateTo('dashboard-view'); }
    }

    function handleHabitCheck(event) { /* (Same) */
        const checkbox = event.target; if (!checkbox || checkbox.type !== 'checkbox' || !currentDreamId) return; const habitId = checkbox.dataset.habitId; const isChecked = checkbox.checked; const todayStr = getTodayDateString(); const dream = getDreamById(currentDreamId); if (!dream?.smartGoal) return; if (!dream.smartGoal.log[todayStr]) dream.smartGoal.log[todayStr] = {}; dream.smartGoal.log[todayStr][habitId] = isChecked; saveData(); updateConsistencyProgress(dream.smartGoal.habits, dream.smartGoal.log, detailConsistencyProgress, detailConsistencyPercentage); if (isChecked) triggerSmartGoalProminence();
    }

    function handleDailyNoteInput() { /* (Same) */
        if(!currentDreamId) return; const dream = getDreamById(currentDreamId); if (!dream?.smartGoal) return; const todayStr = getTodayDateString(); const noteText = dailyNoteInput.value; if (!dream.smartGoal.log[todayStr]) { dream.smartGoal.log[todayStr] = {}; } if (noteText.trim()) { dream.smartGoal.log[todayStr][NOTE_KEY] = noteText.trim(); } else { delete dream.smartGoal.log[todayStr][NOTE_KEY]; if (Object.keys(dream.smartGoal.log[todayStr]).length === 0) { delete dream.smartGoal.log[todayStr]; } } saveData();
     }

    function triggerSmartGoalProminence() { /* (Same) */
        if (!detailSmartGoalText) return; if (prominenceTimeout) { clearTimeout(prominenceTimeout); detailSmartGoalText.classList.remove('goal-boosted'); } detailSmartGoalText.classList.add('goal-boosted'); prominenceTimeout = setTimeout(() => { detailSmartGoalText.classList.remove('goal-boosted'); prominenceTimeout = null; }, 1200);
    }

    function handleHistoryPrev() { /* (Same) */ if (historyCurrentPage > 1) { historyCurrentPage--; renderHistoryPage(); } }
    function handleHistoryNext() { /* (Same) */ if (historyCurrentPage < historyTotalPages) { historyCurrentPage++; renderHistoryPage(); } }

    // *** NEW: Reflection Action Handlers ***
    function handleReflectionActionClick(event) {
        const button = event.target.closest('button');
        if (!button) return; // Exit if click wasn't on a button

        const questionId = button.dataset.questionId;
        if (!questionId) return; // Exit if button has no question ID

        const itemDiv = button.closest('.reflection-item');
        if (!itemDiv) return; // Exit if button isn't in an item

        const textarea = itemDiv.querySelector(`textarea[data-question-id="${questionId}"]`);
        const editBtn = itemDiv.querySelector(`.edit-reflection-btn[data-question-id="${questionId}"]`);
        const saveBtn = itemDiv.querySelector(`.save-reflection-btn[data-question-id="${questionId}"]`);
        const deleteBtn = itemDiv.querySelector(`.delete-reflection-btn[data-question-id="${questionId}"]`);

        if (!textarea || !editBtn || !saveBtn || !deleteBtn) return; // Safety check

        if (button.classList.contains('edit-reflection-btn')) {
            textarea.readOnly = false;
            textarea.focus();
            // Move cursor to end
            textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
            editBtn.style.display = 'none';
            saveBtn.style.display = 'inline-block';
            deleteBtn.style.display = 'none'; // Hide delete while editing
        } else if (button.classList.contains('save-reflection-btn')) {
            const answer = textarea.value.trim();
            appData.reflections[questionId] = answer; // Save or update
            saveData();
            textarea.readOnly = true;
            editBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
            // Show delete button only if there's an answer saved now
            deleteBtn.style.display = answer ? 'inline-block' : 'none';
        } else if (button.classList.contains('delete-reflection-btn')) {
            if (confirm("Are you sure you want to delete this reflection answer?")) {
                delete appData.reflections[questionId]; // Remove from data
                saveData();
                textarea.value = ''; // Clear the textarea
                deleteBtn.style.display = 'none'; // Hide delete button
                // Optionally, switch back to edit mode if needed, or just leave it read-only empty
                // editBtn.style.display = 'inline-block';
                // saveBtn.style.display = 'none';
                // textarea.readOnly = true;
            }
        }
    }

    function handleResetData() {
        if (confirm("WARNING: This will delete ALL your dreams, reflections, and progress permanently. Are you absolutely sure?")) {
            localStorage.removeItem(STORAGE_KEY);
            appData = JSON.parse(JSON.stringify(defaultData)); // Reset in-memory state
            currentDreamId = null; // Clear context
            historyCurrentPage = 1;
            if (habitChartInstance) { habitChartInstance.destroy(); habitChartInstance = null; }
            navigateTo('dashboard-view', { forceNoId: true }); // Re-render dashboard
        }
    }

    // --- Utilities ---
    function getISODateString(date) { /* (Same) */ const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, '0'); const d = String(date.getDate()).padStart(2, '0'); return `${y}-${m}-${d}`; }
    function getTodayDateString() { /* (Same) */ return getISODateString(new Date()); }
    function debounce(func, wait) { /* (Same) */ let timeout; return function executedFunction(...args) { const later = () => { clearTimeout(timeout); func.apply(this, args); }; clearTimeout(timeout); timeout = setTimeout(later, wait); }; };

    // --- Run ---
    init();
});
