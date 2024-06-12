document.addEventListener('DOMContentLoaded', function() {
    const goalForm = document.getElementById('goalForm');
    const progressForm = document.getElementById('progressForm');
    const goalList = document.getElementById('goalList');
    const progressList = document.getElementById('progressList');
    const studySubject = document.getElementById('studySubject');

    const goals = [];
    const progress = [];

    goalForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const subject = document.getElementById('subject').value;
        const hours = document.getElementById('hours').value;

        if (subject.trim() !== "" && hours > 0) {
            const goal = { subject, hours: parseInt(hours), loggedHours: 0 };
            goals.push(goal);

            addGoalToList(goal);
            addSubjectToDropdown(subject);

            goalForm.reset();
        } else {
            alert("Preencha todos os campos corretamente.");
        }
    });

    progressForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const subject = studySubject.value;
        const hours = parseInt(document.getElementById('studyHours').value);

        if (subject !== "" && hours > 0) {
            const progressEntry = { subject, hours };
            progress.push(progressEntry);

            addProgressToList(progressEntry);
            updateGoalProgress(subject, hours);

            progressForm.reset();
        } else {
            alert("Preencha todos os campos corretamente.");
        }
    });

    function addGoalToList(goal) {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = `${goal.subject} - Meta: ${goal.hours} horas`;

        const progressSpan = document.createElement('span');
        progressSpan.className = 'badge badge-primary badge-pill';
        progressSpan.textContent = `Progresso: ${goal.loggedHours} / ${goal.hours}`;
        li.appendChild(progressSpan);

        goalList.appendChild(li);
    }

    function addSubjectToDropdown(subject) {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        studySubject.appendChild(option);
    }

    function addProgressToList(progressEntry) {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = `${progressEntry.subject} - ${progressEntry.hours} horas estudadas`;
        progressList.appendChild(li);
    }

    function updateGoalProgress(subject, hours) {
        const goal = goals.find(goal => goal.subject === subject);
        if (goal) {
            goal.loggedHours += hours;

            const goalItems = goalList.getElementsByClassName('list-group-item');
            for (let item of goalItems) {
                if (item.textContent.includes(goal.subject)) {
                    const progressSpan = item.querySelector('.badge');
                    progressSpan.textContent = `Progresso: ${goal.loggedHours} / ${goal.hours}`;
                }
            }
        }
    }
});
