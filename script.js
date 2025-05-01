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
    const detailMetricsSection = document.getElementById('metrics-charts-section'); // Placeholder
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

    // Quotes View Elements
    const quoteTextElement = document.getElementById('quote-text');
    const quoteAuthorElement = document.getElementById('quote-author');
    const nextQuoteBtn = document.getElementById('next-quote-btn');

    // Settings View Elements
    const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
    const resetDataBtn = document.getElementById('reset-data-btn');

    // --- State & Data ---
    const STORAGE_KEY = 'ascentAppData_v2'; // Updated key for new structure
    const THEME_KEY = 'ascentAppTheme';
    const CONSISTENCY_DAYS = 7;

    const defaultData = {
        dreams: [], // Array of dream objects
        settings: {
            consistencyPeriodDays: CONSISTENCY_DAYS
        }
    };

    let appData = loadData();
    let currentView = 'dashboard-view'; // Default starting view ID
    let currentDreamId = null; // ID of the dream being viewed/edited
    let prominenceTimeout = null;

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
    let currentQuoteIndex = -1; // To avoid showing the same quote twice in a row

    // --- Initialization ---
    function init() {
        loadTheme();
        setupEventListeners();
        navigateTo(currentView); // Initial render based on default view
    }

    function setupEventListeners() {
        // Bottom Navigation
        bottomNav.addEventListener('click', handleNavClick);

        // Dashboard Actions
        addDreamBtn.addEventListener('click', handleAddDreamClick);
        dreamCardsContainer.addEventListener('click', handleDreamCardClick); // Event delegation

        // Dream Detail Actions
        backToDashboardBtn.addEventListener('click', () => navigateTo('dashboard-view'));
        editSelectedDreamBtn.addEventListener('click', handleEditDreamClick);
        detailHabitsList.addEventListener('change', handleHabitCheck); // Event delegation for checkboxes

        // Plan View Actions
        goalForm.addEventListener('submit', handlePlanFormSubmit);
        addHabitInputBtn.addEventListener('click', handleAddHabitInput);
        habitsInputContainer.addEventListener('click', handleRemoveHabitInput); // Event delegation
        deleteDreamBtn.addEventListener('click', handleDeleteDream);
        cancelPlanBtn.addEventListener('click', () => navigateTo('dashboard-view')); // Always cancel back to dashboard

        // Quotes Actions
        nextQuoteBtn.addEventListener('click', displayRandomQuote);

        // Settings Actions
        themeToggleCheckbox.addEventListener('change', handleThemeToggle);
        resetDataBtn.addEventListener('click', handleResetData);
    }

    // --- Data Persistence ---
    function loadData() {
        const storedData = localStorage.getItem(STORAGE_KEY);
        try {
            if (storedData) {
                // Basic merge/validation could happen here if needed
                const parsed = JSON.parse(storedData);
                // Ensure essential structure exists
                if (!parsed.dreams) parsed.dreams = [];
                if (!parsed.settings) parsed.settings = defaultData.settings;
                return parsed;
            }
        } catch (error) {
            console.error("Error parsing localStorage data:", error);
        }
        // Return a deep copy of default data if nothing stored or parsing failed
        return JSON.parse(JSON.stringify(defaultData));
    }

    function saveData() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
        } catch (error) {
            console.error("Error saving data to localStorage:", error);
            alert("Could not save progress. Local Storage might be full or disabled.");
        }
    }

    function getDreamById(dreamId) {
        return appData.dreams.find(dream => dream.id === dreamId);
    }

    // Simple UUID generator
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // --- Theme Management ---
    function loadTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY) || 'light-theme';
        setTheme(savedTheme, false); // Apply theme without saving again
    }

    function setTheme(themeName, save = true) {
        body.className = themeName; // Remove old classes, add new one
        themeToggleCheckbox.checked = (themeName === 'dark-theme');
        if (save) {
            localStorage.setItem(THEME_KEY, themeName);
        }
    }

    function handleThemeToggle() {
        const newTheme = themeToggleCheckbox.checked ? 'dark-theme' : 'light-theme';
        setTheme(newTheme);
    }

    // --- View Management ---
    function showView(viewId) {
        views.forEach(view => {
            view.classList.remove('active');
            if (view.id === viewId) {
                view.classList.add('active');
            }
        });
        currentView = viewId;
        // Scroll to top when changing views (good UX for mobile)
        mainContent.scrollTop = 0;
        // Optional: Update header title dynamically
        // const titleElement = document.getElementById('current-view-title');
        // if(titleElement) titleElement.textContent = document.querySelector(`.nav-btn[data-view="${viewId}"] .nav-text`)?.textContent || 'Ascent';
    }

    function updateActiveNavButton(viewId) {
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === viewId) {
                btn.classList.add('active');
            }
        });
    }

    function navigateTo(viewId) {
        // Render necessary content BEFORE showing the view
        switch (viewId) {
            case 'dashboard-view':
                renderDashboard();
                break;
            case 'dream-detail-view':
                if (!currentDreamId) { // Safety check if navigated here improperly
                   console.error("Cannot navigate to detail view without a currentDreamId");
                   navigateTo('dashboard-view'); // Go back
                   return;
                }
                renderDreamDetail(currentDreamId);
                break;
            case 'plan-view':
                // RenderPlanView now handles Add/Edit mode based on currentDreamId
                renderPlanView(currentDreamId);
                break;
            case 'quotes-view':
                renderQuotesView();
                break;
            case 'settings-view':
                renderSettingsView();
                break;
        }

        showView(viewId);
        updateActiveNavButton(viewId); // Keep nav sync'd even if not clicked via nav
    }

    function handleNavClick(event) {
        const targetButton = event.target.closest('.nav-btn');
        if (targetButton && targetButton.dataset.view) {
            const targetViewId = targetButton.dataset.view;
            // Reset context if navigating away from detail/plan view
            if (currentView === 'dream-detail-view' || currentView === 'plan-view') {
                if (targetViewId !== 'dream-detail-view' && targetViewId !== 'plan-view') {
                    currentDreamId = null; // Clear context if going to Dashboard/Quotes/Settings
                }
            }
            navigateTo(targetViewId);
        }
    }

    // --- Rendering Functions ---

    function renderDashboard() {
        dreamCardsContainer.innerHTML = ''; // Clear existing cards
        if (appData.dreams.length === 0) {
            noDreamsMessage.style.display = 'block';
        } else {
            noDreamsMessage.style.display = 'none';
            appData.dreams.forEach(dream => {
                const card = createDreamCard(dream);
                dreamCardsContainer.appendChild(card);
            });
        }
    }

    function createDreamCard(dream) {
        const card = document.createElement('div');
        card.className = 'dream-card';
        card.dataset.dreamId = dream.id;

        const title = document.createElement('h3');
        title.textContent = dream.dreamText;

        const goalSummary = document.createElement('p');
        goalSummary.className = 'goal-summary';
        goalSummary.textContent = dream.smartGoal?.text || 'No goal set';

        const metricDiv = document.createElement('div');
        metricDiv.className = 'card-metric';

        const metricLabel = document.createElement('label');
        metricLabel.textContent = `Consistency (${CONSISTENCY_DAYS}d):`;

        const metricValueSpan = document.createElement('span');
        const metricProgress = document.createElement('progress');
        metricProgress.max = 100;

        // Calculate consistency for this specific dream card
        const consistency = calculateConsistency(dream.smartGoal?.habits || [], dream.smartGoal?.log || {});
        metricValueSpan.textContent = `${consistency.percentage}%`;
        metricProgress.value = consistency.percentage;

        metricDiv.appendChild(metricLabel);
        metricDiv.appendChild(metricValueSpan);
        metricDiv.appendChild(metricProgress);

        card.appendChild(title);
        card.appendChild(goalSummary);
        card.appendChild(metricDiv);

        return card;
    }

    function renderDreamDetail(dreamId) {
        const dream = getDreamById(dreamId);
        if (!dream) {
            console.error(`Dream with ID ${dreamId} not found.`);
            navigateTo('dashboard-view'); // Go back if dream doesn't exist
            return;
        }

        detailHeaderTitle.textContent = dream.dreamText || "Dream Details"; // Dynamic title
        detailDreamText.textContent = dream.dreamText || '[No Dream Text]';
        detailSmartGoalText.textContent = dream.smartGoal?.text || '[No SMART Goal Set]';
        detailSmartGoalText.classList.remove('goal-boosted'); // Reset boost on render

        // Format deadline display
        if (dream.smartGoal?.deadline) {
            try {
                const deadlineDate = new Date(dream.smartGoal.deadline + 'T00:00:00');
                detailGoalDeadlineDisplay.textContent = `Target: ${deadlineDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`;
                detailGoalDeadlineDisplay.style.display = 'block';
            } catch(e) {
                detailGoalDeadlineDisplay.textContent = `Target: ${dream.smartGoal.deadline}`; // Fallback
                detailGoalDeadlineDisplay.style.display = 'block';
            }
        } else {
            detailGoalDeadlineDisplay.style.display = 'none';
        }

        renderHabitList(dream.smartGoal?.habits || [], dream.smartGoal?.log || {}, detailHabitsList);
        const consistency = updateConsistencyProgress(dream.smartGoal?.habits || [], dream.smartGoal?.log || {}, detailConsistencyProgress, detailConsistencyPercentage);

        // --- Metrics/Charts Placeholder ---
        detailMetricsSection.innerHTML = '<h3>Progress Insights</h3>'; // Clear previous
        const metricsPlaceholder = document.createElement('p');
        metricsPlaceholder.textContent = `Overall consistency (${CONSISTENCY_DAYS}d): ${consistency.percentage}%. More charts coming soon!`;
        detailMetricsSection.appendChild(metricsPlaceholder);
        // TODO: Add actual chart rendering logic here using a library like Chart.js
        // renderCharts(dream.smartGoal?.log || {}, dream.smartGoal?.habits || {});
    }

    // Modified renderHabitList to take habits, log, and target list element
    function renderHabitList(habits, log, targetListElement) {
        targetListElement.innerHTML = ''; // Clear previous list
        const todayStr = getTodayDateString();
        const todaysLog = log[todayStr] || {};

        if (!habits || habits.length === 0) {
            targetListElement.innerHTML = '<li class="text-muted" style="text-align: center; padding: 10px;">No habits defined for this goal.</li>';
            return;
        }

        habits.forEach(habit => {
            const li = document.createElement('li');
            li.className = 'habit-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `habit-checkbox-${habit.id}`; // Ensure unique ID for label 'for'
            checkbox.dataset.habitId = habit.id; // Store habit ID
            checkbox.checked = todaysLog[habit.id] === true;

            const label = document.createElement('label');
            label.htmlFor = `habit-checkbox-${habit.id}`;
            label.textContent = habit.text;

            li.appendChild(checkbox);
            li.appendChild(label);
            targetListElement.appendChild(li);
        });
    }

    // Modified updateConsistencyProgress to be more generic
    function calculateConsistency(habits, log) {
        let totalPossible = 0;
        let totalCompleted = 0;
        const endDate = new Date();

        if (!habits || habits.length === 0) {
            return { percentage: 0, completed: 0, possible: 0 };
        }

        for (let i = 0; i < CONSISTENCY_DAYS; i++) {
            const date = new Date(endDate);
            date.setDate(endDate.getDate() - i);
            const dateStr = getISODateString(date);

            const dailyLog = log[dateStr] || {};
            totalPossible += habits.length;

            habits.forEach(habit => {
                if (dailyLog[habit.id] === true) {
                    totalCompleted++;
                }
            });
        }
        const percentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
        return { percentage, completed: totalCompleted, possible: totalPossible };
    }

    // Update progress UI elements
    function updateConsistencyProgress(habits, log, progressElement, percentageElement) {
        const consistency = calculateConsistency(habits, log);
        if (progressElement) {
            progressElement.value = consistency.percentage;
        }
        if (percentageElement) {
            percentageElement.textContent = `${consistency.percentage}%`;
        }
        return consistency; // Return calculated values
    }


    function renderPlanView(dreamId = null) {
        currentDreamId = dreamId; // Set context for saving/deleting
        populatePlanForm(dreamId); // Populate based on Add or Edit mode

        // Adjust title and delete button visibility
        if (dreamId) {
            planHeaderTitle.textContent = "Edit Your Ascent";
            savePlanBtn.textContent = "Update Plan";
            deleteDreamBtn.style.display = 'block'; // Show delete btn only when editing
        } else {
            planHeaderTitle.textContent = "Plan Your Ascent";
            savePlanBtn.textContent = "Save Plan";
            deleteDreamBtn.style.display = 'none'; // Hide delete btn when adding
        }
    }

    function populatePlanForm(dreamId) {
        const dream = dreamId ? getDreamById(dreamId) : null;

        editingDreamIdInput.value = dreamId || ''; // Set hidden input
        dreamInput.value = dream?.dreamText || '';
        smartGoalInput.value = dream?.smartGoal?.text || '';
        goalDeadlineInput.value = dream?.smartGoal?.deadline || '';

        // Clear and populate habits
        habitsInputContainer.innerHTML = '';
        const habits = dream?.smartGoal?.habits || [];
        const habitsToDisplay = habits.length > 0 ? habits : [{ id: '', text: '' }, { id: '', text: '' }, { id: '', text: '' }]; // Start with 3 blanks if empty

        habitsToDisplay.forEach((habit, index) => {
            createHabitInputElement(habit.text || '', index);
        });
        updateRemoveButtonsVisibility();
    }

    function createHabitInputElement(value = '', index) {
        const div = document.createElement('div');
        div.className = 'habit-input-group';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'habit-input';
        input.placeholder = `Habit ${index + 1}`;
        input.value = value;
        input.required = true;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-habit-btn';
        removeBtn.title = 'Remove habit';
        removeBtn.innerHTML = '×';

        div.appendChild(input);
        div.appendChild(removeBtn);
        habitsInputContainer.appendChild(div);
    }

    function handleAddHabitInput() {
        const habitInputs = habitsInputContainer.querySelectorAll('.habit-input-group');
        createHabitInputElement('', habitInputs.length);
        updateRemoveButtonsVisibility();
    }

    function handleRemoveHabitInput(event) {
        if (event.target.classList.contains('remove-habit-btn')) {
            const habitInputs = habitsInputContainer.querySelectorAll('.habit-input-group');
            if (habitInputs.length > 3) {
                event.target.closest('.habit-input-group').remove();
                updateRemoveButtonsVisibility();
            } else {
                alert("Minimum of 3 habits required.");
            }
        }
    }

     function updateRemoveButtonsVisibility() {
        const habitGroups = habitsInputContainer.querySelectorAll('.habit-input-group');
        const showRemove = habitGroups.length > 3;
        habitGroups.forEach(group => {
            const btn = group.querySelector('.remove-habit-btn');
            if (btn) {
                btn.style.display = showRemove ? 'inline-block' : 'none';
            }
        });
    }

    function renderQuotesView() {
        displayRandomQuote();
    }

    function displayRandomQuote() {
        let randomIndex;
        // Ensure we don't show the same quote twice in a row if possible
        if (quotes.length > 1) {
            do {
                randomIndex = Math.floor(Math.random() * quotes.length);
            } while (randomIndex === currentQuoteIndex);
        } else {
            randomIndex = 0; // Only one quote available
        }

        currentQuoteIndex = randomIndex;
        const quote = quotes[randomIndex];

        quoteTextElement.textContent = quote.text;
        quoteAuthorElement.textContent = quote.author || "Unknown";
    }


    function renderSettingsView() {
        // Ensure theme toggle reflects current state (already done by loadTheme/setTheme)
        themeToggleCheckbox.checked = body.classList.contains('dark-theme');
    }


    // --- Action Handlers ---

    function handleAddDreamClick() {
        currentDreamId = null; // Ensure we are in "Add" mode
        navigateTo('plan-view');
    }

    function handleDreamCardClick(event) {
        const targetCard = event.target.closest('.dream-card');
        if (targetCard && targetCard.dataset.dreamId) {
            currentDreamId = targetCard.dataset.dreamId; // Set context
            navigateTo('dream-detail-view');
        }
    }

     function handleEditDreamClick() {
         if (currentDreamId) {
            navigateTo('plan-view'); // Will use currentDreamId to populate
         } else {
             console.error("No current dream selected to edit.");
             navigateTo('dashboard-view'); // Go back to safety
         }
     }

    function handlePlanFormSubmit(event) {
        event.preventDefault();
        const editingId = editingDreamIdInput.value; // Get ID from hidden input
        const isEditing = !!editingId;

        const habitInputs = habitsInputContainer.querySelectorAll('.habit-input');
        const newHabitTexts = Array.from(habitInputs)
            .map(input => input.value.trim())
            .filter(text => text !== '');

        if (newHabitTexts.length < 3) {
            alert("Please define at least 3 specific habits.");
            return;
        }

        let targetDream;
        let habitsChanged = false;
        let existingHabits = [];

        if (isEditing) {
            targetDream = getDreamById(editingId);
            if (!targetDream) {
                 console.error("Dream to edit not found!");
                 navigateTo('dashboard-view');
                 return;
            }
            existingHabits = targetDream.smartGoal?.habits || [];
            // Simple habit change check: count or any text mismatch
            habitsChanged = existingHabits.length !== newHabitTexts.length ||
                           !existingHabits.every((oldHabit, i) => newHabitTexts[i] && oldHabit.text === newHabitTexts[i]);
        } else {
            // Adding new dream - create base structure
            targetDream = {
                id: generateUUID(),
                dreamText: '', // Will be filled below
                smartGoal: {
                    id: generateUUID(), // Goal also gets an ID
                    text: '',
                    deadline: '',
                    habits: [],
                    log: {}
                }
                // createdAt: new Date().toISOString() // Optional timestamp
            };
            habitsChanged = true; // Always true for new dreams
        }

        // Create new habit objects with new IDs
        const newHabits = newHabitTexts.map(text => ({
            id: generateUUID(), // Always generate new ID for simplicity client-side
            text: text
        }));

        // Update targetDream object
        targetDream.dreamText = dreamInput.value.trim();
        targetDream.smartGoal.text = smartGoalInput.value.trim();
        targetDream.smartGoal.deadline = goalDeadlineInput.value; // Store as YYYY-MM-DD
        targetDream.smartGoal.habits = newHabits;

        // Reset log if habits changed significantly
        if (habitsChanged && targetDream.smartGoal.log && Object.keys(targetDream.smartGoal.log).length > 0) {
            console.warn("Habits changed, resetting log for this goal.");
            targetDream.smartGoal.log = {};
        } else if (!targetDream.smartGoal.log) {
             targetDream.smartGoal.log = {}; // Ensure log exists
        }

        if (isEditing) {
            // Find index and update in array (or could use map)
            const index = appData.dreams.findIndex(d => d.id === editingId);
            if (index > -1) {
                appData.dreams[index] = targetDream;
            }
        } else {
            // Add new dream to the array
            appData.dreams.push(targetDream);
        }

        saveData();
        // Navigate back to dashboard after saving
        navigateTo('dashboard-view');
    }


    function handleDeleteDream() {
        const dreamIdToDelete = editingDreamIdInput.value;
        if (!dreamIdToDelete) return; // Should not happen if button is only visible when editing

        const dream = getDreamById(dreamIdToDelete);
        if (!dream) return;

        if (confirm(`Are you sure you want to delete the dream "${dream.dreamText}"? This cannot be undone.`)) {
            appData.dreams = appData.dreams.filter(d => d.id !== dreamIdToDelete);
            saveData();
            currentDreamId = null; // Clear context
            navigateTo('dashboard-view'); // Go back to dashboard
        }
    }


    function handleHabitCheck(event) {
        const checkbox = event.target;
        if (!checkbox || checkbox.type !== 'checkbox') return; // Basic check

        const habitId = checkbox.dataset.habitId;
        const isChecked = checkbox.checked;
        const todayStr = getTodayDateString();

        // Get the current dream being viewed
        const dream = getDreamById(currentDreamId);
        if (!dream || !dream.smartGoal) {
            console.error("Cannot log habit: current dream or goal not found.");
            return; // Safety check
        }

        // Ensure log entry for today exists
        if (!dream.smartGoal.log[todayStr]) {
            dream.smartGoal.log[todayStr] = {};
        }

        // Update the log
        dream.smartGoal.log[todayStr][habitId] = isChecked;

        saveData(); // Persist the change

        // Provide feedback - update progress bar and trigger prominence
        updateConsistencyProgress(dream.smartGoal.habits, dream.smartGoal.log, detailConsistencyProgress, detailConsistencyPercentage);
        if (isChecked) {
            triggerSmartGoalProminence();
        }
    }

    function triggerSmartGoalProminence() {
        if (!detailSmartGoalText) return;

        if (prominenceTimeout) {
            clearTimeout(prominenceTimeout);
            detailSmartGoalText.classList.remove('goal-boosted');
        }

        detailSmartGoalText.classList.add('goal-boosted');

        prominenceTimeout = setTimeout(() => {
            detailSmartGoalText.classList.remove('goal-boosted');
            prominenceTimeout = null;
        }, 1200); // Boost lasts 1.2 seconds
    }


    function handleResetData() {
        if (confirm("WARNING: This will delete ALL your dreams and progress permanently. Are you absolutely sure?")) {
            localStorage.removeItem(STORAGE_KEY);
            appData = JSON.parse(JSON.stringify(defaultData)); // Reset in-memory state
            currentDreamId = null; // Clear context
            navigateTo('dashboard-view'); // Re-render dashboard (will show empty state)
        }
    }

    // --- Utilities ---
    function getISODateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function getTodayDateString() {
        return getISODateString(new Date());
    }

    // --- Run ---
    init();
});
