// Otter messages for popup
const otterMessages = {
    popupMessages: [
        "Great job! 🌟",
        "You did it! 🎯",
        "Awesome! 💪",
        "Way to go! 🏃‍♀️",
        "Fantastic! ✨",
        "Keep it up! 🌊",
        "Amazing! 🎉",
        "So proud! 🦦",
        "Crushing it! 🏆",
        "Yes! 🙌",
        "Superstar! ⭐",
        "On fire! 🔥",
        "Nailed it! 🎪",
        "Rock star! 🎸"
    ],
    animalMessages: [
        "Meow! You're purrfect! 🐱",
        "Neigh-ver give up! 🐴",
        "Giddy up! You've got this! 🦄",
        "Pawsitively amazing! 🐾",
        "Trot on, superstar! ✨",
        "You're the cat's meow! 😸"
    ]
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProgress();
    updateProgressSummary();
    
    // Add click handlers to run cells
    const runCells = document.querySelectorAll('.run-cell');
    runCells.forEach(cell => {
        cell.addEventListener('click', toggleRun);
    });
    
    // Add change handlers to week checkboxes
    const weekCheckboxes = document.querySelectorAll('.week-checkbox');
    weekCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateWeekStatus);
    });
    
    // Close celebration modal on click
    document.getElementById('celebrationOtter').addEventListener('click', function() {
        this.classList.remove('show');
    });
    
    // Add click handlers for header animals
    const headerAnimals = document.querySelectorAll('.header-animal');
    headerAnimals.forEach(animal => {
        animal.addEventListener('click', showAnimalEncouragement);
    });
});

// Toggle individual run completion
function toggleRun(e) {
    const cell = e.target;
    const week = cell.dataset.week;
    const run = cell.dataset.run;
    
    cell.classList.toggle('completed');
    
    saveProgress();
    updateProgressSummary();
    checkWeekCompletion(week);
    
    if (cell.classList.contains('completed')) {
        showMessage('Great job! Run marked as complete! 🎉', 'success');
        
        // Show popup otter at click location
        showPopupOtter(cell);
    }
}

// Update week checkbox based on runs completed
function checkWeekCompletion(weekNum) {
    const weekCheckbox = document.querySelector(`.week-checkbox[data-week="${weekNum}"]`);
    const wasChecked = weekCheckbox.checked;
    
    // Get all mandatory runs (first 2 runs only - runs 3 and 4 are both optional)
    let completedMandatoryRuns = 0;
    for (let i = 1; i <= 2; i++) {
        const cell = document.querySelector(`[data-week="${weekNum}"][data-run="${i}"]`);
        if (cell && cell.classList.contains('completed')) {
            completedMandatoryRuns++;
        }
    }
    
    // Week is complete when all 2 mandatory runs are done
    const isNowComplete = completedMandatoryRuns === 2;
    weekCheckbox.checked = isNowComplete;
    
    // If week just became complete, celebrate!
    if (!wasChecked && isNowComplete) {
        showCelebrationOtter();
    }
}

// Handle week checkbox changes
function updateWeekStatus(e) {
    const weekNum = e.target.dataset.week;
    const isChecked = e.target.checked;
    
    if (isChecked) {
        // Mark first 2 runs as complete (mandatory runs only)
        for (let i = 1; i <= 2; i++) {
            const cell = document.querySelector(`[data-week="${weekNum}"][data-run="${i}"]`);
            if (cell) {
                cell.classList.add('completed');
            }
        }
        showMessage('Week marked as complete! 💪', 'success');
        
        // Show celebration otter!
        showCelebrationOtter();
    } else {
        // Unmark all runs
        for (let i = 1; i <= 4; i++) {
            const cell = document.querySelector(`[data-week="${weekNum}"][data-run="${i}"]`);
            if (cell) {
                cell.classList.remove('completed');
            }
        }
    }
    
    saveProgress();
    updateProgressSummary();
}

// Save progress to localStorage
function saveProgress() {
    const progress = {
        completedRuns: [],
        completedWeeks: []
    };
    
    // Save completed runs
    document.querySelectorAll('.run-cell.completed').forEach(cell => {
        progress.completedRuns.push({
            week: cell.dataset.week,
            run: cell.dataset.run
        });
    });
    
    // Save completed weeks
    document.querySelectorAll('.week-checkbox:checked').forEach(checkbox => {
        progress.completedWeeks.push(checkbox.dataset.week);
    });
    
    localStorage.setItem('runningPlanProgress', JSON.stringify(progress));
}

// Load progress from localStorage
function loadProgress() {
    const saved = localStorage.getItem('runningPlanProgress');
    if (!saved) return;
    
    const progress = JSON.parse(saved);
    
    // Restore completed runs
    progress.completedRuns.forEach(item => {
        const cell = document.querySelector(`[data-week="${item.week}"][data-run="${item.run}"]`);
        if (cell) {
            cell.classList.add('completed');
        }
    });
    
    // Restore completed weeks
    progress.completedWeeks.forEach(weekNum => {
        const checkbox = document.querySelector(`.week-checkbox[data-week="${weekNum}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
}

// Update progress summary
function updateProgressSummary() {
    const completedWeeks = document.querySelectorAll('.week-checkbox:checked').length;
    const completedRuns = document.querySelectorAll('.run-cell.completed').length;
    
    document.getElementById('weeksComplete').textContent = completedWeeks;
    document.getElementById('runsComplete').textContent = completedRuns;
}

// Clear all progress
function clearProgress() {
    if (confirm('Are you sure you want to reset all progress?')) {
        // Clear all completed runs
        document.querySelectorAll('.run-cell.completed').forEach(cell => {
            cell.classList.remove('completed');
        });
        
        // Uncheck all weeks
        document.querySelectorAll('.week-checkbox:checked').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Clear localStorage
        localStorage.removeItem('runningPlanProgress');
        
        // Update summary
        updateProgressSummary();
        
        showMessage('Progress has been reset', 'info');
    }
}

// Copy table for Google Sheets
function copyTable() {
    const table = document.getElementById('runningPlan');
    const range = document.createRange();
    range.selectNode(table);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    
    try {
        document.execCommand('copy');
        showMessage('✓ Copied to clipboard!', 'success');
    } catch (err) {
        showMessage('Please select the table manually and copy with Ctrl+C or Cmd+C', 'info');
    }
    
    window.getSelection().removeAllRanges();
}

// Show temporary message
function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type} show`;
    
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 3000);
}

// Show celebration otter modal
function showCelebrationOtter() {
    const modal = document.getElementById('celebrationOtter');
    const completedWeeks = document.querySelectorAll('.week-checkbox:checked').length;
    
    // Update celebration message based on progress
    const messageEl = modal.querySelector('p');
    if (completedWeeks === 1) {
        messageEl.textContent = "First week done! You're off to an amazing start!";
    } else if (completedWeeks === 4) {
        messageEl.textContent = "Halfway there! You're unstoppable!";
    } else if (completedWeeks === 8) {
        messageEl.textContent = "YOU DID IT! 8 weeks complete! 🏆";
    } else {
        messageEl.textContent = `Week ${completedWeeks} complete! Keep crushing it!`;
    }
    
    modal.classList.add('show');
    
    // Optional: Add celebration sound here
    // const audio = new Audio('cheer-sound.mp3');
    // audio.play();
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        modal.classList.remove('show');
    }, 4000);
}

// Show popup otter at clicked cell
function showPopupOtter(cell) {
    const popup = document.getElementById('popupOtter');
    const bubble = popup.querySelector('.speech-bubble');
    
    // Get random message
    const randomMessage = otterMessages.popupMessages[Math.floor(Math.random() * otterMessages.popupMessages.length)];
    bubble.textContent = randomMessage;
    
    // Get cell position
    const rect = cell.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Calculate position (top right of cell)
    let left = rect.right + scrollLeft - 100;
    let top = rect.top + scrollTop - 90;
    
    // Ensure otter stays within viewport
    const popupWidth = 80;
    const popupHeight = 120; // Including speech bubble
    
    // Adjust if too close to right edge
    if (left + popupWidth > window.innerWidth + scrollLeft) {
        left = rect.left + scrollLeft - popupWidth + 20;
    }
    
    // Adjust if too close to top
    if (top < scrollTop) {
        top = rect.bottom + scrollTop + 10;
    }
    
    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
    
    // Show popup
    popup.classList.add('show');
    
    // Hide after 2.5 seconds
    setTimeout(() => {
        popup.classList.remove('show');
    }, 2500);
}

// Show encouragement from header animals
function showAnimalEncouragement(e) {
    const animal = e.currentTarget;
    const randomMessage = otterMessages.animalMessages[Math.floor(Math.random() * otterMessages.animalMessages.length)];
    
    // Create a temporary bubble
    const bubble = document.createElement('div');
    bubble.className = 'animal-bubble';
    bubble.textContent = randomMessage;
    
    // Position it above the animal
    const rect = animal.getBoundingClientRect();
    bubble.style.position = 'absolute';
    bubble.style.left = rect.left + 'px';
    bubble.style.top = (rect.top - 40) + 'px';
    
    document.body.appendChild(bubble);
    
    // Animate in
    setTimeout(() => bubble.classList.add('show'), 10);
    
    // Remove after 2 seconds
    setTimeout(() => {
        bubble.classList.remove('show');
        setTimeout(() => bubble.remove(), 300);
    }, 2000);
}