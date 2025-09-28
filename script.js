// TASK QUEST - Retro Game Todo App
class TaskQuestGame {
    constructor() {
        this.quests = this.loadQuests();
        this.playerStats = this.loadPlayerStats();
        this.achievements = this.loadAchievements();
        this.currentFilter = 'all';
        this.currentCategory = 'all';
        this.nextId = this.getNextId();
        this.soundEnabled = this.loadSoundSettings().sound;
        this.musicEnabled = this.loadSoundSettings().music;
        this.alerts = [];
        
        this.initializeElements();
        this.bindEvents();
        this.initializeTheme();
        this.initializeTime();
        this.initializeAlerts();
        this.render();
        this.updatePlayerStats();
        this.checkAchievements();
        this.startAlertChecker();
    }

    initializeElements() {
        this.questInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.questList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.todoCount = document.getElementById('todoCount');
        this.streakCount = document.getElementById('streakCount');
        this.overdueCount = document.getElementById('overdueCount');
        this.filterBtns = document.querySelectorAll('.quest-filter-btn');
        this.categoryBtns = document.querySelectorAll('.quest-category-btn');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.exportBtn = document.getElementById('exportBtn');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.categorySelect = document.getElementById('categorySelect');
        
        // Deadline elements
        this.deadlineDate = document.getElementById('deadlineDate');
        this.deadlineTime = document.getElementById('deadlineTime');
        this.clearDeadlineBtn = document.getElementById('clearDeadline');
        
        // Time elements
        this.mumbaiTime = document.getElementById('mumbaiTime');
        this.mumbaiDate = document.getElementById('mumbaiDate');
        
        // Game HUD elements
        this.playerLevel = document.getElementById('playerLevel');
        this.playerXP = document.getElementById('playerXP');
        this.playerStreak = document.getElementById('playerStreak');
        this.playerScore = document.getElementById('playerScore');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        
        // Theme elements
        this.themeBtns = document.querySelectorAll('.game-theme-btn');
        
        // Notification elements
        this.achievementNotification = document.getElementById('achievementNotification');
        this.levelUpNotification = document.getElementById('levelUpNotification');
        this.deadlineAlert = document.getElementById('deadlineAlert');
        
        // Alert elements
        this.alertsSection = document.getElementById('alertsSection');
        this.alertsList = document.getElementById('alertsList');
        this.dismissAllAlertsBtn = document.getElementById('dismissAllAlerts');
        
        // Sound elements
        this.soundToggleBtn = document.getElementById('soundToggle');
        this.musicToggleBtn = document.getElementById('musicToggle');
    }

    bindEvents() {
        // Add quest events
        this.addBtn.addEventListener('click', () => this.addQuest());
        this.questInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addQuest();
            }
        });

        // Filter events
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        this.categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setCategory(e.target.dataset.category);
            });
        });

        // Action events
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.exportBtn.addEventListener('click', () => this.exportGame());

        // Deadline events
        this.clearDeadlineBtn.addEventListener('click', () => this.clearDeadline());

        // Alert events
        this.dismissAllAlertsBtn.addEventListener('click', () => this.dismissAllAlerts());

        // Sound events
        this.soundToggleBtn.addEventListener('click', () => this.toggleSound());
        this.musicToggleBtn.addEventListener('click', () => this.toggleMusic());

        // Theme events
        this.themeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setTheme(e.target.dataset.theme);
            });
        });

        // Input focus effects
        this.questInput.addEventListener('focus', () => {
            this.questInput.parentElement.style.transform = 'scale(1.02)';
        });

        this.questInput.addEventListener('blur', () => {
            this.questInput.parentElement.style.transform = 'scale(1)';
        });
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('gameTheme') || 'arcade';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        
        // Update active theme button
        this.themeBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            }
        });
        
        localStorage.setItem('gameTheme', theme);
        this.playSound('theme-change');
    }

    addQuest() {
        const text = this.questInput.value.trim();
        if (!text) {
            this.showInputError();
            return;
        }

        const deadline = this.getDeadline();
        const quest = {
            id: this.nextId++,
            text: text,
            completed: false,
            priority: this.prioritySelect.value,
            category: this.categorySelect.value,
            createdAt: new Date().toISOString(),
            deadline: deadline,
            xpValue: this.getXPValue(this.prioritySelect.value)
        };

        this.quests.unshift(quest);
        this.saveQuests();
        this.render();
        this.questInput.value = '';
        this.clearDeadline();
        this.questInput.focus();
        this.playSound('quest-accepted');

        // Add animation to new quest
        setTimeout(() => {
            const newQuestElement = this.questList.querySelector('.quest-item');
            if (newQuestElement) {
                newQuestElement.classList.add('adding');
            }
        }, 10);
    }

    getDeadline() {
        const date = this.deadlineDate.value;
        const time = this.deadlineTime.value;
        
        if (!date) return null;
        
        const dateTime = time ? `${date}T${time}` : `${date}T23:59`;
        return new Date(dateTime).toISOString();
    }

    clearDeadline() {
        this.deadlineDate.value = '';
        this.deadlineTime.value = '';
    }

    getXPValue(priority) {
        const xpValues = {
            'easy': 10,
            'medium': 25,
            'hard': 50,
            'boss': 100
        };
        return xpValues[priority] || 25;
    }

    showInputError() {
        this.questInput.style.borderColor = 'var(--danger-color)';
        this.questInput.style.animation = 'shake 0.5s ease-in-out';
        this.playSound('error');
        
        setTimeout(() => {
            this.questInput.style.borderColor = 'var(--border-color)';
            this.questInput.style.animation = '';
        }, 500);
    }

    toggleQuest(id) {
        const quest = this.quests.find(q => q.id === id);
        if (quest) {
            quest.completed = !quest.completed;
            
            if (quest.completed) {
                this.playerStats.xp += quest.xpValue;
                this.playerStats.score += quest.xpValue * 10;
                this.playerStats.streak++;
                this.playSound('quest-completed');
                this.showXPNotification(quest.xpValue);
            } else {
                this.playerStats.xp = Math.max(0, this.playerStats.xp - quest.xpValue);
                this.playerStats.score = Math.max(0, this.playerStats.score - quest.xpValue * 10);
                this.playerStats.streak = 0;
                this.playSound('quest-uncompleted');
            }
            
            this.saveQuests();
            this.savePlayerStats();
            this.render();
            this.updatePlayerStats();
            this.checkAchievements();
            this.checkLevelUp();
        }
    }

    editQuest(id) {
        const quest = this.quests.find(q => q.id === id);
        if (!quest) return;

        const newText = prompt('Edit quest:', quest.text);
        if (newText !== null && newText.trim() !== '') {
            quest.text = newText.trim();
            this.saveQuests();
            this.render();
            this.playSound('quest-edited');
        }
    }

    deleteQuest(id) {
        const questElement = document.querySelector(`[data-id="${id}"]`);
        if (questElement) {
            questElement.classList.add('removing');
            this.playSound('quest-deleted');
            
            setTimeout(() => {
                this.quests = this.quests.filter(q => q.id !== id);
                this.saveQuests();
                this.render();
                this.updatePlayerStats();
            }, 500);
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        this.render();
        this.playSound('filter-change');
    }

    initializeTime() {
        this.updateMumbaiTime();
        setInterval(() => this.updateMumbaiTime(), 1000);
    }

    updateMumbaiTime() {
        const now = new Date();
        const mumbaiTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
        
        const timeString = mumbaiTime.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const dateString = mumbaiTime.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        this.mumbaiTime.textContent = timeString;
        this.mumbaiDate.textContent = dateString;
    }

    initializeAlerts() {
        this.checkForAlerts();
    }

    startAlertChecker() {
        setInterval(() => {
            this.checkForAlerts();
        }, 60000); // Check every minute
    }

    checkForAlerts() {
        const now = new Date();
        const alerts = [];
        
        this.quests.forEach(quest => {
            if (quest.completed || !quest.deadline) return;
            
            const deadline = new Date(quest.deadline);
            const timeDiff = deadline - now;
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            
            if (timeDiff < 0) {
                // Overdue
                alerts.push({
                    type: 'overdue',
                    quest: quest,
                    message: `Quest "${quest.text}" is overdue!`,
                    time: this.formatTimeAgo(deadline)
                });
            } else if (hoursDiff <= 1) {
                // Due within 1 hour
                alerts.push({
                    type: 'urgent',
                    quest: quest,
                    message: `Quest "${quest.text}" is due in ${Math.round(hoursDiff * 60)} minutes!`,
                    time: this.formatTimeAgo(deadline)
                });
            } else if (hoursDiff <= 24) {
                // Due within 24 hours
                alerts.push({
                    type: 'upcoming',
                    quest: quest,
                    message: `Quest "${quest.text}" is due in ${Math.round(hoursDiff)} hours!`,
                    time: this.formatTimeAgo(deadline)
                });
            }
        });
        
        this.alerts = alerts;
        this.renderAlerts();
        
        // Show urgent alerts as notifications
        const urgentAlerts = alerts.filter(alert => alert.type === 'urgent' || alert.type === 'overdue');
        if (urgentAlerts.length > 0 && this.soundEnabled) {
            this.showDeadlineAlert(urgentAlerts[0]);
        }
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ago`;
        } else {
            return `${minutes}m ago`;
        }
    }

    renderAlerts() {
        if (this.alerts.length === 0) {
            this.alertsSection.style.display = 'none';
            return;
        }
        
        this.alertsSection.style.display = 'block';
        this.alertsList.innerHTML = '';
        
        this.alerts.forEach(alert => {
            const alertElement = document.createElement('div');
            alertElement.className = `alert-item ${alert.type}`;
            
            const icon = alert.type === 'overdue' ? '🚨' : alert.type === 'urgent' ? '⏰' : '⚠️';
            
            alertElement.innerHTML = `
                <div class="alert-icon">${icon}</div>
                <div class="alert-content">
                    <div class="alert-title">${alert.message}</div>
                    <div class="alert-description">Priority: ${alert.quest.priority.toUpperCase()}</div>
                </div>
                <div class="alert-time">${alert.time}</div>
                <button class="dismiss-alert-btn" onclick="taskQuest.dismissAlert(${alert.quest.id})">✕</button>
            `;
            
            this.alertsList.appendChild(alertElement);
        });
    }

    dismissAlert(questId) {
        if (questId) {
            this.alerts = this.alerts.filter(alert => alert.quest.id !== questId);
        } else {
            this.alerts = [];
        }
        this.renderAlerts();
    }

    dismissAllAlerts() {
        this.alerts = [];
        this.renderAlerts();
        this.playSound('clear-completed');
    }

    showDeadlineAlert(alert) {
        const notification = this.deadlineAlert;
        const description = notification.querySelector('.deadline-alert-description');
        
        description.textContent = alert.message;
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
        
        this.playSound('deadline-alert');
    }

    setCategory(category) {
        this.currentCategory = category;
        
        // Update active category button
        this.categoryBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });

        this.render();
        this.playSound('category-change');
    }

    clearCompleted() {
        const completedCount = this.quests.filter(q => q.completed).length;
        if (completedCount === 0) return;

        if (confirm(`Are you sure you want to clear ${completedCount} completed quest(s)?`)) {
            this.quests = this.quests.filter(q => !q.completed);
            this.saveQuests();
            this.render();
            this.updatePlayerStats();
            this.playSound('clear-completed');
        }
    }

    exportGame() {
        const gameData = {
            quests: this.quests,
            playerStats: this.playerStats,
            achievements: this.achievements,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(gameData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `task-quest-save-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.playSound('export');
    }

    getFilteredQuests() {
        let filtered = this.quests;
        
        // Apply status filter
        switch (this.currentFilter) {
            case 'active':
                filtered = filtered.filter(q => !q.completed);
                break;
            case 'completed':
                filtered = filtered.filter(q => q.completed);
                break;
            case 'overdue':
                filtered = filtered.filter(q => !q.completed && q.deadline && new Date(q.deadline) < new Date());
                break;
        }
        
        // Apply category filter
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(q => q.category === this.currentCategory);
        }
        
        return filtered;
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundToggleBtn.classList.toggle('muted', !this.soundEnabled);
        this.saveSoundSettings();
        this.playSound('theme-change');
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        this.musicToggleBtn.classList.toggle('muted', !this.musicEnabled);
        this.saveSoundSettings();
        this.playSound('theme-change');
    }

    saveSoundSettings() {
        localStorage.setItem('taskQuestSoundSettings', JSON.stringify({
            sound: this.soundEnabled,
            music: this.musicEnabled
        }));
    }

    loadSoundSettings() {
        const saved = localStorage.getItem('taskQuestSoundSettings');
        return saved ? JSON.parse(saved) : { sound: true, music: true };
    }

    initializeTouchGestures() {
        let startX, startY, startTime;
        
        // Swipe gestures for quest items
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.quest-item')) {
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
                startTime = Date.now();
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (e.target.closest('.quest-item') && startX !== undefined) {
                const touch = e.changedTouches[0];
                const endX = touch.clientX;
                const endY = touch.clientY;
                const endTime = Date.now();
                
                const deltaX = endX - startX;
                const deltaY = endY - startY;
                const deltaTime = endTime - startTime;
                
                // Swipe right to complete quest
                if (deltaX > 50 && Math.abs(deltaY) < 50 && deltaTime < 500) {
                    const questItem = e.target.closest('.quest-item');
                    const questId = parseInt(questItem.dataset.id);
                    const quest = this.quests.find(q => q.id === questId);
                    
                    if (quest && !quest.completed) {
                        this.toggleQuest(questId);
                        this.showSwipeFeedback('Quest completed!', 'success');
                    }
                }
                
                // Swipe left to delete quest
                if (deltaX < -50 && Math.abs(deltaY) < 50 && deltaTime < 500) {
                    const questItem = e.target.closest('.quest-item');
                    const questId = parseInt(questItem.dataset.id);
                    
                    if (confirm('Delete this quest?')) {
                        this.deleteQuest(questId);
                        this.showSwipeFeedback('Quest deleted!', 'danger');
                    }
                }
                
                startX = startY = startTime = undefined;
            }
        }, { passive: true });
        
        // Long press for quest options
        let longPressTimer;
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.quest-item')) {
                longPressTimer = setTimeout(() => {
                    const questItem = e.target.closest('.quest-item');
                    const questId = parseInt(questItem.dataset.id);
                    this.showQuestOptions(questId);
                }, 500);
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }, { passive: true });
    }

    showSwipeFeedback(message, type) {
        const feedback = document.createElement('div');
        feedback.className = `swipe-feedback ${type}`;
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'};
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            font-family: 'Press Start 2P', monospace;
            font-size: 0.6rem;
            z-index: 2000;
            animation: swipeFeedback 2s ease-out forwards;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 2000);
    }

    showQuestOptions(questId) {
        const quest = this.quests.find(q => q.id === questId);
        if (!quest) return;
        
        const options = [
            { text: 'Edit Quest', action: () => this.editQuest(questId) },
            { text: 'Delete Quest', action: () => this.deleteQuest(questId) },
            { text: 'Set Priority', action: () => this.showPrioritySelector(questId) }
        ];
        
        const modal = document.createElement('div');
        modal.className = 'quest-options-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: var(--secondary-bg);
            border: 3px solid var(--accent-color);
            border-radius: 15px;
            padding: 20px;
            max-width: 300px;
            width: 90%;
        `;
        
        const title = document.createElement('h3');
        title.textContent = 'Quest Options';
        title.style.cssText = `
            color: var(--accent-color);
            font-family: 'Press Start 2P', monospace;
            font-size: 0.8rem;
            margin-bottom: 15px;
            text-align: center;
        `;
        
        const questText = document.createElement('p');
        questText.textContent = quest.text;
        questText.style.cssText = `
            color: var(--text-primary);
            font-family: 'Press Start 2P', monospace;
            font-size: 0.5rem;
            margin-bottom: 20px;
            text-align: center;
            word-break: break-word;
        `;
        
        content.appendChild(title);
        content.appendChild(questText);
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.text;
            button.style.cssText = `
                width: 100%;
                padding: 10px;
                margin: 5px 0;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                background: var(--secondary-bg);
                color: var(--text-primary);
                font-family: 'Press Start 2P', monospace;
                font-size: 0.4rem;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            button.addEventListener('click', () => {
                option.action();
                modal.remove();
            });
            
            button.addEventListener('mouseenter', () => {
                button.style.borderColor = 'var(--accent-color)';
                button.style.color = 'var(--accent-color)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.borderColor = 'var(--border-color)';
                button.style.color = 'var(--text-primary)';
            });
            
            content.appendChild(button);
        });
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.cssText = `
            width: 100%;
            padding: 10px;
            margin-top: 10px;
            border: 2px solid var(--danger-color);
            border-radius: 8px;
            background: var(--secondary-bg);
            color: var(--danger-color);
            font-family: 'Press Start 2P', monospace;
            font-size: 0.4rem;
            cursor: pointer;
        `;
        
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        content.appendChild(closeBtn);
        modal.appendChild(content);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
    }

    showPrioritySelector(questId) {
        const quest = this.quests.find(q => q.id === questId);
        if (!quest) return;
        
        const priorities = [
            { value: 'easy', label: '🟢 Easy', color: '#51cf66' },
            { value: 'medium', label: '🟡 Medium', color: '#ffd43b' },
            { value: 'hard', label: '🔴 Hard', color: '#ff6b6b' },
            { value: 'boss', label: '⚡ Boss', color: '#667eea' }
        ];
        
        const modal = document.createElement('div');
        modal.className = 'priority-selector-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: var(--secondary-bg);
            border: 3px solid var(--accent-color);
            border-radius: 15px;
            padding: 20px;
            max-width: 300px;
            width: 90%;
        `;
        
        const title = document.createElement('h3');
        title.textContent = 'Select Priority';
        title.style.cssText = `
            color: var(--accent-color);
            font-family: 'Press Start 2P', monospace;
            font-size: 0.8rem;
            margin-bottom: 15px;
            text-align: center;
        `;
        
        content.appendChild(title);
        
        priorities.forEach(priority => {
            const button = document.createElement('button');
            button.textContent = priority.label;
            button.style.cssText = `
                width: 100%;
                padding: 10px;
                margin: 5px 0;
                border: 2px solid ${priority.color};
                border-radius: 8px;
                background: ${quest.priority === priority.value ? priority.color : 'var(--secondary-bg)'};
                color: ${quest.priority === priority.value ? 'white' : priority.color};
                font-family: 'Press Start 2P', monospace;
                font-size: 0.4rem;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            button.addEventListener('click', () => {
                quest.priority = priority.value;
                quest.xpValue = this.getXPValue(priority.value);
                this.saveQuests();
                this.render();
                modal.remove();
                this.playSound('quest-edited');
            });
            
            content.appendChild(button);
        });
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    initializePWAFeatures() {
        // Handle app shortcuts
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        const filter = urlParams.get('filter');
        
        if (action === 'add') {
            setTimeout(() => {
                const questInput = document.getElementById('todoInput');
                if (questInput) {
                    questInput.focus();
                }
            }, 500);
        }
        
        if (filter) {
            setTimeout(() => {
                this.setFilter(filter);
            }, 500);
        }
        
        // Register for push notifications
        if ('Notification' in window && 'serviceWorker' in navigator) {
            this.requestNotificationPermission();
        }
        
        // Handle app visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveQuests();
                this.savePlayerStats();
                this.saveAchievements();
            } else {
                this.checkForAlerts();
            }
        });
        
        // Handle online/offline status
        window.addEventListener('online', () => {
            this.showConnectionStatus('Connection restored!', 'success');
            this.checkForAlerts();
        });
        
        window.addEventListener('offline', () => {
            this.showConnectionStatus('Working offline', 'warning');
        });
    }

    async requestNotificationPermission() {
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('🎮 Task Quest: Notification permission granted');
            }
        }
    }

    showConnectionStatus(message, type) {
        const status = document.createElement('div');
        status.className = `connection-status ${type}`;
        status.textContent = message;
        status.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? 'var(--success-color)' : 'var(--warning-color)'};
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-family: 'Press Start 2P', monospace;
            font-size: 0.5rem;
            z-index: 2000;
            animation: statusSlideIn 0.5s ease-out;
        `;
        
        document.body.appendChild(status);
        
        setTimeout(() => {
            status.style.animation = 'statusSlideOut 0.5s ease-out forwards';
            setTimeout(() => {
                status.remove();
            }, 500);
        }, 3000);
    }

    render() {
        const filteredQuests = this.getFilteredQuests();
        
        // Clear current quests
        this.questList.innerHTML = '';

        // Show/hide empty state
        if (filteredQuests.length === 0) {
            this.emptyState.style.display = 'block';
            this.questList.style.display = 'none';
        } else {
            this.emptyState.style.display = 'none';
            this.questList.style.display = 'block';
        }

        // Render quests
        filteredQuests.forEach(quest => {
            const questElement = this.createQuestElement(quest);
            this.questList.appendChild(questElement);
        });

        // Update stats
        this.updateQuestStats();
    }

    createQuestElement(quest) {
        const li = document.createElement('li');
        li.className = `quest-item ${quest.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', quest.id);

        // Add deadline status classes
        if (quest.deadline && !quest.completed) {
            const deadline = new Date(quest.deadline);
            const now = new Date();
            if (deadline < now) {
                li.classList.add('overdue');
            } else {
                const hoursDiff = (deadline - now) / (1000 * 60 * 60);
                if (hoursDiff <= 24) {
                    li.classList.add('upcoming');
                }
            }
        }

        const categoryEmojis = {
            'general': '📝',
            'work': '💼',
            'personal': '🏠',
            'health': '💪',
            'learning': '📚',
            'shopping': '🛒'
        };

        const deadlineText = quest.deadline ? this.formatDeadline(quest.deadline) : '';

        li.innerHTML = `
            <div class="quest-checkbox ${quest.completed ? 'checked' : ''}" 
                 onclick="taskQuest.toggleQuest(${quest.id})">
            </div>
            <div class="quest-priority-indicator ${quest.priority}"></div>
            <div class="quest-content">
                <span class="quest-text">${this.escapeHtml(quest.text)}</span>
                ${deadlineText ? `<div class="quest-deadline ${this.getDeadlineClass(quest.deadline)}">${deadlineText}</div>` : ''}
            </div>
            <div class="quest-category-badge">${categoryEmojis[quest.category]} ${quest.category.toUpperCase()}</div>
            <div class="quest-actions">
                <button class="quest-action-btn edit-btn" 
                        onclick="taskQuest.editQuest(${quest.id})" 
                        title="Edit Quest">
                    ✏️
                </button>
                <button class="quest-action-btn delete-btn" 
                        onclick="taskQuest.deleteQuest(${quest.id})" 
                        title="Delete Quest">
                    🗑️
                </button>
            </div>
        `;

        return li;
    }

    formatDeadline(deadline) {
        const date = new Date(deadline);
        const now = new Date();
        const diff = date - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diff < 0) {
            return `OVERDUE by ${Math.abs(hours)}h ${Math.abs(minutes)}m`;
        } else if (hours < 1) {
            return `Due in ${minutes}m`;
        } else if (hours < 24) {
            return `Due in ${hours}h ${minutes}m`;
        } else {
            return `Due ${date.toLocaleDateString()}`;
        }
    }

    getDeadlineClass(deadline) {
        const date = new Date(deadline);
        const now = new Date();
        const diff = date - now;
        
        if (diff < 0) {
            return 'overdue';
        } else if (diff < 24 * 60 * 60 * 1000) {
            return 'upcoming';
        }
        return '';
    }

    updateQuestStats() {
        const totalQuests = this.quests.length;
        const activeQuests = this.quests.filter(q => !q.completed).length;
        const completedQuests = totalQuests - activeQuests;
        const overdueQuests = this.quests.filter(q => !q.completed && q.deadline && new Date(q.deadline) < new Date()).length;
        
        let statsText = '';
        switch (this.currentFilter) {
            case 'active':
                statsText = `${activeQuests}`;
                break;
            case 'completed':
                statsText = `${completedQuests}`;
                break;
            case 'overdue':
                statsText = `${overdueQuests}`;
                break;
            default:
                statsText = `${activeQuests}`;
        }
        
        this.todoCount.textContent = statsText;
        this.streakCount.textContent = this.playerStats.streak;
        this.overdueCount.textContent = overdueQuests;
    }

    updatePlayerStats() {
        this.playerLevel.textContent = this.playerStats.level;
        this.playerXP.textContent = this.playerStats.xp;
        this.playerStreak.textContent = this.playerStats.streak;
        this.playerScore.textContent = this.playerStats.score;
        
        // Update progress bar
        const xpNeeded = this.getXPNeededForNextLevel();
        const progress = Math.min(100, (this.playerStats.xp % xpNeeded) / xpNeeded * 100);
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `${Math.round(progress)}% Complete`;
    }

    getXPNeededForNextLevel() {
        return this.playerStats.level * 100;
    }

    checkLevelUp() {
        const xpNeeded = this.getXPNeededForNextLevel();
        if (this.playerStats.xp >= xpNeeded) {
            this.playerStats.level++;
            this.playerStats.xp = 0;
            this.showLevelUpNotification();
            this.playSound('level-up');
        }
    }

    showLevelUpNotification() {
        const notification = this.levelUpNotification;
        const newLevelSpan = document.getElementById('newLevel');
        newLevelSpan.textContent = this.playerStats.level;
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
        
        this.savePlayerStats();
    }

    showXPNotification(xp) {
        // Create floating XP notification
        const notification = document.createElement('div');
        notification.className = 'xp-notification';
        notification.textContent = `+${xp} XP`;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--accent-color);
            color: var(--text-primary);
            padding: 10px 20px;
            border-radius: 20px;
            font-family: 'Press Start 2P', monospace;
            font-size: 0.8rem;
            z-index: 1500;
            animation: xpFloat 2s ease-out forwards;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    checkAchievements() {
        const newAchievements = [];
        
        // Quest completion achievements
        const completedQuests = this.quests.filter(q => q.completed).length;
        if (completedQuests >= 1 && !this.achievements.firstQuest.unlocked) {
            this.achievements.firstQuest.unlocked = true;
            newAchievements.push(this.achievements.firstQuest);
        }
        
        if (completedQuests >= 10 && !this.achievements.questMaster.unlocked) {
            this.achievements.questMaster.unlocked = true;
            newAchievements.push(this.achievements.questMaster);
        }
        
        if (completedQuests >= 50 && !this.achievements.legendaryHero.unlocked) {
            this.achievements.legendaryHero.unlocked = true;
            newAchievements.push(this.achievements.legendaryHero);
        }
        
        // Streak achievements
        if (this.playerStats.streak >= 5 && !this.achievements.streakMaster.unlocked) {
            this.achievements.streakMaster.unlocked = true;
            newAchievements.push(this.achievements.streakMaster);
        }
        
        // Level achievements
        if (this.playerStats.level >= 5 && !this.achievements.levelUp.unlocked) {
            this.achievements.levelUp.unlocked = true;
            newAchievements.push(this.achievements.levelUp);
        }
        
        // Show new achievements
        newAchievements.forEach(achievement => {
            this.showAchievementNotification(achievement);
        });
        
        if (newAchievements.length > 0) {
            this.saveAchievements();
            this.renderAchievements();
        }
    }

    showAchievementNotification(achievement) {
        const notification = this.achievementNotification;
        const title = notification.querySelector('.achievement-title');
        const description = notification.querySelector('.achievement-description');
        const icon = notification.querySelector('.achievement-icon');
        
        title.textContent = achievement.title;
        description.textContent = achievement.description;
        icon.textContent = achievement.icon;
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
        
        this.playSound('achievement');
    }

    renderAchievements() {
        const achievementsList = document.getElementById('achievementsList');
        achievementsList.innerHTML = '';
        
        Object.values(this.achievements).forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            
            achievementElement.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
            `;
            
            achievementsList.appendChild(achievementElement);
        });
    }

    playSound(soundType) {
        if (!this.soundEnabled) return;
        
        // Create audio context for retro sound effects
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const sounds = {
            'quest-accepted': { freq: [200, 300, 400], duration: 0.3, type: 'ascending' },
            'quest-completed': { freq: [400, 500, 600, 700], duration: 0.4, type: 'victory' },
            'quest-uncompleted': { freq: [300, 200, 100], duration: 0.2, type: 'descending' },
            'quest-edited': { freq: [300, 350, 300], duration: 0.2, type: 'bounce' },
            'quest-deleted': { freq: [200, 100, 50], duration: 0.3, type: 'descending' },
            'level-up': { freq: [400, 500, 600, 700, 800], duration: 0.6, type: 'fanfare' },
            'achievement': { freq: [600, 700, 800, 900, 1000], duration: 0.8, type: 'celebration' },
            'error': { freq: [100, 80, 60], duration: 0.3, type: 'error' },
            'filter-change': { freq: [250, 275, 300], duration: 0.15, type: 'click' },
            'category-change': { freq: [275, 300, 325], duration: 0.15, type: 'click' },
            'clear-completed': { freq: [180, 160, 140], duration: 0.3, type: 'sweep' },
            'export': { freq: [350, 400, 450], duration: 0.3, type: 'success' },
            'theme-change': { freq: [500, 600, 700], duration: 0.4, type: 'transition' },
            'deadline-alert': { freq: [800, 600, 800, 600], duration: 0.8, type: 'alert' }
        };
        
        const sound = sounds[soundType] || { freq: [200], duration: 0.1, type: 'simple' };
        
        this.playComplexSound(sound);
    }

    playComplexSound(sound) {
        const { freq, duration, type } = sound;
        
        switch (type) {
            case 'ascending':
                this.playAscendingSound(freq, duration);
                break;
            case 'victory':
                this.playVictorySound(freq, duration);
                break;
            case 'descending':
                this.playDescendingSound(freq, duration);
                break;
            case 'bounce':
                this.playBounceSound(freq, duration);
                break;
            case 'fanfare':
                this.playFanfareSound(freq, duration);
                break;
            case 'celebration':
                this.playCelebrationSound(freq, duration);
                break;
            case 'error':
                this.playErrorSound(freq, duration);
                break;
            case 'alert':
                this.playAlertSound(freq, duration);
                break;
            default:
                this.playSimpleSound(freq[0], duration);
        }
    }

    playSimpleSound(frequency, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playAscendingSound(frequencies, duration) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playSimpleSound(freq, duration / frequencies.length);
            }, index * (duration / frequencies.length) * 1000);
        });
    }

    playVictorySound(frequencies, duration) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.type = 'square';
                
                gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.1);
            }, index * 100);
        });
    }

    playDescendingSound(frequencies, duration) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playSimpleSound(freq, duration / frequencies.length);
            }, index * (duration / frequencies.length) * 1000);
        });
    }

    playBounceSound(frequencies, duration) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playSimpleSound(freq, 0.05);
            }, index * 50);
        });
    }

    playFanfareSound(frequencies, duration) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.type = 'square';
                
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.12);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.12);
            }, index * 120);
        });
    }

    playCelebrationSound(frequencies, duration) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.type = 'square';
                
                gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.16);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.16);
            }, index * 160);
        });
    }

    playErrorSound(frequencies, duration) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.type = 'sawtooth';
                
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.1);
            }, index * 100);
        });
    }

    playAlertSound(frequencies, duration) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.type = 'square';
                
                gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.2);
            }, index * 200);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getNextId() {
        if (this.quests.length === 0) return 1;
        return Math.max(...this.quests.map(q => q.id)) + 1;
    }

    saveQuests() {
        localStorage.setItem('taskQuestQuests', JSON.stringify(this.quests));
        localStorage.setItem('taskQuestNextId', this.nextId.toString());
    }

    loadQuests() {
        const saved = localStorage.getItem('taskQuestQuests');
        const savedId = localStorage.getItem('taskQuestNextId');
        
        if (savedId) {
            this.nextId = parseInt(savedId);
        }
        
        return saved ? JSON.parse(saved) : [];
    }

    savePlayerStats() {
        localStorage.setItem('taskQuestPlayerStats', JSON.stringify(this.playerStats));
    }

    loadPlayerStats() {
        const saved = localStorage.getItem('taskQuestPlayerStats');
        return saved ? JSON.parse(saved) : {
            level: 1,
            xp: 0,
            score: 0,
            streak: 0
        };
    }

    saveAchievements() {
        localStorage.setItem('taskQuestAchievements', JSON.stringify(this.achievements));
    }

    loadAchievements() {
        const saved = localStorage.getItem('taskQuestAchievements');
        return saved ? JSON.parse(saved) : {
            firstQuest: {
                title: 'First Quest',
                description: 'Complete your first quest',
                icon: '🎯',
                unlocked: false
            },
            questMaster: {
                title: 'Quest Master',
                description: 'Complete 10 quests',
                icon: '🏆',
                unlocked: false
            },
            legendaryHero: {
                title: 'Legendary Hero',
                description: 'Complete 50 quests',
                icon: '👑',
                unlocked: false
            },
            streakMaster: {
                title: 'Streak Master',
                description: 'Complete 5 quests in a row',
                icon: '🔥',
                unlocked: false
            },
            levelUp: {
                title: 'Level Up',
                description: 'Reach level 5',
                icon: '⭐',
                unlocked: false
            }
        };
    }
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes xpFloat {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -70%) scale(1.2);
        }
    }
`;
document.head.appendChild(style);

// Initialize the game when DOM is loaded
let taskQuest;
document.addEventListener('DOMContentLoaded', () => {
    taskQuest = new TaskQuestGame();
    
    // Add demo quests if none exist
    if (taskQuest.quests.length === 0) {
        const demoQuests = [
            { 
                id: 1, 
                text: 'Welcome to TASK QUEST! Complete your first quest to begin your adventure!', 
                completed: false, 
                priority: 'easy',
                category: 'general',
                createdAt: new Date().toISOString(),
                xpValue: 10
            },
            { 
                id: 2, 
                text: 'Learn the game mechanics - check off completed quests to earn XP!', 
                completed: true, 
                priority: 'medium',
                category: 'learning',
                createdAt: new Date().toISOString(),
                xpValue: 25
            },
            { 
                id: 3, 
                text: 'Try different quest priorities - Boss quests give the most XP!', 
                completed: false, 
                priority: 'boss',
                category: 'general',
                createdAt: new Date().toISOString(),
                xpValue: 100
            },
            { 
                id: 4, 
                text: 'Unlock achievements by completing quests and maintaining streaks!', 
                completed: false, 
                priority: 'hard',
                category: 'personal',
                createdAt: new Date().toISOString(),
                xpValue: 50
            }
        ];
        
        taskQuest.quests = demoQuests;
        taskQuest.nextId = 5;
        taskQuest.saveQuests();
        taskQuest.render();
        taskQuest.renderAchievements();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to add quest
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        taskQuest.addQuest();
    }
    
    // Escape to clear input
    if (e.key === 'Escape') {
        taskQuest.questInput.value = '';
        taskQuest.questInput.blur();
    }
    
    // Number keys for quick filters
    if (e.key === '1') {
        taskQuest.setFilter('all');
    } else if (e.key === '2') {
        taskQuest.setFilter('active');
    } else if (e.key === '3') {
        taskQuest.setFilter('completed');
    }
});

        // Touch support for mobile
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
            this.initializeTouchGestures();
        }
        
        // PWA features
        this.initializePWAFeatures();