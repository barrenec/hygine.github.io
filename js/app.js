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

fetch('hyginus_translated.json')
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
            storyDiv.innerHTML = `
               <h2>${entry.title.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</h2>
               <div class="text-container">
                   <div class="latin">${entry.content_latin.replace(/\n\n/g, '<br><br>')}</div>
                   <div class="german">${entry.content_german.replace(/\n\n/g, '<br><br>')}</div>
               </div>
            `;

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