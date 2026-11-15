window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOMContentLoaded!!');
    const markdown = document.getElementById('source').textContent.trim();
    console.log(markdown);
    document.getElementById('content').innerHTML = marked.parse(markdown);
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

