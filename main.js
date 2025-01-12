class View {
    constructor() {
        this.app = document.getElementById('app');

        this.searchLine = this.createElement('div', 'search-line');
        this.searchInput = this.createElement('input', 'search-input');
        this.suggestions = this.createElement('ul', 'suggestions');
        this.searchLine.append(this.searchInput);
        this.searchLine.append(this.suggestions);

        this.reposList = this.createElement('ul', 'repos-list');

        this.app.append(this.searchLine);
        this.app.append(this.reposList);

        this.addStyles();
    };
    createElement(elementTag, elementClass) {
        const element = document.createElement(elementTag);
        if (elementClass) {
            element.classList.add(elementClass);
        }
        return element;
    };

    addStyles() {
        const style = document.createElement('style');
        document.head.appendChild(style);
    };

    clearSuggestions() {
        this.suggestions.innerHTML = '';
        this.suggestions.style.display = 'none';
    };

    showSuggestions(repos) {
        this.clearSuggestions();
        if (repos.length === 0) {
            this.suggestions.style.display = 'none';
            return;
        }
        repos.forEach(repo => {
            const item = this.createElement('li', 'suggestion-item');
            item.textContent = repo.name;
            item.addEventListener('click', () => {
                this.addRepo(repo);
                this.clearSuggestions();
                this.searchInput.value = '';
            });
            this.suggestions.append(item);
        });
        this.suggestions.style.display = 'block'
    };

    addRepo(repo) {
        const repoItem = this.createElement('li', 'repo-item');
        repoItem.innerHTML = `
            <span>Name: ${repo.name}<br> Owner: ${repo.owner.login}<br> Stars: ${repo.stargazers_count}</span>
            <button class="remove-btn"><img src="img/icons.png"></button>
        `;
        repoItem.querySelector('.remove-btn').addEventListener('click', () => {
            repoItem.remove();
            if (this.reposList.children.length === 0) {
                this.reposList.style.display = 'none';
            };
        });
        this.reposList.append(repoItem);
        this.reposList.style.display = 'block';
    };
};

class Search {
    constructor(view) {
        this.view = view;
        this.debounceTimeout = null;
        this.view.searchInput.addEventListener('input', this.debounce(this.searchRepos.bind(this), 500));
    };

    debounce(func, delay) {
        return (...args) => {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => func(...args), delay);
        };
    };

    async searchRepos() {
        const query = this.view.searchInput.value.trim();
        if (!query) {
            this.view.clearSuggestions();
            return;
        };

        try {
            const response = await fetch(`https://api.github.com/search/repositories?q=${this.view.searchInput.value}&per_page=5`);
            if (response.ok) {
                const data = await response.json();
                this.view.showSuggestions(data.items);
            } else {
                this.view.clearSuggestions();
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            this.view.clearSuggestions();
        };
    };
};

document.addEventListener('DOMContentLoaded', () => {
    new Search(new View());
});
