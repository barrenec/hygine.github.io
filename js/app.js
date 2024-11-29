document.addEventListener('DOMContentLoaded', () => {

    function makeLatinWordsClickable(latinDiv) {
        // Split by paragraphs first
        const paragraphs = latinDiv.innerHTML.split('<br><br>');

        // Process each paragraph
        const processedParagraphs = paragraphs.map(paragraph => {
            const words = paragraph.split(/\s+/);
            return words.map(word => {
                const cleanWord = word.replace(/[.,;:!?]/g, '').toLowerCase();
                return `<span class="latin-word" data-word="${cleanWord}">${word}</span>`;
            }).join(' ');
        });

        // Rejoin with paragraph breaks
        latinDiv.innerHTML = processedParagraphs.join('<br><br>');

        latinDiv.addEventListener('click', (e) => {
            if (e.target.classList.contains('latin-word')) {
                const word = e.target.dataset.word;
                window.open(`https://www.frag-caesar.de/lateinwoerterbuch/${word}-uebersetzung.html`, '_blank');
            }
        });
    }

    fetch('_exam_time_hyginus_translated.json')
        .then(response => response.json())
        .then(data => {
            const nav = document.getElementById('nav');
            const container = document.getElementById('content');
            const hamburger = document.querySelector('.hamburger');
            const navigation = document.querySelector('.navigation');
            const overlay = document.querySelector('.overlay');

            data.forEach(entry => {
                const link = document.createElement('a');
                link.href = `#${entry.title}`;
                link.className = 'nav-link';
                link.textContent = entry.title.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                nav.appendChild(link);

                const storyDiv = document.createElement('div');
                storyDiv.className = 'story';
                storyDiv.id = entry.title;
                // Add this icon beside titles with html_path
                storyDiv.innerHTML = `
                    <h2 class="story-title ${entry.html_path ? 'clickable' : ''}">
                        ${entry.title.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        ${entry.html_path ? `
                        <svg class="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="#8b4513" stroke-width="2"/>
                            <path d="M12 7h.01" stroke="#8b4513" stroke-width="2" stroke-linecap="round"/>
                            <path d="M11 11h1v6h1" stroke="#8b4513" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>` : ''}
                    </h2>
                    <div class="text-container">
                        <div class="latin">${entry.content_latin.replace(/\n\n/g, '<br><br>')}</div>
                        <div class="german">${entry.content_german.replace(/\n\n/g, '<br><br>')}</div>
                    </div>
                    ${entry.html_path ? '<div class="modal" style="display:none;"></div>' : ''}
                `;

                if (entry.html_path) {
                    const title = storyDiv.querySelector('.story-title');
                    const modal = storyDiv.querySelector('.modal');

                    title.addEventListener('click', async () => {
                        try {
                            const response = await fetch(entry.html_path);
                            const html = await response.text();
                            modal.innerHTML = `
                               <div class="modal-content">
                                   <span class="close-button">&times;</span>
                                   <div class="modal-body">${html}</div>
                               </div>
                           `;
                            modal.style.display = 'block';
                            document.body.style.overflow = 'hidden'; // Prevent background scroll

                            // Close handlers
                            const closeModal = () => {
                                modal.style.display = 'none';
                                document.body.style.overflow = 'auto';
                                window.dispatchEvent(new Event('resize'));
                            };

                            const closeButton = modal.querySelector('.close-button');
                            closeButton.addEventListener('click', closeModal);

                            window.addEventListener('click', (event) => {
                                if (event.target === modal) {
                                    closeModal();
                                }
                            });
                        } catch (error) {
                            console.error('Error loading HTML:', error);
                        }
                    });
                }

                const latinDiv = storyDiv.querySelector('.latin');
                makeLatinWordsClickable(latinDiv);
                container.appendChild(storyDiv);
            });

            // Event Listeners
            hamburger.addEventListener('click', () => {
                console.log('Hamburger clicked');
                navigation.classList.toggle('open');
                overlay.classList.toggle('show');
            });

            overlay.addEventListener('click', () => {
                navigation.classList.remove('open');
                overlay.classList.remove('show');
            });

            nav.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-link')) {
                    navigation.classList.remove('open');
                    overlay.classList.remove('show');
                }
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
});